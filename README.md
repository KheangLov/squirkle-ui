# Squirkle UI

Squircle-first Vue component library — **one source, compiled for Vue 2.7 and Vue 3**, with a Nuxt 2 / 3 / 4 module.

**Live:** [Docs](https://kheanglov.github.io/squirkle-ui/) · [Storybook](https://kheanglov.github.io/squirkle-ui/storybook/) · [Examples](https://kheanglov.github.io/squirkle-ui/examples/)

- **88 core components** (`@squirkle-ui/ui`) in the spirit of Vuetify: layout, buttons, cards, forms & validation, pickers, overlays, navigation, feedback, lists, treeview, virtual & infinite scroll.
- **Squircle engine**: native CSS `corner-shape: squircle` where supported, Figma-accurate SVG squircles (fill, inner stroke, drop shadow) everywhere else.
- **Big data**: shared virtualization engine — 1M-row lists, 100k-option selects, infinite loading.
- **Add-ons** (separate packages): `@squirkle-ui/datagrid` (enterprise data grid: grouping, aggregation, pivot, tree data, master/detail, pinning, editing + undo, range selection, clipboard, CSV, server-side infinite model), `@squirkle-ui/charts`, `@squirkle-ui/swiper`, `@squirkle-ui/calendar`, `@squirkle-ui/map` (MapLibre vector / Leaflet raster, clustering), `@squirkle-ui/icons` (Iconify), `@squirkle-ui/editor` (Tiptap rich-text editor).

## Develop
```bash
pnpm install
pnpm dev            # docs + playground → http://localhost:5180
pnpm build          # Vue 3 + Vue 2 builds of every package
pnpm dev:vue2       # Vue 2.7 + Vite example (after build) → http://localhost:5181
pnpm dev:nuxt       # Nuxt 4 example (after build) → http://localhost:5182
pnpm examples:build # build every example app (after build)
pnpm build:pages    # whole GitHub Pages site (docs, Storybook, examples) → _site/
pnpm test
pnpm typecheck
pnpm storybook      # Storybook (Vue 3, sources) → http://localhost:6006
pnpm build:storybook
```

## Examples
[`examples/`](examples/) has one app per supported framework, all rendering the same page with every package: Vue 3 + Vite, Vue 3 with the all-in-one `squirkle-ui` package, Vue 2.7 + Vite, Vue 2.7 + Vue CLI 5 (webpack 5), Nuxt 4, Nuxt 3 and Nuxt 2.

## Install
```bash
# npm
npm i squirkle-ui vue                          # everything: components + add-ons (squirkle-ui/datagrid, …)
# pnpm
pnpm add squirkle-ui vue

# or pick packages (npm i … / pnpm add …):
pnpm add @squirkle-ui/ui vue                   # core components
pnpm add @squirkle-ui/datagrid @squirkle-ui/map # add-ons as needed
pnpm add @squirkle-ui/nuxt                     # Nuxt 2 / 3 / 4 module
```
Full documentation for npm users: [`packages/squirkle-ui/README.md`](packages/squirkle-ui/README.md).

## Use
```ts
// Vue 3
import { createSquirkle } from '@squirkle-ui/ui'
import '@squirkle-ui/ui/styles.css'
app.use(createSquirkle())

// Vue 2.7
import { createSquirkle } from '@squirkle-ui/ui/vue2'
Vue.use(createSquirkle())

// Nuxt 3 / 4: modules: ['@squirkle-ui/nuxt']   ·   Nuxt 2: buildModules: ['@squirkle-ui/nuxt/nuxt2']
```

### Map (vector tiles)
`SqMap` uses MapLibre GL by default (`pnpm add maplibre-gl`; Leaflet for `engine="raster"`). MapLibre loads a web worker file (`maplibre-gl-worker.mjs`) that bundlers don't copy on their own ("Worker failed to load"). In Vite apps, pass its URL once (excluding MapLibre from dep pre-bundling is optional, as a safety net):
```ts
// main.ts
import { setMapWorkerUrl } from '@squirkle-ui/map'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
setMapWorkerUrl(workerUrl)

// vite.config.ts (optional)
export default defineConfig({ optimizeDeps: { exclude: ['maplibre-gl'] } })
```
The Nuxt 3 / 4 module does both automatically when `addons` includes `'map'` and `maplibre-gl` is installed. Nuxt 2 (webpack) with the vector engine is not verified — use `engine="raster"` there.
