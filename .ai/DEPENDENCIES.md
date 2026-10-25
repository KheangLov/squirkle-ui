# DEPENDENCIES
Purpose: important packages and external integrations. (INTEGRATIONS merged here.)
Read when: adding/upgrading a dependency (CONFIRM per G4) or touching an integration.

| PACKAGE | PURPOSE | USED BY | CONSTRAINTS | REPLACEMENT RISK |
|---|---|---|---|---|
| vue 3.5.44 | Vue 3 runtime/compiler (dev) | packages (peer `^2.7 \|\| ^3.3`), docs | docs alias the full build | low |
| vue2 → npm:vue@2.7.16 | Vue 2.7 SFC compiler for dual build | `build/vite.lib.mjs` | must stay 2.7.x | high (Vue 2 build) |
| vite 7.3.7 | lib + docs build | all | plugin-vue2 supports vite ≤ 7 | medium — do not jump to vite 8 until plugin-vue2 does |
| @vitejs/plugin-vue 6.0.10 / plugin-vue2 2.3.4 | SFC compilation | build | — | medium |
| typescript 5.9.3, vue-tsc 3.3.13 | type-check + `.d.ts` emit in `scripts/build.mjs` | root | TS 7 not adopted | low |
| vitest 3.2.7, happy-dom 20 | tests | root | — | low |
| vue-router 4.6.4 | docs routing | apps/docs | — | low |
| leaflet 1.9.4 | raster maps | @squirkle-ui/map (optional peer, lazy) | browser-only | medium |
| maplibre-gl 6.15.0 | vector maps (default engine) | @squirkle-ui/map (optional peer + dev, lazy chunk ~800 kB) | browser-only; WebGL; worker file is not bundled → `setMapWorkerUrl` with a bundler `?url` (README); `optimizeDeps.exclude` as a safety net | medium |
| supercluster 9.1.0 | marker clustering | @squirkle-ui/map (dependency) | pure JS | low |
| @tiptap/core, @tiptap/pm, @tiptap/starter-kit 3.32.0 | rich-text editing | @squirkle-ui/editor (dependencies, external in `build/vite.lib.mjs`) | framework-free core keeps one source for Vue 2/3; ES2020+ syntax (Nuxt 2 transpiles it) | medium |
| storybook, @storybook/vue3-vite, @storybook/addon-docs 10.6.3 | component workbench | apps/storybook (dev only) | Vue 3 only; ESM-only | low |
| @nuxt/kit 4.6.2 | Nuxt 3/4 module | @squirkle-ui/nuxt | ESM only | low |
| nuxt 4.6.2 / 3.21.11 / 2.18.1 | SSR examples | examples/nuxt4, nuxt3, nuxt2 | dev-only consumers; Nuxt 2 = webpack 4 (no `exports`; MapLibre 6 unparseable → raster only) and needs its runtime packages as direct deps under pnpm; standalone install (`examples/nuxt2/pnpm-lock.yaml`, excluded from the workspace) because `vue-server-renderer` resolves the root's Vue 3 otherwise; install scripts of `nuxt`, `fsevents`, `core-js` blocked | low |
| @vue/cli-service, @vue/cli-plugin-babel 5.0.9 | Vue 2.7 + webpack 5 example | examples/vue2-webpack | maintenance-mode tool; webpack 5 enforces ESM exports strictly | low |

## Integrations
| Integration | Where | Notes |
|---|---|---|
| Iconify API | `packages/ui/src/icons.ts`, `packages/icons/src/SqIconPicker.vue` | batched `/{prefix}.json?icons=`, `/search`; configurable/disable via `icons.api` |
| OpenStreetMap tiles | `packages/map/src/SqMap.vue` | raster engine `tileUrl` prop |
| Vector styles (CARTO basemaps, OpenFreeMap) | `packages/map/src/adapters.ts` `MAP_STYLES` | keyless; `mapStyle` accepts any style URL/object |
| Figma MCP | Claude Code | `claude mcp list` (2026-10-24): `figma: https://mcp.figma.com/mcp (HTTP) - ✔ Connected` — read-only use (G4/G7) |
| Analytics / backend / auth / storage | — | none |
