import { watch, type Component } from 'vue'
import { isBrowser } from '@squirkle/core'
import { applyOptions, config, isVue2, syncThemeToDocument, type SquirkleOptions } from './config'
import * as components from './components'

interface PluginTarget {
  component: (name: string, c: Component) => unknown
  config?: { globalProperties?: Record<string, unknown> }
  prototype?: Record<string, unknown>
}

export interface SquirklePlugin {
  install: (app: PluginTarget) => void
}

let themeWatcher: (() => void) | undefined

/**
 * Vue 3: app.use(createSquirkle(opts)) · Vue 2.7: Vue.use(createSquirkle(opts))
 * Pass `components: false` to skip global registration and import components individually (tree-shaking).
 */
export function createSquirkle(options: SquirkleOptions & { components?: boolean | Record<string, Component> } = {}): SquirklePlugin {
  return {
    install(app) {
      applyOptions(options)
      const list = options.components === false ? {} : options.components === true || !options.components ? components : options.components
      for (const [name, comp] of Object.entries(list)) {
        if (name !== 'componentNames') app.component(name, comp as Component)
      }
      const api = { config }
      if (isVue2 && app.prototype) app.prototype.$squirkle = api
      else if (app.config?.globalProperties) app.config.globalProperties.$squirkle = api
      if (isBrowser) {
        syncThemeToDocument()
        themeWatcher?.()
        themeWatcher = watch(() => [config.theme.name, config.theme.themes, config.theme.global, config.appearance], syncThemeToDocument, { deep: true })
      }
    },
  }
}
