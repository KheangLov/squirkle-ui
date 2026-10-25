const path = require('path')

// Vue CLI 5 (webpack 5) consuming the built packages (`pnpm build` first) through their `exports`.
module.exports = {
  // Add-on dist files target ES2019 already; transpile them for the app's browserslist like any dependency.
  transpileDependencies: [/@squirkle-ui[\\/]/],
  chainWebpack: (config) => {
    // Monorepo only: linked packages would otherwise resolve the repo root's Vue 3.
    config.resolve.alias.set('vue$', path.join(path.dirname(require.resolve('vue/package.json')), 'dist/vue.runtime.esm.js'))
    // Emit MapLibre's worker as a file and import its URL (webpack's answer to Vite's `?url`).
    config.module.rule('maplibre-worker').test(/maplibre-gl-worker\.mjs$/).type('asset/resource')
  },
}
