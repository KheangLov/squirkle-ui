export type CellValue = unknown
export type RowData = Record<string, unknown>

export type ColumnType = 'text' | 'number' | 'date' | 'boolean'
export type FilterKind = 'text' | 'number' | 'date' | 'set'
export type AggName = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last'
export type AggFunc = AggName | ((values: CellValue[]) => CellValue)

export interface CellParams<T = RowData> {
  value: CellValue
  row: T
  column: ColumnDef<T>
  rowIndex: number
}

export interface ColumnDef<T = RowData> {
  /** Path into the row (`address.city`). Also the default colId. */
  field?: string
  colId?: string
  headerName?: string
  /** One-level header group label (adjacent columns with the same group share a header cell). */
  group?: string
  type?: ColumnType
  width?: number
  minWidth?: number
  maxWidth?: number
  /** Share of remaining width (like CSS flex-grow). */
  flex?: number
  pinned?: 'left' | 'right' | null
  hide?: boolean
  sortable?: boolean
  resizable?: boolean
  /** true = infer from type. */
  filter?: FilterKind | boolean
  /** Show in floating filter row. */
  floatingFilter?: boolean
  editable?: boolean | ((row: T) => boolean)
  cellEditor?: 'text' | 'number' | 'date' | 'select' | 'checkbox'
  cellEditorParams?: { values?: CellValue[] }
  valueGetter?: (row: T) => CellValue
  valueSetter?: (row: T, value: CellValue) => void
  valueFormatter?: (value: CellValue, row: T) => string
  /** Value parser for edited / pasted text. */
  valueParser?: (text: string, row: T) => CellValue
  comparator?: (a: CellValue, b: CellValue, rowA: T, rowB: T) => number
  aggFunc?: AggFunc
  /** Group rows by this column initially. */
  rowGroup?: boolean
  /** Use as a pivot column (values become columns). */
  pivot?: boolean
  align?: 'left' | 'center' | 'right'
  cellClass?: string | ((p: CellParams<T>) => string | undefined)
  cellStyle?: Record<string, string> | ((p: CellParams<T>) => Record<string, string> | undefined)
  headerClass?: string
  tooltip?: boolean | ((p: CellParams<T>) => string)
  /** Render a checkbox for row selection in this column. */
  checkboxSelection?: boolean
  headerCheckboxSelection?: boolean
  lockPosition?: boolean
  suppressMenu?: boolean
}

export interface SortItem {
  colId: string
  sort: 'asc' | 'desc'
}

export type TextOp = 'contains' | 'notContains' | 'equals' | 'notEqual' | 'startsWith' | 'endsWith' | 'blank' | 'notBlank'
export type NumberOp = 'equals' | 'notEqual' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'blank' | 'notBlank'

export interface FilterCondition {
  kind: FilterKind
  op?: TextOp | NumberOp
  value?: CellValue
  valueTo?: CellValue
  /** Set filter: allowed values. */
  values?: CellValue[]
}

export type FilterModel = Record<string, FilterCondition>

export interface ColumnState {
  colId: string
  width: number
  hide: boolean
  pinned: 'left' | 'right' | null
}

export interface DisplayRow<T = RowData> {
  kind: 'data' | 'group' | 'detail' | 'loading'
  id: string
  data: T | null
  level: number
  /** Index into the source rows (data rows). */
  sourceIndex?: number
  group?: {
    key: CellValue
    colId: string
    count: number
    expanded: boolean
    agg: Record<string, CellValue>
    leafIds: string[]
  }
}

export interface GetRowsParams {
  startRow: number
  endRow: number
  sortModel: SortItem[]
  filterModel: FilterModel
  quickFilter: string
}

export interface GetRowsResult<T = RowData> {
  rows: T[]
  /** Total row count when known (enables an exact scrollbar). */
  lastRow?: number
}

export interface Datasource<T = RowData> {
  getRows: (params: GetRowsParams) => Promise<GetRowsResult<T>>
}

export interface CellRange {
  startRow: number
  endRow: number
  startCol: number
  endCol: number
}
