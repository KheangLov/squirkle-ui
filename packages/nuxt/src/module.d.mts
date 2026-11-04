import type { NuxtModule } from '@nuxt/schema'
import type { SquirkleOptions } from '@squirkle-ui/ui'

/** Add-on packages the module can register (install each one you enable). */
export type SquirkleAddon = 'datagrid' | 'charts' | 'swiper' | 'calendar' | 'map' | 'icons' | 'editor'

/** Options for the `squirkle` key in `nuxt.config`. */
export interface ModuleOptions extends Pick<SquirkleOptions, 'theme' | 'squircle' | 'appearance' | 'icons' | 'locale'> {
  /** Add-ons to register; only what you installed. Default `[]`. */
  addons?: SquirkleAddon[]
  /** Component prefix replacing `Sq` (`SqBtn` → `<prefix>Btn`). Default `'Sq'`. */
  prefix?: string
  /** Add each package's stylesheet. Default `true`. */
  css?: boolean
}

declare const module: NuxtModule<ModuleOptions>
export default module
