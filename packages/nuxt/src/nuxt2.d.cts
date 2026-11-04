import type { SquirkleOptions } from '@squirkle-ui/ui'

declare namespace squirkleNuxt2 {
  /** Add-on packages the module can register (install each one you enable). */
  type SquirkleAddon = 'datagrid' | 'charts' | 'swiper' | 'calendar' | 'map' | 'icons' | 'editor'

  /** Options for `['@squirkle-ui/nuxt/nuxt2', options]` in `buildModules`, or the `squirkle` key. */
  interface ModuleOptions extends Pick<SquirkleOptions, 'theme' | 'squircle' | 'appearance' | 'icons' | 'locale'> {
    /** Add-ons to register; only what you installed. Default `[]`. */
    addons?: SquirkleAddon[]
    /** Component name prefix, replacing `Sq` (`'X'` gives `XBtn`). Letters and digits, starting with a letter. Default `'Sq'`. */
    prefix?: string
    /** Add each package's stylesheet. Default `true`. */
    css?: boolean
  }
}

/** Nuxt 2 module (Vue 2.7, webpack 4). */
declare function squirkleNuxt2(this: unknown, moduleOptions?: squirkleNuxt2.ModuleOptions): void

export = squirkleNuxt2
