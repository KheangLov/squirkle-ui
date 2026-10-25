# @squirkle-ui/nuxt

Nuxt module for [Squirkle UI](https://www.npmjs.com/package/squirkle-ui): auto-imports components, adds the styles, renders theme CSS on the server (no flash of the wrong theme) and sets up add-ons such as the map.

## Install
```bash
npm i @squirkle-ui/nuxt @squirkle-ui/ui
# plus each add-on you enable, e.g.
npm i @squirkle-ui/datagrid @squirkle-ui/map maplibre-gl
```

## Nuxt 3 / 4
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@squirkle-ui/nuxt'],
  squirkle: {
    addons: ['datagrid', 'charts', 'swiper', 'calendar', 'map', 'icons'], // only what you installed
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

## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
