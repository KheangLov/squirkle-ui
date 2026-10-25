#!/usr/bin/env node
// Builds every example in examples/ against the built packages (run `pnpm build` first).
// Usage: node scripts/examples.mjs [example ...]   (no args = all). Fails if a Showcase.vue copy drifts from examples/shared.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const EXAMPLES = {
  'vue3-vite': 'src/Showcase.vue',
  'vue3-all-in-one': 'src/Showcase.vue',
  'vue2-vite': 'src/Showcase.vue',
  'vue2-webpack': 'src/Showcase.vue',
  nuxt4: 'app/components/Showcase.vue',
  nuxt3: 'components/Showcase.vue',
  nuxt2: 'components/Showcase.vue',
}
// Excluded from the workspace (own lockfile, `link:` to packages/*): installed and built in place.
const STANDALONE = new Set(['nuxt2'])
const requested = process.argv.slice(2)
const names = requested.length ? requested : Object.keys(EXAMPLES)
const unknown = names.filter((n) => !(n in EXAMPLES))
if (unknown.length) throw new Error(`Unknown example(s): ${unknown.join(', ')}`)
if (!existsSync(resolve(root, 'packages/ui/dist/vue3/index.mjs'))) throw new Error('Packages are not built: run `pnpm build` first.')

const shared = readFileSync(resolve(root, 'examples/shared/Showcase.vue'), 'utf8')
const drifted = Object.entries(EXAMPLES).filter(([n, f]) => readFileSync(resolve(root, 'examples', n, f), 'utf8') !== shared).map(([n, f]) => `examples/${n}/${f}`)
if (drifted.length) throw new Error(`Showcase.vue differs from examples/shared/Showcase.vue in: ${drifted.join(', ')}`)

for (const name of names) {
  const started = Date.now()
  if (STANDALONE.has(name)) {
    const dir = resolve(root, 'examples', name)
    execFileSync('pnpm', ['install', '--frozen-lockfile'], { cwd: dir, stdio: 'inherit' })
    execFileSync('pnpm', ['build'], { cwd: dir, stdio: 'inherit' })
  } else {
    execFileSync('pnpm', ['--filter', `@squirkle-ui/example-${name}`, 'build'], { cwd: root, stdio: 'inherit' })
  }
  console.log(`✓ examples/${name} (${Date.now() - started}ms)`)
}
