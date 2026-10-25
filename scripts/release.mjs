#!/usr/bin/env node
// Prepares a release: builds every package, packs each with pnpm (which turns `workspace:^` into real ranges)
// into .release/, then PRINTS the `npm publish` commands. It never publishes — run the printed commands yourself.
// Why npm for the upload: `npm publish <tarball>` sends the README to the registry; `pnpm publish` did not (0.1.0).
// Usage: node scripts/release.mjs
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = resolve(root, '.release')
// Dependency order: a package is published only after everything it depends on.
const ORDER = ['core', 'ui', 'datagrid', 'swiper', 'calendar', 'map', 'charts', 'icons', 'nuxt', 'squirkle-ui']

execFileSync('node', [resolve(root, 'scripts/build.mjs')], { stdio: 'inherit' })
rmSync(out, { recursive: true, force: true })
mkdirSync(out)

const lines = []
for (const pkg of ORDER) {
  const dir = resolve(root, 'packages', pkg)
  const { name, version } = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8'))
  const before = new Set(readdirSync(out))
  execFileSync('pnpm', ['pack', '--pack-destination', out], { cwd: dir, stdio: ['ignore', 'ignore', 'inherit'] })
  const tgz = readdirSync(out).find((f) => !before.has(f))
  lines.push({ name, version, tgz })
}

console.log('\nPacked into .release/. Publish in this order (replace <code> with your current 2FA code each time):\n')
for (const { tgz } of lines) console.log(`npm publish .release/${tgz} --access public --otp=<code>`)
console.log('\nThen check each README reached npm (should print README.md):\n')
for (const { name } of lines) console.log(`npm view ${name} readmeFilename --prefer-online`)
