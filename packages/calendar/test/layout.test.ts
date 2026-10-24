import { describe, expect, it } from 'vitest'
import { layoutDay, normalizeEvent, eventsOnDay } from '../src/layout'

const day = new Date(2026, 9, 24)
const ev = (id: number, h0: number, h1: number) => normalizeEvent({ id, title: `e${id}`, start: new Date(2026, 9, 24, h0), end: new Date(2026, 9, 24, h1) })

describe('calendar layout', () => {
  it('puts overlapping events side by side and separate ones full width', () => {
    const placed = layoutDay([ev(1, 9, 11), ev(2, 10, 12), ev(3, 13, 14)], day)
    const byId = Object.fromEntries(placed.map((p) => [p.ev.id, p]))
    expect([byId[1].col, byId[1].cols]).toEqual([0, 2])
    expect([byId[2].col, byId[2].cols]).toEqual([1, 2])
    expect([byId[3].col, byId[3].cols]).toEqual([0, 1])
    expect(byId[1].top).toBe(540)
    expect(byId[1].height).toBe(120)
  })
  it('lists multi-day and all-day events on each covered day', () => {
    const multi = normalizeEvent({ id: 9, title: 'trip', start: '2026-10-23T10:00', end: '2026-10-25T10:00' })
    expect(eventsOnDay([multi], day)).toHaveLength(1)
  })
})
