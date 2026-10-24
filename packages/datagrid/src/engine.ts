/**
 * Pure, framework-free data pipeline for SqDataGrid:
 *   rows → quick filter → column filters → sort → group / tree (+ aggregation) → flatten (+ detail rows)
 * Every stage is a separate function so the Vue layer can cache each one in its own computed.
 */
import { compareValues, getByPath, toDate } from '@squirkle-ui/core'
import type { AggFunc, CellValue, ColumnDef, DisplayRow, FilterCondition, FilterModel, RowData, SortItem } from './types'

export const colIdOf = <T extends RowData>(c: ColumnDef<T>) => c.colId ?? c.field ?? c.headerName ?? ''

export function makeGetter<T extends RowData>(col: ColumnDef<T>): (row: T) => CellValue {
  if (col.valueGetter) return col.valueGetter
  const f = col.field
  if (!f) return () => undefined
  if (!f.includes('.')) return (row) => (row as RowData)[f]
  return (row) => getByPath(row, f)
}

export function filterKindOf<T extends RowData>(col: ColumnDef<T>): FilterCondition['kind'] {
  if (typeof col.filter === 'string') return col.filter
  return col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : col.type === 'boolean' ? 'set' : 'text'
}

const isBlank = (v: CellValue) => v == null || v === ''

export function matchCondition(value: CellValue, c: FilterCondition): boolean {
  if (c.kind === 'set') {
    if (!c.values) return true
    return c.values.some((x) => x === value || (isBlank(x) && isBlank(value)) || String(x) === String(value))
  }
  const op = c.op ?? (c.kind === 'text' ? 'contains' : 'equals')
  if (op === 'blank') return isBlank(value)
  if (op === 'notBlank') return !isBlank(value)
  if (c.value == null || c.value === '') return true
  if (c.kind === 'text') {
    const v = String(value ?? '').toLowerCase()
    const q = String(c.value).toLowerCase()
    switch (op) {
      case 'contains': return v.includes(q)
      case 'notContains': return !v.includes(q)
      case 'equals': return v === q
      case 'notEqual': return v !== q
      case 'startsWith': return v.startsWith(q)
      case 'endsWith': return v.endsWith(q)
      default: return true
    }
  }
  const toNum = (x: CellValue) => (c.kind === 'date' ? toDate(x as string)?.getTime() ?? NaN : Number(x))
  const v = toNum(value)
  const a = toNum(c.value)
  if (isNaN(v)) return false
  switch (op) {
    case 'equals': return c.kind === 'date' ? Math.floor(v / 864e5) === Math.floor(a / 864e5) : v === a
    case 'notEqual': return v !== a
    case 'gt': return v > a
    case 'gte': return v >= a
    case 'lt': return v < a
    case 'lte': return v <= a
    case 'between': return v >= a && v <= toNum(c.valueTo)
    default: return true
  }
}

export function filterRows<T extends RowData>(rows: T[], columns: ColumnDef<T>[], model: FilterModel, quick: string): number[] {
  const active = Object.entries(model).filter(([, c]) => c && (c.kind === 'set' ? !!c.values : c.op === 'blank' || c.op === 'notBlank' || (c.value != null && c.value !== '')))
  const byId = new Map(columns.map((c) => [colIdOf(c), c]))
  const checks = active.map(([id, cond]) => ({ get: makeGetter(byId.get(id) ?? { field: id }), cond }))
  const q = quick.trim().toLowerCase()
  // Quick filter matches raw primitive values (formatting every cell of 100k rows is far too slow).
  const quickGetters = q ? columns.filter((c) => !c.hide).map((c) => makeGetter(c)) : []
  const out: number[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    let ok = true
    for (const { get, cond } of checks) {
      if (!matchCondition(get(row), cond)) { ok = false; break }
    }
    if (ok && q) {
      ok = false
      for (const get of quickGetters) {
        const v = get(row)
        if (v == null || typeof v === 'object') continue
        if (String(v).toLowerCase().includes(q)) { ok = true; break }
      }
    }
    if (ok) out.push(i)
  }
  return out
}

/** Sorts row indices; keys are extracted once per row (decorate-sort-undecorate). */
export function sortIndices<T extends RowData>(rows: T[], indices: number[], columns: ColumnDef<T>[], sort: SortItem[]): number[] {
  if (!sort.length) return indices
  const byId = new Map(columns.map((c) => [colIdOf(c), c]))
  const specs = sort.map((s) => {
    const col = byId.get(s.colId) ?? ({ field: s.colId } as ColumnDef<T>)
    const get = makeGetter(col)
    const keys = new Array<CellValue>(rows.length)
    for (const i of indices) keys[i] = get(rows[i])
    return { keys, dir: s.sort === 'desc' ? -1 : 1, cmp: col.comparator, date: col.type === 'date' }
  })
  for (const s of specs) if (s.date) for (const i of indices) s.keys[i] = toDate(s.keys[i] as string)?.getTime() ?? null
  return indices.slice().sort((a, b) => {
    for (const s of specs) {
      const ka = s.keys[a]
      const kb = s.keys[b]
      // Blanks stay at the bottom in both directions.
      const blankA = ka == null || ka === ''
      const blankB = kb == null || kb === ''
      if (blankA !== blankB) return blankA ? 1 : -1
      const r = s.cmp ? s.cmp(ka, kb, rows[a], rows[b]) : compareValues(ka, kb)
      if (r) return r * s.dir
    }
    return a - b
  })
}

export function aggregate(values: CellValue[], fn: AggFunc): CellValue {
  if (typeof fn === 'function') return fn(values)
  const nums = values.filter((v) => v != null && v !== '').map(Number).filter((n) => !isNaN(n))
  switch (fn) {
    case 'sum': return nums.reduce((a, b) => a + b, 0)
    case 'avg': return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null
    case 'min': return nums.length ? Math.min(...nums) : null
    case 'max': return nums.length ? Math.max(...nums) : null
    case 'count': return values.length
    case 'first': return values[0]
    case 'last': return values[values.length - 1]
  }
}

export interface GroupNode {
  key: CellValue
  colId: string
  id: string
  level: number
  children: GroupNode[]
  /** Leaf source indices (in sorted order). */
  leaves: number[]
  agg: Record<string, CellValue>
}

function computeAgg<T extends RowData>(rows: T[], leaves: number[], aggCols: { id: string; get: (r: T) => CellValue; fn: AggFunc }[]) {
  const agg: Record<string, CellValue> = {}
  for (const a of aggCols) agg[a.id] = aggregate(leaves.map((i) => a.get(rows[i])), a.fn)
  return agg
}

/** Groups sorted indices by one or more columns. Group order follows the first occurrence in sorted data. */
export function groupRows<T extends RowData>(rows: T[], indices: number[], columns: ColumnDef<T>[], groupBy: string[]): GroupNode[] {
  const byId = new Map(columns.map((c) => [colIdOf(c), c]))
  const aggCols = columns.filter((c) => c.aggFunc).map((c) => ({ id: colIdOf(c), get: makeGetter(c), fn: c.aggFunc! }))
  const build = (idx: number[], level: number, parentId: string): GroupNode[] => {
    const colId = groupBy[level]
    const get = makeGetter(byId.get(colId) ?? ({ field: colId } as ColumnDef<T>))
    const buckets = new Map<string, { key: CellValue; leaves: number[] }>()
    for (const i of idx) {
      const key = get(rows[i])
      const k = String(key ?? '')
      let b = buckets.get(k)
      if (!b) buckets.set(k, (b = { key, leaves: [] }))
      b.leaves.push(i)
    }
    return Array.from(buckets.values()).map((b) => {
      const id = `${parentId}/${colId}:${String(b.key ?? '')}`
      return {
        key: b.key,
        colId,
        id,
        level,
        leaves: b.leaves,
        children: level + 1 < groupBy.length ? build(b.leaves, level + 1, id) : [],
        agg: computeAgg(rows, b.leaves, aggCols),
      }
    })
  }
  return groupBy.length ? build(indices, 0, 'g') : []
}

/** Builds a tree from `getDataPath(row)` (e.g. ['Org', 'Team', 'Alice']); missing parents become filler groups. */
export function treeRows<T extends RowData>(rows: T[], indices: number[], columns: ColumnDef<T>[], getDataPath: (row: T) => string[]): GroupNode[] {
  const aggCols = columns.filter((c) => c.aggFunc).map((c) => ({ id: colIdOf(c), get: makeGetter(c), fn: c.aggFunc! }))
  const root: GroupNode = { key: null, colId: '__tree', id: 't', level: -1, children: [], leaves: [], agg: {} }
  const nodes = new Map<string, GroupNode & { self?: number }>()
  for (const i of indices) {
    const path = getDataPath(rows[i])
    let parent = root
    let id = 't'
    path.forEach((part, depth) => {
      id += `/${part}`
      let node = nodes.get(id)
      if (!node) {
        node = { key: part, colId: '__tree', id, level: depth, children: [], leaves: [], agg: {} }
        nodes.set(id, node)
        parent.children.push(node)
      }
      if (depth === path.length - 1) node.self = i
      node.leaves.push(i)
      parent = node
    })
  }
  for (const n of nodes.values()) if (n.children.length) n.agg = computeAgg(rows, n.leaves, aggCols)
  return root.children
}

export interface FlattenOptions {
  expanded: Set<string>
  /** Open every group regardless of `expanded` (until the user collapses one). */
  expandAll?: boolean
  collapsed?: Set<string>
  rowId: (row: RowData, index: number) => string
  detailOpen?: Set<string>
  tree?: boolean
}

/** Turns groups (or plain indices) into the displayed row list. */
export function flatten<T extends RowData>(rows: T[], indices: number[], groups: GroupNode[] | null, opts: FlattenOptions): DisplayRow<T>[] {
  const out: DisplayRow<T>[] = []
  const pushData = (i: number, level: number) => {
    const id = opts.rowId(rows[i], i)
    out.push({ kind: 'data', id, data: rows[i], level, sourceIndex: i })
    if (opts.detailOpen?.has(id)) out.push({ kind: 'detail', id: `${id}__detail`, data: rows[i], level, sourceIndex: i })
  }
  if (!groups) {
    for (const i of indices) pushData(i, 0)
    return out
  }
  const isOpen = (id: string) => (opts.expandAll ? !opts.collapsed?.has(id) : opts.expanded.has(id))
  const walk = (nodes: GroupNode[]) => {
    for (const g of nodes) {
      const self = (g as GroupNode & { self?: number }).self
      if (opts.tree && !g.children.length && self != null) {
        pushData(self, g.level)
        continue
      }
      const expanded = isOpen(g.id)
      const leafIds = g.leaves.map((i) => opts.rowId(rows[i], i))
      out.push({
        kind: 'group',
        id: g.id,
        data: opts.tree && self != null ? rows[self] : null,
        level: g.level,
        sourceIndex: self,
        group: { key: g.key, colId: g.colId, count: opts.tree ? g.leaves.length - (self != null ? 1 : 0) : g.leaves.length, expanded, agg: g.agg, leafIds },
      })
      if (!expanded) continue
      if (g.children.length) walk(g.children)
      else for (const i of g.leaves) pushData(i, g.level + 1)
    }
  }
  walk(groups)
  return out
}

export function allGroupIds(groups: GroupNode[]): string[] {
  const ids: string[] = []
  const walk = (n: GroupNode[]) => n.forEach((g) => { if (g.children.length || g.colId !== '__tree') ids.push(g.id); walk(g.children) })
  walk(groups)
  return ids
}

/** Row offsets for virtualization with mixed row heights (data/group vs. detail). */
export function rowLayout(rows: DisplayRow[], rowHeight: number, detailHeight: number) {
  const offsets = new Float64Array(rows.length + 1)
  for (let i = 0; i < rows.length; i++) offsets[i + 1] = offsets[i] + (rows[i].kind === 'detail' ? detailHeight : rowHeight)
  const indexAt = (y: number) => {
    let lo = 0
    let hi = rows.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (offsets[mid] <= y) lo = mid
      else hi = mid - 1
    }
    return Math.max(0, lo)
  }
  return { offsets, total: offsets[rows.length], indexAt }
}

/**
 * Pivot: one output row per combination of `groupBy` values, one column per pivot value × value column.
 * Returns plain rows plus generated column defs, so the result renders like any other data.
 */
export function pivotRows<T extends RowData>(rows: T[], indices: number[], columns: ColumnDef<T>[], groupBy: string[], pivotCol: string) {
  const byId = new Map(columns.map((c) => [colIdOf(c), c]))
  const valueCols = columns.filter((c) => c.aggFunc)
  const pGet = makeGetter(byId.get(pivotCol) ?? ({ field: pivotCol } as ColumnDef<T>))
  const gGets = groupBy.map((id) => makeGetter(byId.get(id) ?? ({ field: id } as ColumnDef<T>)))
  const pivotKeys: string[] = []
  const seen = new Set<string>()
  const buckets = new Map<string, { keys: CellValue[]; cells: Map<string, number[]> }>()
  for (const i of indices) {
    const pk = String(pGet(rows[i]) ?? '')
    if (!seen.has(pk)) { seen.add(pk); pivotKeys.push(pk) }
    const keys = gGets.map((g) => g(rows[i]))
    const k = keys.map(String).join('\u0001')
    let b = buckets.get(k)
    if (!b) buckets.set(k, (b = { keys, cells: new Map() }))
    let cell = b.cells.get(pk)
    if (!cell) b.cells.set(pk, (cell = []))
    cell.push(i)
  }
  pivotKeys.sort((a, b) => compareValues(a, b))
  const outRows: RowData[] = []
  for (const b of buckets.values()) {
    const r: RowData = {}
    groupBy.forEach((id, k) => (r[id] = b.keys[k]))
    for (const pk of pivotKeys)
      for (const vc of valueCols) {
        const leaves = b.cells.get(pk) ?? []
        const get = makeGetter(vc)
        r[`${pk}__${colIdOf(vc)}`] = leaves.length ? aggregate(leaves.map((i) => get(rows[i])), vc.aggFunc!) : null
      }
    outRows.push(r)
  }
  const outCols: ColumnDef[] = [
    ...groupBy.map((id) => ({ ...(byId.get(id) as ColumnDef), colId: id, field: id, pinned: 'left' as const, rowGroup: false, valueGetter: undefined })),
    ...pivotKeys.flatMap((pk) =>
      valueCols.map((vc) => ({
        colId: `${pk}__${colIdOf(vc)}`,
        field: `${pk}__${colIdOf(vc)}`,
        headerName: valueCols.length > 1 ? `${vc.headerName ?? colIdOf(vc)}` : pk,
        group: valueCols.length > 1 ? pk : undefined,
        type: 'number' as const,
        align: 'right' as const,
        aggFunc: vc.aggFunc,
        valueFormatter: vc.valueFormatter as ColumnDef['valueFormatter'],
        width: 120,
      })),
    ),
  ]
  return { rows: outRows, columns: outCols }
}

/** RFC 4180 CSV. */
export function toCsv(header: string[], body: string[][], sep = ','): string {
  const esc = (s: string) => (/[",\n\r]/.test(s) || s.includes(sep) ? `"${s.replace(/"/g, '""')}"` : s)
  return [header, ...body].map((r) => r.map(esc).join(sep)).join('\r\n')
}

/** Parses tab-separated clipboard text into a 2D array. */
export const parseTsv = (text: string) => text.replace(/\r?\n$/, '').split(/\r?\n/).map((l) => l.split('\t'))
