#!/usr/bin/env node
// Builds library packages in dependency order: core → ui → add-ons.
// Usage: node scripts/build.mjs [pkg ...]   (no args = all)
import { build } from 'vite'
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { libConfig } from '../build/vite.lib.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const ORDER = ['core', 'ui', 'datagrid', 'swiper', 'calendar', 'map', 'charts', 'icons', 'editor']
const requested = process.argv.slice(2)
const pkgs = requested.length ? ORDER.filter((p) => requested.includes(p)) : ORDER

// vue-tsc writes inferred cross-package types as relative paths into a sibling's dist (`../../ui/dist/types/x`),
// which break once installed; point them at the package instead (resolved via its `./dist/types/*` export).
const SIBLING = new RegExp(`(['"])(?:\\.\\./)+(${ORDER.join('|')})/dist/types(/[^'"]*)?\\1`, 'g')
const rewriteSiblingTypes = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name)
    if (e.isDirectory()) rewriteSiblingTypes(f)
    else if (f.endsWith('.d.ts')) {
      const s = readFileSync(f, 'utf8')
      // `.js` is dropped: the `./dist/types/*` export appends `.d.ts` itself.
      const out = s.replace(SIBLING, (_, q, dep, sub) => `${q}@squirkle-ui/${dep}${sub ? `/dist/types${sub.replace(/\.js$/, '')}` : ''}${q}`)
      if (out !== s) writeFileSync(f, out)
    }
  }
}

// webpack 4 (Nuxt 2, Vue CLI 4) ignores `exports`, so `<pkg>/vue2` and `<pkg>/styles.css` must also exist as real paths.
// Exports-aware bundlers keep using the `exports` map; these files are only a fallback (listed in each package's `files`).
const writeWebpack4Entries = (pkgDir) => {
  const dir = resolve(pkgDir, 'vue2')
  mkdirSync(dir, { recursive: true })
  const entry = { private: true, main: '../dist/vue2/index.cjs', module: '../dist/vue2/index.mjs', types: '../dist/types/index.d.ts', sideEffects: ['*.css'] }
  writeFileSync(resolve(dir, 'package.json'), JSON.stringify(entry, null, 2) + '\n')
  const css = resolve(pkgDir, 'dist/styles.css')
  if (existsSync(css)) copyFileSync(css, resolve(pkgDir, 'styles.css'))
}

for (const pkg of pkgs) {
  const pkgDir = resolve(root, 'packages', pkg)
  const started = Date.now()
  if (pkg === 'core') {
    await build(libConfig({ pkgDir, vue: 0 }))
  } else {
    await build(libConfig({ pkgDir, vue: 3 }))
    await build(libConfig({ pkgDir, vue: 2 }))
    const css = resolve(pkgDir, 'dist/vue3/styles.css')
    if (existsSync(css)) copyFileSync(css, resolve(pkgDir, 'dist/styles.css'))
    rmSync(resolve(pkgDir, 'dist/vue2/styles.css'), { force: true })
    writeWebpack4Entries(pkgDir)
  }
  // Type declarations (dist/types) for both Vue builds; throws on any type error.
  execFileSync(resolve(root, 'node_modules/.bin/vue-tsc'), ['-p', resolve(pkgDir, 'tsconfig.build.json')], { stdio: 'inherit' })
  rewriteSiblingTypes(resolve(pkgDir, 'dist/types'))
  console.log(`✓ @squirkle-ui/${pkg} (${Date.now() - started}ms)`)
}

// `squirkle-ui`: all-in-one package of thin re-exports over the built @squirkle-ui/* packages (needs them built first).
if (!requested.length || requested.includes('squirkle-ui')) {
  const out = resolve(root, 'packages/squirkle-ui/dist')
  rmSync(out, { recursive: true, force: true })
  const built = (p) => resolve(root, 'packages', p, p === 'core' ? 'dist/index.mjs' : 'dist/vue3/index.mjs')
  const hasDefault = (p) => /\bas default\b|export default/.test(readFileSync(built(p), 'utf8'))
  const entry = (base, spec, pkg) => {
    const def = hasDefault(pkg) ? `export { default } from '${spec}'\n` : ''
    mkdirSync(dirname(resolve(out, base)), { recursive: true })
    writeFileSync(resolve(out, `${base}.mjs`), `export * from '${spec}'\n${def}`)
    writeFileSync(resolve(out, `${base}.d.ts`), `export * from '${spec}'\n${def}`)
    writeFileSync(resolve(out, `${base}.cjs`), `module.exports = require('${spec}')\n`)
  }
  // Styles are copied, not @import-ed, so any bundler (Vite, webpack 4, Nuxt `css`) loads them as-is.
  const styles = (pkg, to) => copyFileSync(resolve(root, 'packages', pkg, 'dist/styles.css'), resolve(out, to))
  entry('index', '@squirkle-ui/ui', 'ui')
  entry('vue2', '@squirkle-ui/ui/vue2', 'ui')
  entry('core', '@squirkle-ui/core', 'core')
  styles('ui', 'styles.css')
  for (const addon of ORDER.slice(2)) {
    entry(`${addon}/index`, `@squirkle-ui/${addon}`, addon)
    entry(`${addon}/vue2`, `@squirkle-ui/${addon}/vue2`, addon)
    styles(addon, `${addon}/styles.css`)
  }
  console.log('✓ squirkle-ui (re-exports)')
}
