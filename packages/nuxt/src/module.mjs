// Nuxt 3 / Nuxt 4 module: auto-imports every Squirkle component, adds CSS and SSR theme variables.
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { addComponent, addPluginTemplate, defineNuxtModule, extendViteConfig } from '@nuxt/kit'

// Add-on component names are listed statically so the module never has to load add-ons (or Leaflet CSS) in Node.
const ADDON_COMPONENTS = {
  datagrid: ['SqDataGrid'],
  charts: ['SqLineChart', 'SqBarChart', 'SqDonutChart', 'SqSparkline'],
  swiper: ['SqSwiper'],
  calendar: ['SqCalendar'],
  map: ['SqMap'],
  icons: ['SqIconPicker'],
}

export default defineNuxtModule({
  meta: { name: '@squirkle-ui/nuxt', configKey: 'squirkle', compatibility: { nuxt: '>=3.0.0' } },
  defaults: { addons: [], prefix: 'Sq', css: true, theme: undefined, squircle: undefined, appearance: undefined, icons: undefined, locale: undefined },
  async setup(options, nuxt) {
    const addons = (options.addons ?? []).filter((a) => a in ADDON_COMPONENTS)
    const pkgs = ['ui', ...addons]
    const { componentNames: uiNames } = await import('@squirkle-ui/ui')
    for (const pkg of pkgs) {
      for (const name of pkg === 'ui' ? uiNames : ADDON_COMPONENTS[pkg]) {
        addComponent({ name: name.replace(/^Sq/, options.prefix), export: name, filePath: `@squirkle-ui/${pkg}`, mode: pkg === 'map' ? 'client' : 'all' })
      }
    }
    if (options.css) for (const pkg of pkgs) nuxt.options.css.push(`@squirkle-ui/${pkg}/styles.css`)
    nuxt.options.build.transpile.push(...pkgs.map((p) => `@squirkle-ui/${p}`), '@squirkle-ui/core')
    if (addons.includes('map')) addMapSupport(nuxt.options.rootDir)

    const runtimeOptions = { theme: options.theme, squircle: options.squircle, appearance: options.appearance, icons: options.icons, locale: options.locale }
    addPluginTemplate({
      filename: 'squirkle.plugin.mjs',
      getContents: () => `import { defineNuxtPlugin, useHead } from '#imports'
import { createSquirkle, getThemeCss, config } from '@squirkle-ui/ui'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createSquirkle({ ...${JSON.stringify(runtimeOptions)}, components: false }))
  // Theme variables are generated from the app's own config (not user input).
  useHead({
    style: [{ id: 'sq-theme-vars', innerHTML: getThemeCss() }],
    htmlAttrs: { class: 'sq-theme--' + config.theme.name },
  })
})
`,
    })
  },
})

/**
 * MapLibre starts its worker from `new URL('./maplibre-gl-worker.mjs', import.meta.url)`, a file no bundler copies:
 * a client plugin passes a Vite `?url` of the worker to `setMapWorkerUrl` (served in dev, emitted on build).
 * Dep pre-bundling would also move MapLibre into `.vite/deps`, so it stays excluded. The map's other deps are
 * pre-bundled up front so Vite does not discover them at runtime and reload the page.
 */
function addMapSupport(rootDir) {
  const require = createRequire(join(rootDir, 'package.json'))
  const resolve = (id) => { try { return require.resolve(id) } catch { return null } }
  const worker = resolve('maplibre-gl/dist/maplibre-gl-worker.mjs') // optional peers: maplibre-gl (vector), leaflet (raster)
  const hasLeaflet = !!resolve('leaflet/package.json')
  if (worker) {
    addPluginTemplate({
      filename: 'squirkle.map-worker.client.mjs',
      mode: 'client',
      getContents: () => `import { defineNuxtPlugin } from '#imports'
import { setMapWorkerUrl } from '@squirkle-ui/map'
import workerUrl from ${JSON.stringify(worker.replace(/\\/g, '/') + '?url')}

export default defineNuxtPlugin(() => setMapWorkerUrl(workerUrl))
`,
    })
  }
  const add = (list = [], items) => [...list, ...items.filter((i) => !list.includes(i))]
  extendViteConfig((config) => {
    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.exclude = add(config.optimizeDeps.exclude, ['maplibre-gl'])
    config.optimizeDeps.include = add(config.optimizeDeps.include, ['@squirkle-ui/map > supercluster', ...(hasLeaflet ? ['leaflet'] : [])])
  })
}
