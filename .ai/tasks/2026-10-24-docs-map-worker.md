# Task: docs app registers the MapLibre worker URL (approved: `go`, 2026-10-24)
Approved prompt + plan: as shown in chat (Implementation Prompt "Senior Vite / Vue 3 engineer for `apps/docs`…", Required Changes 1–3, Plan steps 1–7, confidence 92%).

## Required Changes
1. `apps/docs/src/main.ts`: `setMapWorkerUrl(mapWorkerUrl)` with `import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'`, before `app.mount`.
2. `apps/docs/vite.config.ts`: comment only — `optimizeDeps.exclude` is a safety net.
3. `.claude/launch.json`: `docs-preview` entry (port 5184).

## Evidence before change
`pnpm build:docs` emitted `maplibre-gl-*.js` + CSS, no worker file.

## Checks
- `pnpm test` 36/36 PASS · vue-tsc 0 errors.
- `pnpm build:docs`: emits `dist/assets/maplibre-gl-worker-BrB25tGK.mjs` (518.81 kB) PASS.
- Docs production preview :5184 `#/map` (foreground): worker 200; 3 maps full height (438/418/318 px) with CARTO attribution and markers (88/5/6); styles 3×, sprites 6×, glyphs 11× all 200, 0 failed requests; no console errors PASS. Pixel sampling NOT RUN (production hides component internals).
- Docs dev :5180 `#/map`: worker via `?url` 200; 3 maps full height, style/tiles loaded, 218/224/195 canvas colors; no errors PASS.

## Review (/check-all, 2026-10-24)
- code-reviewer: APPROVE with notes, 0 blockers. MINOR: G5 scope not provable without a git baseline (no commits yet). NIT: `apps/docs/vite.config.ts:15` comment wording ("Safety net only…"). Build/test not re-run by reviewer.
- test-verifier: PASS WITH NOTES. tests 36/36, vue-tsc 0, `build:docs` lists `maplibre-gl-worker-BrB25tGK.mjs`; browser criteria implementer-reported; no automated test covers the worker registration.
- visual-tester: skipped (no `.vue`/`.css` changed).
