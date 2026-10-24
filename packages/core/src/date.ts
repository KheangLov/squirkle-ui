/** Minimal, dependency-free date helpers shared by date picker, calendar and datagrid. */

export type DateLike = Date | string | number

export function toDate(v: DateLike | null | undefined): Date | null {
  if (v == null || v === '') return null
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes())
export const addMonths = (d: Date, n: number) => {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1)
  r.setDate(Math.min(d.getDate(), daysInMonth(r)))
  return r
}
export const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
export const isSameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
export const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

export function startOfWeek(d: Date, firstDayOfWeek = 0): Date {
  const day = d.getDay()
  return startOfDay(addDays(d, -((day - firstDayOfWeek + 7) % 7)))
}

/** ISO `YYYY-MM-DD` in local time. */
export function toISODate(d: Date): string {
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** 6×7 grid of dates covering the month of `d`. */
export function monthGrid(d: Date, firstDayOfWeek = 0): Date[] {
  const first = startOfWeek(new Date(d.getFullYear(), d.getMonth(), 1), firstDayOfWeek)
  return Array.from({ length: 42 }, (_, i) => addDays(first, i))
}

export function weekdayNames(locale = 'en-US', firstDayOfWeek = 0, format: 'short' | 'narrow' | 'long' = 'short'): string[] {
  const base = startOfWeek(new Date(2024, 0, 7), firstDayOfWeek)
  const fmt = new Intl.DateTimeFormat(locale, { weekday: format })
  return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(base, i)))
}

export function formatDate(d: DateLike | null | undefined, locale = 'en-US', opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  const date = toDate(d)
  return date ? new Intl.DateTimeFormat(locale, opts).format(date) : ''
}
