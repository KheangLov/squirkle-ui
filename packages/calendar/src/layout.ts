/** Pure layout helpers for SqCalendar (unit-tested). */
export interface CalendarEvent {
  id: string | number
  title: string
  start: Date | string
  end?: Date | string
  color?: string
  allDay?: boolean
  [key: string]: unknown
}

export interface NormEvent { ev: CalendarEvent; start: Date; end: Date }

export function normalizeEvent(ev: CalendarEvent): NormEvent {
  const start = new Date(ev.start)
  const end = ev.end ? new Date(ev.end) : new Date(start.getTime() + (ev.allDay ? 864e5 : 36e5))
  return { ev, start, end: end > start ? end : new Date(start.getTime() + 15 * 6e4) }
}

export interface Placed extends NormEvent { col: number; cols: number; top: number; height: number }

/**
 * Side-by-side layout for timed events of one day: overlapping events share the width in columns.
 * top/height are in minutes from midnight.
 */
export function layoutDay(events: NormEvent[], day: Date): Placed[] {
  const d0 = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
  const d1 = d0 + 864e5
  const items = events
    .filter((e) => !e.ev.allDay && e.start.getTime() < d1 && e.end.getTime() > d0)
    .map((e) => ({ ...e, s: Math.max(e.start.getTime(), d0), f: Math.min(e.end.getTime(), d1) }))
    .sort((a, b) => a.s - b.s || b.f - a.f)
  const out: Placed[] = []
  let cluster: (typeof items[number] & { col: number })[] = []
  let clusterEnd = -1
  const flush = () => {
    const cols = Math.max(1, ...cluster.map((c) => c.col + 1))
    for (const c of cluster) out.push({ ev: c.ev, start: c.start, end: c.end, col: c.col, cols, top: (c.s - d0) / 6e4, height: Math.max(15, (c.f - c.s) / 6e4) })
    cluster = []
  }
  for (const it of items) {
    if (it.s >= clusterEnd && cluster.length) flush()
    const used = new Set(cluster.filter((c) => c.f > it.s).map((c) => c.col))
    let col = 0
    while (used.has(col)) col++
    cluster.push({ ...it, col })
    clusterEnd = Math.max(clusterEnd, it.f)
  }
  if (cluster.length) flush()
  return out
}

export const eventsOnDay = (events: NormEvent[], day: Date) => {
  const d0 = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
  const d1 = d0 + 864e5
  return events.filter((e) => e.start.getTime() < d1 && e.end.getTime() > d0).sort((a, b) => Number(!!b.ev.allDay) - Number(!!a.ev.allDay) || a.start.getTime() - b.start.getTime())
}
