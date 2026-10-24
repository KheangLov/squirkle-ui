import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { niceTicks } from '@squirkle-ui/core'

export interface DonutDatum { label: string; value: number; color?: string }

export interface Series { name: string; data: (number | null)[]; color?: string }

/** Validated categorical order (dataviz reference palette); slots are CSS vars so light/dark swap via theme. */
export const seriesColor = (i: number, override?: string) => override ?? `var(--sq-series-${(i % 8) + 1})`

export function useSize(el: Ref<HTMLElement | null>, fallbackHeight: number) {
  const width = ref(600)
  const height = ref(fallbackHeight)
  let ro: ResizeObserver | undefined
  onMounted(() => {
    const measure = () => {
      if (!el.value) return
      width.value = el.value.clientWidth || 600
      height.value = el.value.clientHeight || fallbackHeight
    }
    measure()
    if (typeof ResizeObserver !== 'undefined' && el.value) { ro = new ResizeObserver(measure); ro.observe(el.value) }
  })
  onBeforeUnmount(() => ro?.disconnect())
  return { width, height }
}

export function linearScale(d0: number, d1: number, r0: number, r1: number) {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0)
  return (v: number) => r0 + (v - d0) * k
}

export function yDomain(values: number[], zero = true) {
  let min = Math.min(...values)
  let max = Math.max(...values)
  if (zero) { min = Math.min(0, min); max = Math.max(0, max) }
  if (!isFinite(min) || !isFinite(max)) return { ticks: [0, 1], min: 0, max: 1 }
  if (min === max) max = min + 1
  const ticks = niceTicks(min, max, 5)
  return { ticks, min: ticks[0], max: ticks[ticks.length - 1] }
}

/** Monotone cubic (Fritsch–Carlson) path through points — smooth without overshoot. */
export function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : ''
  const n = pts.length
  const dx: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0])
    m.push((pts[i + 1][1] - pts[i][1]) / (dx[i] || 1))
  }
  const t = [m[0]]
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]))
  t.push(m[n - 2])
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += ` C${pts[i][0] + h},${pts[i][1] + t[i] * h} ${pts[i + 1][0] - h},${pts[i + 1][1] - t[i + 1] * h} ${pts[i + 1][0]},${pts[i + 1][1]}`
  }
  return d
}

export const compact = (v: number, locale = 'en-US') => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(v)

/** Bar with squircle-rounded data end (top for positive, bottom for negative), square at the baseline. */
export function barPath(x: number, y: number, w: number, h: number, r: number, horizontal = false, negative = false): string {
  if (w <= 0 || h <= 0) return ''
  const rr = Math.min(r, (horizontal ? h : w) / 2, horizontal ? w : h)
  const k = rr * 0.45 // control distance → superellipse-like corner
  if (horizontal) {
    if (negative) return `M${x + w},${y} H${x + rr} C${x + rr - k},${y} ${x},${y + rr - k} ${x},${y + rr} V${y + h - rr} C${x},${y + h - rr + k} ${x + rr - k},${y + h} ${x + rr},${y + h} H${x + w} Z`
    return `M${x},${y} H${x + w - rr} C${x + w - rr + k},${y} ${x + w},${y + rr - k} ${x + w},${y + rr} V${y + h - rr} C${x + w},${y + h - rr + k} ${x + w - rr + k},${y + h} ${x + w - rr},${y + h} H${x} Z`
  }
  if (negative) return `M${x},${y} H${x + w} V${y + h - rr} C${x + w},${y + h - rr + k} ${x + w - rr + k},${y + h} ${x + w - rr},${y + h} H${x + rr} C${x + rr - k},${y + h} ${x},${y + h - rr + k} ${x},${y + h - rr} Z`
  return `M${x},${y + h} V${y + rr} C${x},${y + rr - k} ${x + rr - k},${y} ${x + rr},${y} H${x + w - rr} C${x + w - rr + k},${y} ${x + w},${y + rr - k} ${x + w},${y + rr} V${y + h} Z`
}
