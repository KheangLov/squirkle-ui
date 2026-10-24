// Nuxt 2.17 (Vue 2.7) module: `buildModules: [['@squirkle/nuxt/nuxt2', { addons: ['datagrid'] }]]`
const path = require('path')

const ADDONS = ['datagrid', 'charts', 'swiper', 'calendar', 'map', 'icons']

module.exports = function squirkleNuxt2(moduleOptions) {
  const options = { addons: [], css: true, ...(this.options.squirkle || {}), ...(moduleOptions || {}) }
  const addons = (options.addons || []).filter((a) => ADDONS.includes(a))
  const pkgs = ['ui'].concat(addons)
  if (options.css) for (const pkg of pkgs) this.options.css.push(`@squirkle/${pkg}/styles.css`)
  this.options.build.transpile.push(/@squirkle\//)
  this.addPlugin({
    src: path.resolve(__dirname, 'runtime/nuxt2-plugin.js'),
    fileName: 'squirkle.js',
    options: { addons, runtime: { theme: options.theme, squircle: options.squircle, appearance: options.appearance, icons: options.icons, locale: options.locale } },
  })
}
module.exports.meta = { name: '@squirkle/nuxt' }
