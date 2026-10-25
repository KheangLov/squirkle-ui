# Example: Nuxt 2.18 (Vue 2.7, webpack 4)

Squirkle UI on Nuxt 2.18 (Vue 2.7, webpack 4), using `@squirkle-ui/nuxt/nuxt2` module. Renders the shared showcase ([`../shared/Showcase.vue`](../shared/Showcase.vue)).

```bash
pnpm build            # from the repo root: build the packages first
```

```bash
pnpm --dir examples/nuxt2 install   # standalone install (not part of the repo workspace)
pnpm --dir examples/nuxt2 dev       # http://localhost:5188
```

This app has its own `pnpm-workspace.yaml` and `pnpm-lock.yaml` and links the packages with `link:../../packages/*`, because Nuxt 2's server renderer would otherwise load the repo root's Vue 3.

`buildModules: [['@squirkle-ui/nuxt/nuxt2', { addons: [...] }]]`. webpack 4 cannot parse MapLibre GL 6, so the map uses `engine="raster"` (Leaflet); the module stubs `maplibre-gl` and resolves Tiptap's `@tiptap/pm/*` subpaths for webpack 4. `nuxt.config.js` pins `vue` (monorepo only).
