#!/usr/bin/env node
// Builds library packages in dependency order: core → ui → add-ons.
// Usage: node scripts/build.mjs [pkg ...]   (no args = all)
import { build } from 'vite'
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, resolve } from 'node:path'
import { libConfig } from '../build/vite.lib.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const ORDER = ['core', 'ui', 'datagrid', 'swiper', 'calendar', 'map', 'charts', 'icons']
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
      const out = s.replace(SIBLING, (_, q, dep, sub) => `${q}@squirkle/${dep}${sub ? `/dist/types${sub.replace(/\.js$/, '')}` : ''}${q}`)
      if (out !== s) writeFileSync(f, out)
    }
  }
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
  }
  // Type declarations (dist/types) for both Vue builds; throws on any type error.
  execFileSync(resolve(root, 'node_modules/.bin/vue-tsc'), ['-p', resolve(pkgDir, 'tsconfig.build.json')], { stdio: 'inherit' })
  rewriteSiblingTypes(resolve(pkgDir, 'dist/types'))
  console.log(`✓ @squirkle/${pkg} (${Date.now() - started}ms)`)
}
