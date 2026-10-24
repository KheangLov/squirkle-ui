import { computed, inject, type Ref } from 'vue'
import { createBrandTheme, defaultThemes, presetThemes, type Appearance } from '@squirkle/core'
import { config, setAppearance } from '../config'

/**
 * Global theme control:
 *   const theme = useTheme()
 *   theme.toggle() · theme.name.value = 'dark'
 *   theme.setBrand('#0bb5c4') · theme.applyPreset('ocean') · theme.setColors({ primary: '#e11d48' })
 *   theme.setAppearance({ font: "'Manrope', sans-serif", radiusScale: 1.2, smoothing: 0.8 })
 */
export function useTheme() {
  const scoped = inject<Ref<string> | null>('sq-theme-scope', null)
  const name = computed<string>({
    get: () => scoped?.value ?? config.theme.name,
    set: (v) => {
      if (config.theme.themes[v]) config.theme.name = v
    },
  })
  const current = computed(() => config.theme.themes[name.value])
  const isDark = computed(() => !!current.value?.dark)
  const toggle = () => {
    const names = Object.keys(config.theme.themes)
    const next = names.find((n) => config.theme.themes[n].dark !== isDark.value)
    if (next) config.theme.name = next
  }
  // Themes are replaced as whole objects so Vue 2 sees every change.
  const setColors = (colors: Record<string, string>, themeName = name.value) => {
    const t = config.theme.themes[themeName]
    if (!t) return
    config.theme.themes = { ...config.theme.themes, [themeName]: { dark: t.dark, colors: { ...t.colors, ...colors } } }
  }
  const setBrand = (primary: string, opts: { secondary?: string; accent?: string } = {}) => {
    config.theme.themes = { ...config.theme.themes, ...createBrandTheme(primary, opts) }
  }
  const applyPreset = (preset: string) => {
    config.theme.themes = { ...config.theme.themes, ...presetThemes(preset) }
  }
  const reset = () => {
    config.theme.themes = { ...config.theme.themes, light: { ...defaultThemes.light, colors: { ...defaultThemes.light.colors } }, dark: { ...defaultThemes.dark, colors: { ...defaultThemes.dark.colors } } }
    setAppearance({ font: undefined, fontMono: undefined, radiusScale: undefined, smoothing: 0.6 })
  }
  return {
    name, current, isDark, toggle, setColors, setBrand, applyPreset, reset,
    setAppearance: (a: Partial<Appearance>) => setAppearance(a),
    appearance: computed(() => config.appearance),
    themes: computed(() => config.theme.themes),
  }
}

export function useLocale() {
  return { messages: computed(() => config.locale.messages), code: computed(() => config.locale.code) }
}
