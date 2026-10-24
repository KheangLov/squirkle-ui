# Squirkle UI

Squircle-first Vue component library — **one source, compiled for Vue 2.7 and Vue 3**, with a Nuxt 2 / 3 / 4 module.

- **86 core components** (`@squirkle/ui`) in the spirit of Vuetify: layout, buttons, cards, forms & validation, pickers, overlays, navigation, feedback, lists, treeview, virtual & infinite scroll.
- **Squircle engine**: native CSS `corner-shape: squircle` where supported, Figma-accurate SVG squircles (fill, inner stroke, drop shadow) everywhere else.
- **Big data**: shared virtualization engine — 1M-row lists, 100k-option selects, infinite loading.
- **Add-ons** (separate packages): `@squirkle/datagrid` (AG Grid-style: grouping, aggregation, pivot, tree data, master/detail, pinning, editing + undo, range selection, clipboard, CSV, server-side infinite model), `@squirkle/charts`, `@squirkle/swiper`, `@squirkle/calendar`, `@squirkle/map` (MapLibre vector / Leaflet raster, clustering), `@squirkle/icons` (Iconify).

## Develop
```bash
pnpm install
pnpm dev            # docs + playground → http://localhost:5180
pnpm build          # Vue 3 + Vue 2 builds of every package
pnpm dev:vue2       # Vue 2.7 smoke playground (after build) → http://localhost:5181
pnpm test
pnpm typecheck
```

## Use
```ts
// Vue 3
import { createSquirkle } from '@squirkle/ui'
import '@squirkle/ui/styles.css'
app.use(createSquirkle())

// Vue 2.7
import { createSquirkle } from '@squirkle/ui/vue2'
Vue.use(createSquirkle())

// Nuxt 3 / 4: modules: ['@squirkle/nuxt']   ·   Nuxt 2: buildModules: ['@squirkle/nuxt/nuxt2']
```

### Map (vector tiles)
`SqMap` uses MapLibre GL by default (`pnpm add maplibre-gl`; Leaflet for `engine="raster"`). MapLibre loads a web worker file (`maplibre-gl-worker.mjs`) that bundlers don't copy on their own ("Worker failed to load"). In Vite apps, pass its URL once (excluding MapLibre from dep pre-bundling is optional, as a safety net):
```ts
// main.ts
import { setMapWorkerUrl } from '@squirkle/map'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
setMapWorkerUrl(workerUrl)

// vite.config.ts (optional)
export default defineConfig({ optimizeDeps: { exclude: ['maplibre-gl'] } })
```
The Nuxt 3 / 4 module does both automatically when `addons` includes `'map'` and `maplibre-gl` is installed. Nuxt 2 (webpack) with the vector engine is not verified — use `engine="raster"` there.
