import { describe, expect, it } from 'vitest'
import { getSquirclePath, getSquircleStrokePath, niceTicks, compareValues, monthGrid, createThemeCss, defaultThemes, onColor, contrastRatio, createBrandTheme, themePresets, presetThemes, appearanceCss, luminance, isHexColor } from '@squirkle/core'

describe('squircle', () => {
  it('starts and closes the path inside the box', () => {
    const d = getSquirclePath({ width: 100, height: 40, radius: 12, smoothing: 0.6 })
    expect(d.startsWith('M ')).toBe(true)
    expect(d.endsWith('Z')).toBe(true)
    const [x, y] = d.slice(2).split(' ').map(Number)
    expect(x).toBeCloseTo(100 - 12 * 1.6, 3)
    expect(y).toBe(0)
  })
  it('degrades to straight edges with radius 0', () => {
    expect(getSquirclePath({ width: 10, height: 10, radius: 0 })).not.toContain(' a ')
  })
  it('clamps the radius to half of the shortest side', () => {
    const d = getSquirclePath({ width: 100, height: 20, radius: 999, smoothing: 0.6 })
    expect(d).not.toContain('NaN')
  })
  it('returns empty path for empty boxes', () => {
    expect(getSquirclePath({ width: 0, height: 10, radius: 4 })).toBe('')
  })
  it('insets stroke paths by half the stroke width', () => {
    expect(getSquircleStrokePath({ width: 50, height: 50, radius: 10, strokeWidth: 2 })).toMatch(/^M [\d.]+ 1 /)
  })
})

describe('utils', () => {
  it('produces nice ticks', () => expect(niceTicks(0, 97, 5)).toEqual([0, 20, 40, 60, 80, 100]))
  it('sorts nulls last and numbers numerically', () => {
    expect([3, null, 1, 'b', 'a10', 'a2'].sort(compareValues)).toEqual([1, 3, 'a2', 'a10', 'b', null])
  })
  it('builds a 42-day month grid starting on the requested weekday', () => {
    const g = monthGrid(new Date(2026, 9, 15), 1)
    expect(g).toHaveLength(42)
    expect(g[0].getDay()).toBe(1)
  })
})

describe('theme', () => {
  it('emits root vars for the default theme and on-colors', () => {
    const css = createThemeCss(defaultThemes, 'light')
    expect(css).toContain(':root,.sq-theme--light{')
    expect(css).toContain('--sq-on-primary:')
    expect(onColor('#ffffff')).toBe('#0b0d12')
  })
})

describe('theme customization', () => {
  it('gives primary, secondary and error ≥ 4.5:1 text contrast in both default themes', () => {
    for (const t of Object.values(defaultThemes))
      for (const k of ['primary', 'secondary', 'error']) expect(contrastRatio(t.colors[k], onColor(t.colors[k]))).toBeGreaterThanOrEqual(4.5)
  })
  it('builds a brand theme: light keeps 3:1 on surface, dark reaches luminance ≥ 0.18', () => {
    for (const brand of ['#0bb5c4', '#ffee00', '#111111', '#5b5bd6']) {
      const t = createBrandTheme(brand)
      expect(contrastRatio(t.light.colors.primary, t.light.colors.surface)).toBeGreaterThanOrEqual(3)
      expect(luminance(t.dark.colors.primary)!).toBeGreaterThanOrEqual(0.18)
      expect(t.light.colors.background).toBe(defaultThemes.light.colors.background)
    }
  })
  it('keeps brand colors ≥ 4.5:1 against their on-color in every preset and brand theme', () => {
    const themes = [...Object.keys(themePresets).map((n) => presetThemes(n)), ...['#0bb5c4', '#ffee00', '#111111', '#22c55e', '#f97316', '#a3e635'].map((b) => createBrandTheme(b))]
    for (const t of themes)
      for (const mode of ['light', 'dark'])
        for (const k of ['primary', 'secondary', 'accent']) expect(contrastRatio(t[mode].colors[k], onColor(t[mode].colors[k]))).toBeGreaterThanOrEqual(4.5)
  })
  it('has valid preset colors and expands presets to light + dark', () => {
    for (const p of Object.values(themePresets)) expect(isHexColor(p.primary)).toBe(true)
    const ocean = presetThemes('ocean')
    expect(Object.keys(ocean)).toEqual(['light', 'dark'])
    expect(presetThemes('iris').light.colors.primary).toBe(defaultThemes.light.colors.primary)
  })
  it('emits appearance variables and sanitizes fonts', () => {
    expect(appearanceCss({ radiusScale: 0, smoothing: 2, font: "'Geist', sans-serif" })).toBe(":root:root{--sq-font:'Geist', sans-serif;--sq-radius-scale:0;--sq-smoothing:1;}")
    expect(appearanceCss({ font: 'x;}body{color:red' })).not.toContain('}body')
    expect(appearanceCss({})).toBe('')
  })
})
