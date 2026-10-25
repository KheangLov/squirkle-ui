# Example: Vue 2.7 + Vue CLI 5 (webpack 5)

Squirkle UI on Vue 2.7 + Vue CLI 5 (webpack 5), using `@squirkle-ui/*/vue2` builds. Renders the shared showcase ([`../shared/Showcase.vue`](../shared/Showcase.vue)).

```bash
pnpm build            # from the repo root: build the packages first
```

```bash
pnpm --filter @squirkle-ui/example-vue2-webpack dev   # http://localhost:5189
```

`vue.config.js` emits MapLibre's worker as an asset (`type: 'asset/resource'`) so `import url from 'maplibre-gl/dist/maplibre-gl-worker.mjs'` returns its URL, and pins `vue` (monorepo only).
