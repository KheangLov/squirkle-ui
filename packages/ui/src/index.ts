import './styles/index.css'

export * from './components'
export { createSquirkle, type SquirklePlugin } from './plugin'
export { config, applyOptions, setAppearance, getThemeCss, syncThemeToDocument, t, type SquirkleOptions, type SquircleMode, type LocaleMessages } from './config'
export { useTheme, useLocale } from './composables/theme'
export { themePresets, createBrandTheme, presetThemes, contrastRatio, type ThemePreset, type Appearance } from '@squirkle-ui/core'
export { provideGroup, useGroupItem, type GroupContext } from './composables/group'
export { useResizeObserver, useClickOutside, type Location } from './composables/dom'
export type { Variant, Size, Rounded } from './composables/style'
export { useVirtual, type VirtualOptions, type VirtualItem } from './composables/virtual'
export { addIcons, addCollection, resolveIcon, builtinIcons, type IconData } from './icons'

// Internal: add-on plumbing, not covered by semver. May change in any release.
export { useProxiedModel, vModel } from './composables/model'
export { useUid } from './composables/id'
export { colorValue, onColorValue, radiusValue, variantVars, elevationVars } from './composables/style'
export { computePosition, nextZIndex, lockScroll, unlockScroll } from './composables/dom'
export { iconStoreVersion } from './icons'
export { isVue2 } from './config'

import { createSquirkle } from './plugin'
export default createSquirkle
