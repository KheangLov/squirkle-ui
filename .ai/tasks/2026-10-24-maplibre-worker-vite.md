# Task: MapLibre worker under Vite pre-bundling (approved: `go`, 2026-10-24)
Approved prompt + plan: as shown in chat (Implementation Prompt "Senior Nuxt module and Vite engineer…", Required Changes 1–3, Plan steps 1–8, confidence 80%).

## Required Changes
1. `packages/nuxt/src/module.mjs`: with the `map` add-on, `extendViteConfig(…, { server: false })` appends `maplibre-gl` to `optimizeDeps.exclude` (deduped, keeps app entries).
2. Same hook: append `@squirkle/map > supercluster` to `optimizeDeps.include`, plus `leaflet` only when resolvable from `rootDir`.
3. `README.md`: map description (MapLibre vector / Leaflet raster) + "Map (vector tiles)" note (Vite exclude snippet, Nuxt 3/4 automatic, Nuxt 2 / webpack vector NOT verified → `engine="raster"`).

4. `packages/map/src/SqMap.vue` (approved `go` after scope STOP): mount when the canvas ref exists, otherwise watch the ref and mount once (Nuxt `createClientOnly` hydration placeholder).

## STOP conditions
- Nuxt production build/preview shows a worker error.
- Nuxt dev first load still hangs on the spinner with a cleared cache.

## Checks
- Changes 1–3 implemented. Deviation: dropped `{ server: false }` from `extendViteConfig` (Nuxt 4.6 deprecation warning; exclude is harmless server-side).
- `pnpm test` 36/36 PASS · vue-tsc 0 errors.
- Nuxt 4 dev: log shows "Re-optimizing dependencies because vite config has changed"; `supercluster` pre-bundled at startup (no runtime discovery); after client-side remount `maplibre-gl.mjs` + `maplibre-gl-worker.mjs` load from the package, no worker error, style/tiles loaded, canvas 156 distinct colors PASS. Cache dir not cleared (deletion denied); config-hash re-optimization used instead.
- First SSR load: FAIL → STOP condition 2. Root cause: Nuxt `createClientOnly` renders a placeholder during hydration and sets `mounted$` in its own `onMounted`; `SqMap`'s `onMounted(mount)` sees `el.value === null` and returns without retrying. Fix needs `packages/map/src/SqMap.vue` (outside approved files).
- Nuxt prod build + preview: NOT RUN. Plain Vite snippet check (Vue 2 playground): NOT RUN.
- Change 4 implemented. Build (Vue 2 + 3) PASS · tests 36/36 · vue-tsc 0.
- Nuxt 4 dev, full first SSR load (foreground tab): map ready without remount, worker loaded, style/tiles loaded, 156 distinct canvas colors, no worker/hydration errors PASS.
- Nuxt production build: builds, but no `maplibre-gl-worker.mjs` is emitted; the bundled chunk resolves the worker as `new URL('./maplibre-gl-worker.mjs', import.meta.url)` → `/_nuxt/maplibre-gl-worker.mjs` (missing) unless `setWorkerUrl` is set → STOP condition 1 (static evidence; preview server NOT RUN). Plain Vite check: NOT RUN (stopped).
5. (approved `go` after scope STOP 2) `setMapWorkerUrl` export (`packages/map/src/adapters.ts`, `index.ts`); Nuxt client plugin `squirkle.map-worker.client.mjs` importing the resolved worker path with `?url`; README snippet; `.claude/launch.json` `nuxt-preview` entry.
- Change 5 implemented. Build (Vue 2 + 3) PASS, `setMapWorkerUrl` in both dists · tests 36/36 · vue-tsc 0.
- Nuxt production: build emits `_nuxt/maplibre-gl-worker.BrB25tGK.mjs` (519 kB); preview :5183 full load: worker 200, style/sprites/glyphs 200 (0 failed), marker + CARTO attribution, SSR theme class, no console errors PASS.
- Nuxt dev full load (foreground): worker via `?url` 200, style/tiles loaded, 156 canvas colors, no errors PASS.
- Plain Vite (Vue 2.7 playground, no exclude, pre-bundled maplibre): `setMapWorkerUrl(?url)` → ready, style/tiles loaded, 182 canvas colors, 31 clusters, no errors PASS. → `exclude` is a safety net, not required, once the worker URL is set.
- Nuxt 2 vector: NOT RUN.

## Review (/check-all, 2026-10-24)
- code-reviewer: APPROVE with notes (0 blockers). test-verifier: PASS WITH NOTES (tests 36/36, vue-tsc clean, dual build; browser criteria implementer-reported; dist/nuxt build not re-run — tool access). visual-tester: PASS WITH NOTES (docs light/dark/raster, Nuxt full load OK; 375 px NOT CONFIRMED; blank maps 2–3 in screenshots → re-checked by JS: all 3 docs maps full height, style+tiles loaded, 195–224 canvas colors).
- User approved in chat: dropping `{ server: false }`, and the review fixes below.
- Fixes applied: worker path normalized to `/` before `?url` (Windows; simulated `C:\…` → `C:/…`); README marks `optimizeDeps.exclude` optional; `SqMap.vue` watcher `return mount()`; ADR 0004 wording ("fails in dev when pre-bundled").
- Recheck: build (Vue 2 + 3) PASS · tests 36/36 · vue-tsc 0 · Nuxt dev full load in a fresh tab: map ready, style/tiles loaded, 156 colors, worker 200, no console errors. The first load right after server start (during dep re-optimization, 503/504) logged 7× `ReferenceError: document is not defined`; not reproduced on reload or in a fresh tab — cause UNKNOWN.
- Open: 375 px manual check; Nuxt 2 vector NOT RUN; docs app production build does not call `setMapWorkerUrl` (follow-up); no automated tests for `module.mjs` / `setMapWorkerUrl` / deferred mount.
