import { createRequire } from 'module'
import { dirname, join } from 'path'

const require = createRequire(import.meta.url)

// @squirkle-ui/nuxt on Nuxt 2.18 (Vue 2.7, webpack 4), using the built dist of each package (run `pnpm build` first).
export default {
  telemetry: false,
  components: true,
  buildModules: [['@squirkle-ui/nuxt/nuxt2', { addons: ['datagrid', 'charts', 'swiper', 'calendar', 'map', 'icons', 'editor'] }]],
  build: {
    extend(config, { isClient }) {
      // Monorepo only: linked packages would otherwise resolve the repo root's Vue 3. A normal app has one Vue.
      config.resolve.alias.vue$ = join(dirname(require.resolve('vue/package.json')), isClient ? 'dist/vue.runtime.esm.js' : 'dist/vue.runtime.common.js')
    },
  },
}
