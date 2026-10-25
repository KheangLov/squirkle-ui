# Task: example projects for every supported framework/version (approved: `go`, 2026-10-25)
Approved prompt + plan: as shown in chat (revised plan after risk spikes; tier L; confidence 85%).
- Package fixes for webpack 4 consumers: physical `vue2/package.json` + root `styles.css` per package (build script, `files`); `nuxt2.cjs` aliases `@tiptap/pm/*` (editor) and stubs `maplibre-gl` (map → raster only on Nuxt 2).
- `examples/`: vue3-vite, vue3-all-in-one, vue2-vite (moved from apps/playground-vue2), vue2-webpack (Vue CLI 5), nuxt4 (moved from apps/playground-nuxt), nuxt3, nuxt2; `pnpm examples:build`; launch entries; READMEs; `.ai/` updates.
Dependencies approved: nuxt@3.21.11, nuxt@2.18.1, @vue/cli-service@5.0.9 + @vue/cli-plugin-babel, Nuxt 2 runtime packages (ufo, vue-meta, vue-router, vuex, vue-client-only, vue-no-ssr, unfetch, node-fetch-native, core-js@^3), leaflet in nuxt2.
Spike evidence (scratchpad): Nuxt 3 build + SSR with @nuxt/kit 4 PASS; Nuxt 2 on Node 24 needs no OpenSSL flag; Nuxt 2 fails on `exports`-only subpaths (ours + @tiptap/pm), missing hoisted runtime deps, monorepo Vue 3 leak; MapLibre 6 unparseable by webpack 4 (even via Babel); raster map PASS.

## Checks (2026-10-25)
- `pnpm build` 9 packages + umbrella PASS (now writes `vue2/package.json` + root `styles.css` per package) · `pnpm test` 47/47 PASS · `pnpm typecheck` 0 errors.
- `pnpm examples:build`: vue3-vite, vue3-all-in-one, vue2-vite, vue2-webpack, nuxt4, nuxt3 PASS; Showcase drift check PASS. nuxt2 first FAILED in the workspace (`vue-server-renderer@2.7.16` resolved the root's `vue@3.5.44`); per the user's choice it is now standalone (`'!examples/nuxt2'`, own `pnpm-workspace.yaml` + lockfile, `link:` deps) → `pnpm examples:build` all 7 PASS.
- Browser (same script on each: 8 sections render, Select placeholder, DateTime field, Timeline width, grid rows, 2 charts, Swiper next, map canvas 258 px, editor Italic → v-model, text field v-model, console): vue3-vite, vue3-all-in-one, vue2-vite (prod preview), vue2-webpack (dev), nuxt4 (prod SSR + hydration), nuxt3 (prod SSR + hydration) PASS, vector map everywhere, no console errors. Nuxt SSR ids still from `useId` (`sq-editor-v-4`).
- Fixed during implementation: ui Vue 2 dist imported `useId` by name (webpack 5 build error) → `Reflect.get` in `composables/id.ts`.
- Nuxt 2 (prod `nuxt start`, :5188): SSR HTML 200 with theme vars, DateTime value, Swiper slides, editor toolbar; browser check PASS with `engine="raster"`, no console errors.
- Not run: `vite dev` for the Vue 2 Vite example (prod preview used — port 5181 was held by another session's server).
