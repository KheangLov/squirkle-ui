# @squirkle-ui/nuxt

Nuxt module for [Squirkle UI](https://www.npmjs.com/package/squirkle-ui): auto-imports components, adds the styles, renders theme CSS on the server (no flash of the wrong theme) and sets up add-ons such as the map.

## Install
```bash
npm i @squirkle-ui/nuxt @squirkle-ui/ui
pnpm add @squirkle-ui/nuxt @squirkle-ui/ui
# plus each add-on you enable, e.g.
npm i @squirkle-ui/datagrid @squirkle-ui/map maplibre-gl
pnpm add @squirkle-ui/datagrid @squirkle-ui/map maplibre-gl
```

## Nuxt 3 / 4
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@squirkle-ui/nuxt'],
  squirkle: {
    addons: ['datagrid', 'charts', 'swiper', 'calendar', 'map', 'icons', 'editor'], // only what you installed
    prefix: 'Sq',                       // component prefix (SqBtn, SqCard, …)
    css: true,                          // add the package stylesheets
    theme: { defaultTheme: 'light' },
    squircle: { mode: 'auto' },
    appearance: { radiusScale: 1.1 },
    icons: { api: false },              // offline icons
    locale: { code: 'en' },
  },
})
```
- `SqMap` is client-only. With `map` enabled the module registers MapLibre's worker and keeps it out of Vite's dependency pre-bundling.
- `useTheme()` works in components; theme CSS is rendered into `<head>` with `<html class="sq-theme--light">`.

## Nuxt 2
```js
// nuxt.config.js
export default {
  buildModules: [['@squirkle-ui/nuxt/nuxt2', { addons: ['datagrid'] }]],
}
```
Nuxt 2 bundles with webpack 4, which ignores package `exports`; the packages ship `vue2/` and `styles.css` fallbacks for it, and the module:
- transpiles `@squirkle-ui/*` (and Tiptap / ProseMirror with the `editor` add-on) and resolves Tiptap's `@tiptap/pm/*` subpaths;
- with the `map` add-on, replaces `maplibre-gl` with a stub — webpack 4 cannot parse MapLibre GL 6. Use `<SqMap engine="raster">` (install `leaflet`); the vector engine needs webpack 5 or Vite.

With pnpm, also add the packages Nuxt 2's generated app imports (`ufo`, `vue-meta`, `vue-router`, `vuex`, `vue-client-only`, `vue-no-ssr`, `unfetch`, `node-fetch-native`, `core-js@3`) to your app's dependencies — pnpm does not hoist them. Working setup: [`examples/nuxt2`](https://github.com/KheangLov/squirkle-ui/tree/main/examples/nuxt2).

## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
