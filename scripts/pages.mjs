#!/usr/bin/env node
// Builds the GitHub Pages site into _site/: docs at the root, Storybook at /storybook/, every example at /examples/<name>/.
// Usage: node scripts/pages.mjs   (PAGES_BASE=/squirkle-ui/ by default — the repo's Pages path; use `/` for a custom domain)
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const base = (process.env.PAGES_BASE || '/squirkle-ui/').replace(/\/?$/, '/')
const site = resolve(root, '_site')

// name → how to build it and where its static output lands. Nuxt apps are pre-rendered with `nuxt generate`.
const EXAMPLES = [
  { name: 'vue3-vite', title: 'Vue 3 + Vite', note: 'scoped @squirkle-ui/* packages', out: 'dist' },
  { name: 'vue3-all-in-one', title: 'Vue 3 · all-in-one', note: 'only the squirkle-ui package', out: 'dist' },
  { name: 'vue2-vite', title: 'Vue 2.7 + Vite', note: '/vue2 builds', out: 'dist' },
  { name: 'vue2-webpack', title: 'Vue 2.7 + Vue CLI 5', note: 'webpack 5', out: 'dist' },
  { name: 'nuxt4', title: 'Nuxt 4', note: '@squirkle-ui/nuxt, pre-rendered', out: '.output/public', script: 'generate' },
  { name: 'nuxt3', title: 'Nuxt 3', note: '@squirkle-ui/nuxt, pre-rendered', out: '.output/public', script: 'generate' },
  { name: 'nuxt2', title: 'Nuxt 2', note: 'webpack 4, raster map, pre-rendered', out: 'dist', script: 'generate', standalone: true },
]

const run = (args, opts = {}) => execFileSync('pnpm', args, { cwd: root, stdio: 'inherit', ...opts, env: { ...process.env, ...opts.env } })
const step = (label, fn) => {
  const started = Date.now()
  fn()
  console.log(`✓ ${label} (${Date.now() - started}ms)`)
}

rmSync(site, { recursive: true, force: true })
mkdirSync(site, { recursive: true })

step('packages', () => run(['build']))
step('docs', () => {
  run(['--filter', '@squirkle-ui/docs', 'build'], { env: { BASE_PATH: base, VITE_PAGES: 'true' } })
  cpSync(resolve(root, 'apps/docs/dist'), site, { recursive: true })
})
step('storybook', () => {
  run(['--filter', '@squirkle-ui/storybook', 'build'])
  cpSync(resolve(root, 'apps/storybook/storybook-static'), resolve(site, 'storybook'), { recursive: true })
})
for (const ex of EXAMPLES) {
  step(`examples/${ex.name}`, () => {
    const dir = resolve(root, 'examples', ex.name)
    const exBase = `${base}examples/${ex.name}/`
    const env = { BASE_PATH: exBase, NUXT_APP_BASE_URL: exBase }
    if (ex.standalone) {
      run(['install', '--frozen-lockfile'], { cwd: dir })
      run([ex.script ?? 'build'], { cwd: dir, env })
    } else {
      run(['--filter', `@squirkle-ui/example-${ex.name}`, ex.script ?? 'build'], { env })
    }
    cpSync(resolve(dir, ex.out), resolve(site, 'examples', ex.name), { recursive: true })
  })
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
writeFileSync(
  resolve(site, 'examples/index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Squirkle UI examples</title>
<style>
  :root { color-scheme: light dark; --bg: #f8f9fb; --card: #fff; --fg: #1c2024; --muted: #60646c; --bd: #e0e1e6; --accent: #5b5bd6; }
  @media (prefers-color-scheme: dark) { :root { --bg: #0f1013; --card: #18191c; --fg: #edeef0; --muted: #b0b4ba; --bd: #2e3035; --accent: #8b8dff; } }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.5 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
  main { max-width: 880px; margin: 0 auto; padding: 48px 16px 80px; }
  h1 { margin: 0 0 8px; font-size: 32px; letter-spacing: -0.02em; }
  p { margin: 0 0 24px; color: var(--muted); }
  ul { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
  a.card { display: block; padding: 16px 18px; border: 1px solid var(--bd); border-radius: 18px; background: var(--card); color: inherit; text-decoration: none; }
  a.card:hover { border-color: var(--accent); }
  a.card b { display: block; font-size: 17px; }
  a.card span { color: var(--muted); font-size: 14px; }
  nav a { color: var(--accent); margin-inline-end: 16px; }
</style>
</head>
<body>
<main>
  <nav><a href="${base}">Docs</a><a href="${base}storybook/">Storybook</a></nav>
  <h1>Examples</h1>
  <p>The same page — every Squirkle UI package — built with each supported framework from the built npm packages.</p>
  <ul>
${EXAMPLES.map((ex) => `    <li><a class="card" href="${base}examples/${ex.name}/"><b>${esc(ex.title)}</b><span>${esc(ex.note)}</span></a></li>`).join('\n')}
  </ul>
</main>
</body>
</html>
`,
)
// Serve files and folders that start with `_` (Nuxt's `_nuxt/`) as-is.
writeFileSync(resolve(site, '.nojekyll'), '')
console.log(`\nSite ready in _site/ (base ${base})`)
