import type { PropType } from 'vue'
import { toUnit } from '@squirkle-ui/core'

export const THEME_COLORS = ['primary', 'secondary', 'accent', 'success', 'info', 'warning', 'error', 'surface', 'surface-variant'] as const

/** Theme color name → CSS var; any other CSS color passes through. */
export function colorValue(c?: string | null): string | undefined {
  if (!c) return undefined
  return (THEME_COLORS as readonly string[]).includes(c) ? `var(--sq-${c})` : c
}
export function onColorValue(c?: string | null): string | undefined {
  if (!c) return undefined
  if (c === 'surface' || c === 'surface-variant') return 'var(--sq-on-surface)'
  return (THEME_COLORS as readonly string[]).includes(c) ? `var(--sq-on-${c})` : '#fff'
}

export type Rounded = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'pill' | number | string | boolean
const RADII = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'pill']
export function radiusValue(r: Rounded | undefined, fallback = 'md'): string {
  if (r === undefined || r === true || r === '') return `var(--sq-radius-${fallback})`
  if (r === false || r === 0) return '0px'
  if (typeof r === 'string' && RADII.includes(r)) return `var(--sq-radius-${r})`
  return toUnit(r) as string
}

export const elevationVars = (e?: number | string | null) =>
  e == null || e === '' ? {} : { '--sq-shadow': `var(--sq-elevation-${e})`, '--sq-shadow-filter': `var(--sq-elevation-${e}-filter)` }

export type Size = 'x-small' | 'small' | 'default' | 'large' | 'x-large'
export const sizeProp = { type: String as PropType<Size>, default: 'default' }
export const roundedProp = { type: [String, Number, Boolean] as PropType<Rounded>, default: undefined }
export const colorProp = { type: String, default: undefined }

export type Variant = 'flat' | 'elevated' | 'tonal' | 'outlined' | 'text' | 'plain'
export const variantProp = (d: Variant = 'flat') => ({ type: String as PropType<Variant>, default: d })

/** CSS variables for the standard color × variant matrix used by btn, chip, alert, avatar… */
export function variantVars(variant: Variant, color?: string): Record<string, string> {
  // `surface` colors are neutral: solid variants paint the surface, the others use on-surface ink.
  const neutral = color === 'surface' || color === 'surface-variant'
  if (neutral && variant !== 'flat' && variant !== 'elevated') color = undefined
  const c = colorValue(color) ?? 'var(--sq-on-surface)'
  const on = color ? onColorValue(color)! : 'var(--sq-surface)'
  switch (variant) {
    case 'flat':
    case 'elevated':
      return { '--sq-c': c, '--sq-bg': c, '--sq-fg': on, '--sq-bd': 'transparent' }
    case 'tonal':
      return { '--sq-c': c, '--sq-bg': `color-mix(in srgb, ${c} 14%, transparent)`, '--sq-fg': c, '--sq-bd': 'transparent' }
    case 'outlined':
      return { '--sq-c': c, '--sq-bg': 'transparent', '--sq-fg': c, '--sq-bd': `color-mix(in srgb, ${c} 45%, transparent)`, '--sq-bw': '1px' }
    default:
      return { '--sq-c': c, '--sq-bg': 'transparent', '--sq-fg': c, '--sq-bd': 'transparent' }
  }
}
