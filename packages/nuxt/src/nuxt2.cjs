// Nuxt 2.17 (Vue 2.7) module: `buildModules: [['@squirkle-ui/nuxt/nuxt2', { addons: ['datagrid'] }]]`
const fs = require('fs')
const path = require('path')
const { createRequire } = require('module')

const ADDONS = ['datagrid', 'charts', 'swiper', 'calendar', 'map', 'icons', 'editor']

module.exports = function squirkleNuxt2(moduleOptions) {
  const options = { addons: [], css: true, ...(this.options.squirkle || {}), ...(moduleOptions || {}) }
  const addons = (options.addons || []).filter((a) => ADDONS.includes(a))
  const pkgs = ['ui'].concat(addons)
  if (options.css) for (const pkg of pkgs) this.options.css.push(`@squirkle-ui/${pkg}/styles.css`)
  this.options.build.transpile.push(/@squirkle-ui\//)
  // Tiptap / ProseMirror ship ES2020+ syntax that webpack 4 cannot parse.
  if (addons.includes('editor')) this.options.build.transpile.push(/@tiptap\//, /prosemirror-/)
  const aliases = {
    ...(addons.includes('editor') ? tiptapPmAliases(this.options.rootDir) : {}),
    // webpack 4 cannot parse MapLibre GL 6: the vector engine is unavailable, raster (Leaflet) works.
    ...(addons.includes('map') ? { 'maplibre-gl$': path.resolve(__dirname, 'runtime/maplibre-stub.js'), 'maplibre-gl/dist/maplibre-gl.css$': path.resolve(__dirname, 'runtime/empty.css') } : {}),
  }
  if (Object.keys(aliases).length) this.extendBuild((config) => { config.resolve.alias = Object.assign({}, config.resolve.alias, aliases) })
  this.addPlugin({
    src: path.resolve(__dirname, 'runtime/nuxt2-plugin.js'),
    fileName: 'squirkle.js',
    options: { addons, runtime: { theme: options.theme, squircle: options.squircle, appearance: options.appearance, icons: options.icons, locale: options.locale } },
  })
}
// `@tiptap/pm/<sub>` exists only in its `exports` map, which webpack 4 ignores; resolve each subpath the way Node does.
function tiptapPmAliases(rootDir) {
  try {
    const fromApp = createRequire(path.join(rootDir, 'package.json'))
    const fromCore = createRequire(createRequire(fromApp.resolve('@squirkle-ui/editor')).resolve('@tiptap/core'))
    let dir = path.dirname(fromCore.resolve('@tiptap/pm/model'))
    while (readName(dir) !== '@tiptap/pm' && path.dirname(dir) !== dir) dir = path.dirname(dir)
    const subpaths = Object.keys(JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).exports || {}).filter((k) => k.startsWith('./') && !k.includes('*') && k !== './package.json')
    return Object.fromEntries(subpaths.map((k) => [`@tiptap/pm/${k.slice(2)}$`, fromCore.resolve(`@tiptap/pm/${k.slice(2)}`)]))
  } catch (e) {
    console.warn('[squirkle] could not resolve @tiptap/pm subpaths for webpack 4:', e.message)
    return {}
  }
}
function readName(dir) {
  try { return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).name } catch { return undefined }
}

module.exports.meta = { name: '@squirkle-ui/nuxt' }
