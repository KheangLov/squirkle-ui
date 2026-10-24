/** Theme definitions → CSS custom properties. Framework-agnostic so Nuxt can inline it during SSR. */

export interface ThemeDefinition {
  dark: boolean
  colors: Record<string, string>
}

export type ThemeMap = Record<string, ThemeDefinition>

/** Default "Iris" palette — Radix-inspired steps; on-colors are picked for maximum contrast. */
export const defaultThemes: ThemeMap = {
  light: {
    dark: false,
    colors: {
      primary: '#5b5bd6',
      secondary: '#8e4ec6',
      accent: '#e93d82',
      success: '#30a46c',
      info: '#0090ff',
      warning: '#ffb224',
      error: '#d93036',
      background: '#f8f9fb',
      surface: '#ffffff',
      'surface-variant': '#f1f2f5',
      'surface-raised': '#ffffff',
      'on-background': '#1c2024',
      'on-surface': '#1c2024',
      'on-surface-variant': '#60646c',
      muted: '#80838d',
      border: '#e3e4e9',
      'border-strong': '#cdced6',
      overlay: '#0b0d12',
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: '#6262e0',
      secondary: '#9152cc',
      accent: '#f0569a',
      success: '#3dd68c',
      info: '#3b9eff',
      warning: '#ffc53d',
      error: '#d93036',
      background: '#0f1013',
      surface: '#18191c',
      'surface-variant': '#222327',
      'surface-raised': '#1d1e22',
      'on-background': '#edeef0',
      'on-surface': '#edeef0',
      'on-surface-variant': '#b0b4ba',
      muted: '#7d828a',
      border: '#2b2d31',
      'border-strong': '#3a3d43',
      overlay: '#000000',
    },
  },
}

export interface ThemePreset {
  label: string
  primary: string
  secondary?: string
  accent?: string
}

/** Brand presets; each expands to a light + dark pair via createBrandTheme. */
export const themePresets: Record<string, ThemePreset> = {
  iris: { label: 'Iris', primary: '#5b5bd6', secondary: '#8e4ec6', accent: '#e93d82' },
  ocean: { label: 'Ocean', primary: '#0a7ac2', secondary: '#0d9488', accent: '#6366f1' },
  forest: { label: 'Forest', primary: '#18794e', secondary: '#4d7c0f', accent: '#c2410c' },
  sunset: { label: 'Sunset', primary: '#c2410c', secondary: '#be185d', accent: '#ca8a04' },
  rose: { label: 'Rose', primary: '#d6336c', secondary: '#9333ea', accent: '#ea580c' },
  graphite: { label: 'Graphite', primary: '#3a3f4b', secondary: '#64748b', accent: '#0a7ac2' },
  mint: { label: 'Mint', primary: '#0d9488', secondary: '#0a7ac2', accent: '#e93d82' },
}

const SEMANTIC = ['primary', 'secondary', 'accent', 'success', 'info', 'warning', 'error']
const INK = '#0b0d12'

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
}
const rgbToHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`

export const isHexColor = (c: string) => hexToRgb(c) !== null

/** WCAG relative luminance; null when the color is not a hex value. */
export function luminance(color: string): number | null {
  const rgb = hexToRgb(color)
  if (!rgb) return null
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two hex colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a) ?? 0
  const lb = luminance(b) ?? 0
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Text color (near-black or white) with the higher contrast on `bg`. */
export function onColor(bg: string): string {
  if (!isHexColor(bg)) return '#ffffff'
  return contrastRatio(bg, '#ffffff') >= contrastRatio(bg, INK) ? '#ffffff' : INK
}

/** Mixes `color` toward `target` by `amount` (0–1) in sRGB. */
export function mixColors(color: string, target: string, amount: number): string {
  const a = hexToRgb(color)
  const b = hexToRgb(target)
  if (!a || !b) return color
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * amount))
}

/** Adjusts a brand color until it contrasts ≥ `min` against `surface` (darkens on light, lightens on dark). */
function ensureContrast(color: string, surface: string, min: number): string {
  const dark = (luminance(surface) ?? 1) < 0.2
  let c = color
  for (let i = 0; i < 20 && contrastRatio(c, surface) < min; i++) c = mixColors(c, dark ? '#ffffff' : '#000000', 0.08)
  return c
}

/** Steps a color away from the mid-luminance band where neither white nor ink text reaches 4.5:1. */
function ensureReadable(color: string, toward: string): string {
  let c = color
  for (let i = 0; i < 20 && contrastRatio(c, onColor(c)) < 4.5; i++) c = mixColors(c, toward, 0.04)
  return c
}

/**
 * Light + dark themes from one brand color (and optional secondary/accent), on top of the default neutrals.
 * The dark variant is lightened until its luminance is ≥ 0.18 or it reaches 3:1 against the dark background.
 * Both variants then keep ≥ 4.5:1 against their on-color.
 */
export function createBrandTheme(primary: string, opts: { secondary?: string; accent?: string; base?: ThemeMap } = {}): ThemeMap {
  const base = opts.base ?? defaultThemes
  const light = base.light ?? defaultThemes.light
  const dark = base.dark ?? defaultThemes.dark
  const brand = (c: string | undefined, fallback: string) => (c && isHexColor(c) ? c : fallback)
  const forLight = (c: string) => ensureReadable(ensureContrast(c, light.colors.surface, 3), '#000000')
  const forDark = (c: string) => {
    let out = ensureContrast(c, dark.colors.background, 3)
    for (let i = 0; i < 20 && (luminance(out) ?? 0) < 0.18; i++) out = mixColors(out, '#ffffff', 0.06)
    return ensureReadable(out, '#ffffff')
  }
  const p = brand(primary, light.colors.primary)
  const s = brand(opts.secondary, light.colors.secondary)
  const a = brand(opts.accent, light.colors.accent)
  return {
    light: { dark: false, colors: { ...light.colors, primary: forLight(p), secondary: forLight(s), accent: forLight(a) } },
    dark: { dark: true, colors: { ...dark.colors, primary: forDark(p), secondary: forDark(s), accent: forDark(a) } },
  }
}

export function presetThemes(name: string, base?: ThemeMap): ThemeMap {
  const p = themePresets[name] ?? themePresets.iris
  return name === 'iris' && !base ? mergeThemes(defaultThemes) : createBrandTheme(p.primary, { secondary: p.secondary, accent: p.accent, base })
}

export function mergeThemes(base: ThemeMap, overrides?: Partial<Record<string, Partial<ThemeDefinition>>>): ThemeMap {
  const out: ThemeMap = {}
  for (const [k, v] of Object.entries(base)) out[k] = { dark: v.dark, colors: { ...v.colors } }
  for (const [k, v] of Object.entries(overrides ?? {})) {
    if (!v) continue
    const parent = out[k] ?? out[v.dark ? 'dark' : 'light']
    out[k] = { dark: v.dark ?? parent.dark, colors: { ...parent.colors, ...(v.colors ?? {}) } }
  }
  return out
}

export function themeVars(theme: ThemeDefinition): string {
  const lines = [`color-scheme: ${theme.dark ? 'dark' : 'light'};`]
  for (const [k, v] of Object.entries(theme.colors)) lines.push(`--sq-${k}: ${v};`)
  for (const k of SEMANTIC) {
    if (theme.colors[k] && !theme.colors[`on-${k}`]) lines.push(`--sq-on-${k}: ${onColor(theme.colors[k])};`)
  }
  return lines.join('')
}

/** CSS text for every theme. The default theme also applies to `:root`. */
export function createThemeCss(themes: ThemeMap, defaultTheme = 'light'): string {
  return Object.entries(themes)
    .map(([name, t]) => `${name === defaultTheme ? ':root,' : ''}.sq-theme--${name}{${themeVars(t)}}`)
    .join('\n')
}

export interface Appearance {
  /** CSS font-family list for UI text. */
  font?: string
  fontMono?: string
  /** Multiplies every radius token (0 = square, 1 = default). */
  radiusScale?: number
  /** Squircle corner smoothing 0–1. */
  smoothing?: number
}

/** `:root` variables for appearance settings (only the ones that are set). */
export function appearanceCss(a: Appearance): string {
  const v: string[] = []
  const safeFont = (f: string) => f.replace(/[;{}<>]/g, '')
  if (a.font) v.push(`--sq-font:${safeFont(a.font)};`)
  if (a.fontMono) v.push(`--sq-font-mono:${safeFont(a.fontMono)};`)
  if (a.radiusScale != null && isFinite(a.radiusScale)) v.push(`--sq-radius-scale:${Math.max(0, a.radiusScale)};`)
  if (a.smoothing != null && isFinite(a.smoothing)) v.push(`--sq-smoothing:${Math.max(0, Math.min(1, a.smoothing))};`)
  // `:root:root` outranks the token defaults in tokens.css even though the theme <style> is injected first.
  return v.length ? `:root:root{${v.join('')}}` : ''
}
