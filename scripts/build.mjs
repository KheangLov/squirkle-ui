#!/usr/bin/env node
// Builds library packages in dependency order: core → ui → add-ons.
// Usage: node scripts/build.mjs [pkg ...]   (no args = all)
import { build } from 'vite'
import { copyFileSync, existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { libConfig } from '../build/vite.lib.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const ORDER = ['core', 'ui', 'datagrid', 'swiper', 'calendar', 'map', 'charts', 'icons']
const requested = process.argv.slice(2)
const pkgs = requested.length ? ORDER.filter((p) => requested.includes(p)) : ORDER

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
  console.log(`✓ @squirkle/${pkg} (${Date.now() - started}ms)`)
}
