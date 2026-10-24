import { describe, expect, it } from 'vitest'
import { filterRows, sortIndices, groupRows, flatten, treeRows, pivotRows, rowLayout, toCsv, parseTsv, matchCondition, aggregate } from '../src/engine'
import type { ColumnDef } from '../src/types'

const rows = [
  { id: 1, name: 'Alice', dept: 'Eng', team: 'Core', salary: 120, joined: '2020-01-10' },
  { id: 2, name: 'bob', dept: 'Eng', team: 'Web', salary: 90, joined: '2021-06-01' },
  { id: 3, name: 'Carol', dept: 'Sales', team: 'EU', salary: 70, joined: '2019-03-15' },
  { id: 4, name: 'dave', dept: 'Sales', team: 'US', salary: null, joined: '2022-11-30' },
  { id: 5, name: 'Eve', dept: 'Eng', team: 'Core', salary: 150, joined: '2018-08-08' },
]
const cols: ColumnDef[] = [
  { field: 'name' },
  { field: 'dept' },
  { field: 'team' },
  { field: 'salary', type: 'number', aggFunc: 'sum' },
  { field: 'joined', type: 'date' },
]
const all = rows.map((_, i) => i)
const rowId = (r: Record<string, unknown>) => String(r.id)

describe('filter', () => {
  it('applies text, number, date, set and quick filters', () => {
    expect(filterRows(rows, cols, { name: { kind: 'text', op: 'startsWith', value: 'A' } }, '')).toEqual([0])
    expect(filterRows(rows, cols, { salary: { kind: 'number', op: 'gte', value: 100 } }, '')).toEqual([0, 4])
    expect(filterRows(rows, cols, { salary: { kind: 'number', op: 'blank' } }, '')).toEqual([3])
    expect(filterRows(rows, cols, { joined: { kind: 'date', op: 'lt', value: '2020-01-01' } }, '')).toEqual([2, 4])
    expect(filterRows(rows, cols, { dept: { kind: 'set', values: ['Sales'] } }, '')).toEqual([2, 3])
    expect(filterRows(rows, cols, {}, 'core')).toEqual([0, 4])
  })
  it('ignores empty conditions', () => {
    expect(matchCondition('x', { kind: 'text', op: 'contains', value: '' })).toBe(true)
  })
})

describe('sort', () => {
  it('multi-sorts with nulls last and case-insensitive text', () => {
    const s = sortIndices(rows, all, cols, [{ colId: 'dept', sort: 'asc' }, { colId: 'salary', sort: 'desc' }])
    expect(s.map((i) => rows[i].id)).toEqual([5, 1, 2, 3, 4])
    expect(sortIndices(rows, all, cols, [{ colId: 'name', sort: 'asc' }]).map((i) => rows[i].name)).toEqual(['Alice', 'bob', 'Carol', 'dave', 'Eve'])
  })
  it('sorts dates chronologically', () => {
    expect(sortIndices(rows, all, cols, [{ colId: 'joined', sort: 'asc' }]).map((i) => rows[i].id)).toEqual([5, 3, 1, 2, 4])
  })
})

describe('group + flatten', () => {
  it('groups with aggregates and respects expansion', () => {
    const g = groupRows(rows, all, cols, ['dept'])
    expect(g.map((x) => [x.key, x.leaves.length, x.agg.salary])).toEqual([['Eng', 3, 360], ['Sales', 2, 70]])
    const collapsed = flatten(rows, all, g, { expanded: new Set(), rowId })
    expect(collapsed.map((r) => r.kind)).toEqual(['group', 'group'])
    const open = flatten(rows, all, g, { expanded: new Set([g[0].id]), rowId })
    expect(open.map((r) => r.kind)).toEqual(['group', 'data', 'data', 'data', 'group'])
  })
  it('supports nested groups and expand-all with collapse exceptions', () => {
    const g = groupRows(rows, all, cols, ['dept', 'team'])
    const flat = flatten(rows, all, g, { expanded: new Set(), expandAll: true, collapsed: new Set([g[1].id]), rowId })
    expect(flat.filter((r) => r.kind === 'group').length).toBe(4)
  })
  it('inserts detail rows after open masters', () => {
    const flat = flatten(rows, [0, 1], null, { expanded: new Set(), rowId, detailOpen: new Set(['1']) })
    expect(flat.map((r) => r.kind)).toEqual(['data', 'detail', 'data'])
  })
})

describe('tree data', () => {
  it('builds filler parents from data paths', () => {
    const t = [{ p: ['A'] }, { p: ['A', 'x'] }, { p: ['B', 'y'] }]
    const nodes = treeRows(t, [0, 1, 2], [], (r) => r.p as string[])
    expect(nodes.map((n) => n.key)).toEqual(['A', 'B'])
    const flat = flatten(t, [0, 1, 2], nodes, { expanded: new Set(), expandAll: true, rowId: (_r, i) => String(i), tree: true })
    expect(flat.map((r) => r.kind)).toEqual(['group', 'data', 'group', 'data'])
  })
})

describe('pivot', () => {
  it('turns pivot values into columns', () => {
    const { rows: out, columns } = pivotRows(rows, all, cols, ['dept'], 'team')
    expect(columns.map((c) => c.colId)).toEqual(['dept', 'Core__salary', 'EU__salary', 'US__salary', 'Web__salary'])
    expect(out.find((r) => r.dept === 'Eng')?.Core__salary).toBe(270)
  })
})

describe('utils', () => {
  it('computes mixed-height layouts', () => {
    const l = rowLayout([{ kind: 'data', id: 'a', data: null, level: 0 }, { kind: 'detail', id: 'b', data: null, level: 0 }, { kind: 'data', id: 'c', data: null, level: 0 }], 40, 200)
    expect(l.total).toBe(280)
    expect(l.indexAt(239)).toBe(1)
    expect(l.indexAt(240)).toBe(2)
  })
  it('escapes CSV and parses TSV', () => {
    expect(toCsv(['a', 'b'], [['1,2', 'say "hi"']])).toBe('a,b\r\n"1,2","say ""hi"""')
    expect(parseTsv('1\t2\n3\t4\n')).toEqual([['1', '2'], ['3', '4']])
  })
  it('aggregates', () => {
    expect(aggregate([1, 2, 3, null], 'avg')).toBe(2)
    expect(aggregate([1, 2, 3], 'max')).toBe(3)
  })
  it('handles 100k rows sort + filter quickly', () => {
    const big = Array.from({ length: 100_000 }, (_, i) => ({ id: i, v: (i * 7919) % 100_003, s: `name ${i % 977}` }))
    const t0 = performance.now()
    const f = filterRows(big, [{ field: 'v', type: 'number' }, { field: 's' }], { v: { kind: 'number', op: 'gt', value: 50_000 } }, '')
    sortIndices(big, f, [{ field: 'v', type: 'number' }], [{ colId: 'v', sort: 'desc' }])
    expect(performance.now() - t0).toBeLessThan(400)
  })
})
