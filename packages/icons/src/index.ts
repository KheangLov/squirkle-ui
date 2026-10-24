import { addCollection, addIcons, applyOptions, resolveIcon } from '@squirkle/ui'
import SqIconPicker from './SqIconPicker.vue'

export { SqIconPicker, addCollection, addIcons }
export const componentNames = ['SqIconPicker'] as const

/** `$alias` presets mapping friendly names to popular Iconify sets. */
export const aliasPresets = {
  mdi: { home: 'mdi:home-outline', user: 'mdi:account-outline', settings: 'mdi:cog-outline', bell: 'mdi:bell-outline', heart: 'mdi:heart-outline', cart: 'mdi:cart-outline', chart: 'mdi:chart-box-outline', mail: 'mdi:email-outline', github: 'mdi:github' },
  lucide: { home: 'lucide:home', user: 'lucide:user', settings: 'lucide:settings', bell: 'lucide:bell', heart: 'lucide:heart', cart: 'lucide:shopping-cart', chart: 'lucide:bar-chart-3', mail: 'lucide:mail', github: 'lucide:github' },
} as const

/** Registers a preset so `<SqIcon icon="$home">` resolves to that set. */
export function useIconPreset(name: keyof typeof aliasPresets) {
  applyOptions({ icons: { aliases: { ...aliasPresets[name] } } })
}

/** Warms the icon cache (batched Iconify API request) before icons render. */
export function preloadIcons(names: string[]) {
  names.forEach((n) => resolveIcon(n))
}
