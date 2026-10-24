export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

let uid = 0
export const nextId = (prefix = 'sq') => `${prefix}-${++uid}`

export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

/** Reads a nested value with a dot path: get(row, 'address.city'). */
export function getByPath(obj: unknown, path: string): unknown {
  if (obj == null || !path) return undefined
  if (path in (obj as object)) return (obj as Record<string, unknown>)[path]
  return path.split('.').reduce<unknown>((acc, k) => (acc == null ? undefined : (acc as Record<string, unknown>)[k]), obj)
}

/** Converts a size prop (number or CSS string) into a CSS length. */
export const toUnit = (v: string | number | undefined | null, unit = 'px') =>
  v == null || v === '' ? undefined : typeof v === 'number' || /^\d+(\.\d+)?$/.test(v) ? `${v}${unit}` : v

export function debounce<T extends (...args: never[]) => void>(fn: T, wait = 150) {
  let t: ReturnType<typeof setTimeout> | undefined
  const d = (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
  d.cancel = () => clearTimeout(t)
  return d
}

export function rafThrottle<T extends (...args: never[]) => void>(fn: T) {
  let frame = 0
  let last: Parameters<T>
  return (...args: Parameters<T>) => {
    last = args
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0
      fn(...last)
    })
  }
}

/** Locale-aware, null-safe comparison used by sort pipelines. */
const collator = typeof Intl !== 'undefined' ? new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }) : null
export function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0
  if (a == null || a === '') return 1
  if (b == null || b === '') return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? -1 : 1
  return collator ? collator.compare(String(a), String(b)) : String(a).localeCompare(String(b))
}

/** "Nice" axis ticks for charts. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min]
  const span = max - min
  const step0 = Math.pow(10, Math.floor(Math.log10(span / count)))
  const err = (count / span) * step0
  const step = step0 * (err <= 0.15 ? 10 : err <= 0.35 ? 5 : err <= 0.75 ? 2 : 1)
  const start = Math.floor(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + step * 0.5; v += step) ticks.push(Math.round(v / step) * step)
  return ticks
}

export function downloadText(filename: string, text: string, mime = 'text/plain') {
  if (!isBrowser) return
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
