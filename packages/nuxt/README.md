# @squirkle-ui/nuxt

Nuxt 2, 3 and 4 module for Squirkle UI.

```bash
npm i @squirkle-ui/nuxt @squirkle-ui/ui
```
```ts
// nuxt.config.ts (Nuxt 3 / 4)
export default defineNuxtConfig({
  modules: ['@squirkle-ui/nuxt'],
  squirkle: { addons: ['datagrid', 'map'], theme: { defaultTheme: 'light' } },
})

// Nuxt 2: buildModules: [['@squirkle-ui/nuxt/nuxt2', { addons: ['datagrid'] }]]
```
Install each add-on you list in `addons` (`@squirkle-ui/datagrid`, `@squirkle-ui/map`, …). With `map`, the module also registers MapLibre's worker for you.

Part of [Squirkle UI](https://github.com/KheangLov/squirkle-ui) · MIT License
