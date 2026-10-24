import './styles/index.css'

export * from './components'
export { createSquirkle, type SquirklePlugin } from './plugin'
export { config, applyOptions, setAppearance, getThemeCss, syncThemeToDocument, isVue2, t, type SquirkleOptions, type SquircleMode, type LocaleMessages } from './config'
export { useTheme, useLocale } from './composables/theme'
export { themePresets, createBrandTheme, presetThemes, contrastRatio, type ThemePreset, type Appearance } from '@squirkle-ui/core'
export { useProxiedModel, vModel } from './composables/model'
export { useUid } from './composables/id'
export { provideGroup, useGroupItem, type GroupContext } from './composables/group'
export { useResizeObserver, useClickOutside, computePosition, nextZIndex, lockScroll, unlockScroll, type Location } from './composables/dom'
export { colorValue, onColorValue, radiusValue, variantVars, elevationVars, type Variant, type Size, type Rounded } from './composables/style'
export { useVirtual, type VirtualOptions, type VirtualItem } from './composables/virtual'
export { addIcons, addCollection, resolveIcon, builtinIcons, iconStoreVersion, type IconData } from './icons'

import { createSquirkle } from './plugin'
export default createSquirkle
