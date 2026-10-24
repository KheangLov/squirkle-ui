<template>
  <div
    class="sq-datagrid sq-surface"
    :class="{ 'sq-datagrid--striped': striped, 'sq-datagrid--column-lines': columnLines, 'sq-datagrid--scrolled-x': scrollLeft > 0 }"
    :style="rootStyle"
    tabindex="0"
    role="grid"
    :aria-rowcount="rowCount"
    :aria-colcount="flatCols.length"
    @keydown="onKeydown"
    @paste="onPaste"
  >
    <SqShape clip />

    <div v-if="toolbar || has('toolbar')" class="sq-datagrid__toolbar">
      <slot name="toolbar" :api="api" />
      <SqTextField v-if="toolbar" :model-value="quick" class="sq-datagrid__quick" :placeholder="messages.search" prepend-inner-icon="search" density="compact" hide-details clearable @update:modelValue="quick = $event || ''" />
      <span class="sq-spacer"></span>
      <SqMenu v-if="toolbar" :close-on-content-click="false" location="bottom end">
        <template #activator><SqBtn prepend-icon="columns" variant="text" color="surface" size="small">Columns</SqBtn></template>
        <div class="sq-datagrid__chooser">
          <SqCheckbox v-for="c in chooserCols" :key="c.id" :model-value="!c.hidden" :label="c.title" @update:modelValue="setHidden(c.id, !$event)" />
        </div>
      </SqMenu>
      <SqBtn v-if="toolbar" prepend-icon="download" variant="text" color="surface" size="small" @click="exportCsv()">CSV</SqBtn>
    </div>

    <div v-if="groupPanel && !treeData && !isServer" class="sq-datagrid__group-panel" @dragover.prevent @drop="onGroupDrop">
      <SqIcon icon="menu" size="16px" />
      <span v-if="!groupBy.length" class="sq-datagrid__group-hint">Drag a column header here to group rows</span>
      <SqChip v-for="id in groupBy" :key="id" size="small" variant="tonal" color="primary" closable @click:close="removeGroup(id)">{{ titleOf(id) }}</SqChip>
    </div>

    <div ref="viewport" class="sq-datagrid__viewport" :style="{ height: toUnit(height) }" @scroll.passive="onScroll">
      <div class="sq-datagrid__canvas" :style="{ width: totalWidth + 'px' }">
        <!-- header (sticky) -->
        <div class="sq-datagrid__head" role="rowgroup">
          <div v-if="hasHeaderGroups" class="sq-datagrid__header-row sq-datagrid__header-row--groups" :style="{ height: headerHeight + 'px' }">
            <div v-for="g in headerGroups" :key="g.key" class="sq-datagrid__header-group" :class="g.cls" :style="g.style">{{ g.label }}</div>
          </div>
          <div class="sq-datagrid__header-row" role="row" :style="{ height: headerHeight + 'px' }">
            <div
              v-for="rc in renderCols"
              :key="rc.key"
              class="sq-datagrid__hcell"
              :class="headerCellClass(rc)"
              :style="rc.style"
              role="columnheader"
              :aria-sort="rc.col ? ariaSort(rc.id) : undefined"
              :draggable="!!rc.col && !rc.auto && !rc.col.lockPosition"
              @click="rc.col && onHeaderClick($event, rc)"
              @dragstart="onDragStart($event, rc)"
              @dragover.prevent="onDragOver($event, rc)"
              @drop.prevent="onDrop(rc)"
              @dragend="dragColId = null"
            >
              <template v-if="rc.col">
                <span v-if="rc.id === '__select'" class="sq-datagrid__check" @click.stop><SqCheckbox :model-value="allSelected" :indeterminate="someSelected" aria-label="Select all rows" @update:modelValue="toggleAll" /></span>
                <template v-else>
                  <span class="sq-datagrid__htitle"><slot :name="`header-${rc.id}`" :column="rc.col">{{ rc.title }}</slot></span>
                  <span v-if="sortIndex(rc.id) >= 0" class="sq-datagrid__sort">
                    <SqIcon :icon="sortDir(rc.id) === 'asc' ? 'arrowUp' : 'arrowDown'" size="14px" />
                    <sup v-if="sortModelList.length > 1">{{ sortIndex(rc.id) + 1 }}</sup>
                  </span>
                  <SqIcon v-if="filterModelObj[rc.id]" icon="filter" size="14px" class="sq-datagrid__filtered" />
                  <button v-if="!rc.col.suppressMenu && !rc.auto" type="button" class="sq-datagrid__menu-btn" tabindex="-1" aria-label="Column menu" @click.stop="openMenu($event, rc.id)"><SqIcon icon="more" size="16px" /></button>
                </template>
                <span v-if="rc.col.resizable !== false" class="sq-datagrid__resizer" @pointerdown.stop.prevent="startResize($event, rc)" @dblclick.stop="autoSize([rc.id])" @click.stop></span>
              </template>
            </div>
          </div>
          <div v-if="floatingFilters" class="sq-datagrid__header-row sq-datagrid__header-row--filters" :style="{ height: filterRowHeight + 'px' }">
            <div v-for="rc in renderCols" :key="rc.key" class="sq-datagrid__hcell sq-datagrid__fcell" :class="headerCellClass(rc)" :style="rc.style">
              <input
                v-if="rc.col && !rc.auto && rc.col.filter !== false && filterKind(rc.col) !== 'set'"
                class="sq-datagrid__ffilter sq-squircle"
                :type="filterKind(rc.col) === 'number' ? 'number' : filterKind(rc.col) === 'date' ? 'date' : 'text'"
                :value="floatingValue(rc.id)"
                :placeholder="filterKind(rc.col) === 'text' ? '…' : '='"
                :aria-label="`Filter ${rc.title}`"
                @input="onFloatingInput($event, rc)"
              />
            </div>
          </div>
          <div v-for="(pr, pi) in pinnedTopRows" :key="'pt' + pi" class="sq-datagrid__row sq-datagrid__row--pinned" :style="{ height: rowHeight + 'px' }">
            <div v-for="rc in renderCols" :key="rc.key" class="sq-datagrid__cell" :class="cellAlignClass(rc)" :style="rc.style">
              <template v-if="rc.col && !rc.auto"><slot :name="`cell-${rc.id}`" v-bind="cellParams(pr, rc, -1)">{{ formatCell(rc, pr) }}</slot></template>
            </div>
          </div>
        </div>

        <!-- body -->
        <div class="sq-datagrid__body" role="rowgroup" :style="{ height: layout.total + 'px' }">
          <div
            v-for="vr in visibleRows"
            :key="vr.row.id"
            class="sq-datagrid__row"
            :class="rowClass(vr)"
            :style="{ transform: `translateY(${vr.top}px)`, height: vr.height + 'px' }"
            role="row"
            :aria-rowindex="vr.index + 1"
            :aria-selected="vr.row.kind === 'data' && rowSelection ? (selectedSet.has(vr.row.id) ? 'true' : 'false') : undefined"
            @click="onRowClick($event, vr)"
            @dblclick="$emit('row-dblclick', { row: vr.row.data, event: $event })"
          >
            <div v-if="vr.row.kind === 'detail'" class="sq-datagrid__detail" :style="{ width: vpWidth + 'px' }">
              <slot name="detail" :row="vr.row.data" />
            </div>
            <template v-else>
              <div
                v-for="rc in renderCols"
                :key="rc.key"
                class="sq-datagrid__cell"
                :class="cellClass(vr, rc)"
                :style="cellStyle(vr, rc)"
                role="gridcell"
                @mousedown="onCellMousedown($event, vr, rc)"
                @mouseenter="onCellEnter(vr, rc)"
                @dblclick.stop="onCellDblclick(vr, rc)"
                @contextmenu.prevent="openContext($event, vr, rc)"
              >
                <template v-if="!rc.col"></template>
                <span v-else-if="vr.row.kind === 'loading'" class="sq-datagrid__skeleton sq-skeleton-shimmer"></span>
                <span v-else-if="rc.id === '__select'" class="sq-datagrid__check" @click.stop @mousedown.stop><SqCheckbox :model-value="isRowChecked(vr.row)" :indeterminate="isRowPartial(vr.row)" aria-label="Select row" @update:modelValue="toggleRowCheck(vr.row)" /></span>
                <span v-else-if="rc.id === '__group'" class="sq-datagrid__group-cell" :style="{ paddingInlineStart: vr.row.level * 18 + 'px' }">
                  <button v-if="vr.row.kind === 'group'" type="button" class="sq-datagrid__expander" :class="{ 'sq-datagrid__expander--open': vr.row.group?.expanded }" tabindex="-1" @click.stop="toggleGroup(vr.row)"><SqIcon icon="chevronRight" size="18px" /></button>
                  <button v-else-if="masterDetail && !treeData" type="button" class="sq-datagrid__expander" :class="{ 'sq-datagrid__expander--open': detailOpen.has(vr.row.id) }" tabindex="-1" @click.stop="toggleDetail(vr.row.id)"><SqIcon icon="chevronRight" size="18px" /></button>
                  <span v-else class="sq-datagrid__expander-spacer"></span>
                  <span class="sq-datagrid__group-key"><slot name="group" :row="vr.row">{{ groupLabel(vr.row) }}</slot></span>
                  <span v-if="vr.row.kind === 'group' && vr.row.group?.count" class="sq-datagrid__group-count">{{ vr.row.group?.count }}</span>
                </span>
                <span v-else-if="vr.row.kind === 'group'" class="sq-datagrid__agg">{{ groupAggText(vr.row, rc) }}</span>
                <span v-else-if="isEditing(vr, rc)" class="sq-datagrid__editor-wrap" @mousedown.stop>
                  <select v-if="editorKind(rc) === 'select'" class="sq-datagrid__editor" :value="String(editing?.value ?? '')" @change="onEditorInput" @keydown.stop="onEditorKey" @blur="commitEdit">
                    <option v-for="opt in rc.col.cellEditorParams?.values ?? []" :key="String(opt)" :value="String(opt)">{{ opt }}</option>
                  </select>
                  <input v-else class="sq-datagrid__editor" :type="editorKind(rc)" :value="editing?.value ?? ''" @input="onEditorInput" @keydown.stop="onEditorKey" @blur="commitEdit" />
                </span>
                <template v-else>
                  <slot :name="`cell-${rc.id}`" v-bind="cellParams(vr.row.data, rc, vr.index)">
                    <slot name="cell" v-bind="cellParams(vr.row.data, rc, vr.index)">
                      <span v-if="rc.col.type === 'boolean'" class="sq-datagrid__bool" :class="{ 'sq-datagrid__bool--on': !!cellValue(rc, vr.row.data) }"><SqIcon :icon="cellValue(rc, vr.row.data) ? 'check' : 'minus'" size="16px" /></span>
                      <span v-else class="sq-datagrid__text">{{ formatCell(rc, vr.row.data) }}</span>
                    </slot>
                  </slot>
                </template>
              </div>
            </template>
          </div>
        </div>

        <!-- pinned bottom / totals (sticky) -->
        <div v-if="bottomRows.length" class="sq-datagrid__foot">
          <div v-for="(pr, pi) in bottomRows" :key="'pb' + pi" class="sq-datagrid__row sq-datagrid__row--pinned" :style="{ height: rowHeight + 'px' }">
            <div v-for="rc in renderCols" :key="rc.key" class="sq-datagrid__cell" :class="cellAlignClass(rc)" :style="rc.style">
              <template v-if="rc.id === '__group'"><strong>Total</strong></template>
              <template v-else-if="rc.col && !rc.auto"><slot :name="`cell-${rc.id}`" v-bind="cellParams(pr, rc, -1)">{{ formatCell(rc, pr) }}</slot></template>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showLoading" class="sq-datagrid__overlay"><slot name="loading"><SqProgressCircular indeterminate :size="28" :width="3" /></slot></div>
      <div v-else-if="!rowCount" class="sq-datagrid__overlay sq-datagrid__overlay--empty"><slot name="no-rows"><SqEmptyState :title="messages.noData" icon="search" /></slot></div>
    </div>

    <div v-if="statusBar || pagination" class="sq-datagrid__footer">
      <div v-if="statusBar" class="sq-datagrid__status">
        <span>{{ statusText }}</span>
        <span v-if="selectedIds.length">· {{ selectedIds.length }} selected</span>
        <span v-if="rangeStats" class="sq-datagrid__range-stats">Count {{ rangeStats.count }} · Sum {{ fmtNum(rangeStats.sum) }} · Avg {{ fmtNum(rangeStats.avg) }} · Min {{ fmtNum(rangeStats.min) }} · Max {{ fmtNum(rangeStats.max) }}</span>
      </div>
      <span class="sq-spacer"></span>
      <template v-if="pagination && !isServer">
        <span class="sq-datagrid__page-size">{{ messages.rowsPerPage }}
          <select class="sq-datagrid__page-select sq-squircle" :value="pageSizeState" @change="onPageSize"><option v-for="s in pageSizes" :key="s" :value="s">{{ s }}</option></select>
        </span>
        <span class="sq-datagrid__page-range">{{ pageRangeText }}</span>
        <SqPagination v-model="page" :length="pageCount" :total-visible="5" size="x-small" />
      </template>
    </div>

    <SqMenu v-model="menuOpen" :activator="menuAnchor || undefined" :close-on-content-click="false" location="bottom end" :max-height="480">
      <div v-if="menuCol" class="sq-datagrid__menu">
        <template v-if="menuMode === 'column'">
          <SqListItem v-if="menuCol.col.sortable !== false" title="Sort ascending" prepend-icon="arrowUp" link @click="setSort(menuCol.id, 'asc')" />
          <SqListItem v-if="menuCol.col.sortable !== false" title="Sort descending" prepend-icon="arrowDown" link @click="setSort(menuCol.id, 'desc')" />
          <SqListItem v-if="sortIndex(menuCol.id) >= 0" title="Clear sort" prepend-icon="sort" link @click="setSort(menuCol.id, null)" />
          <SqDivider />
          <SqListItem :title="menuCol.pinned === 'left' ? 'Unpin' : 'Pin left'" prepend-icon="pin" link @click="setPinned(menuCol.id, menuCol.pinned === 'left' ? null : 'left')" />
          <SqListItem v-if="menuCol.pinned !== 'right'" title="Pin right" prepend-icon="pin" link @click="setPinned(menuCol.id, 'right')" />
          <SqListItem title="Autosize column" prepend-icon="columns" link @click="autoSize([menuCol.id])" />
          <SqListItem title="Autosize all columns" prepend-icon="columns" link @click="autoSize()" />
          <SqListItem v-if="!treeData && !isServer" :title="groupBy.includes(menuCol.id) ? `Ungroup by ${menuCol.title}` : `Group by ${menuCol.title}`" prepend-icon="menu" link @click="toggleGroupBy(menuCol.id)" />
          <SqListItem title="Hide column" prepend-icon="eyeOff" link @click="setHidden(menuCol.id, true); menuOpen = false" />
          <template v-if="menuCol.col.filter !== false">
            <SqDivider>Filter</SqDivider>
            <SqGridFilter :kind="filterKind(menuCol.col)" :model-value="filterModelObj[menuCol.id]" :values="distinctValues(menuCol.id)" :formatter="menuFormatter" @update:modelValue="setFilter(menuCol.id, $event)" />
          </template>
        </template>
        <template v-else>
          <SqListItem title="Copy" prepend-icon="copy" link @click="copy(false); menuOpen = false" />
          <SqListItem title="Copy with headers" prepend-icon="copy" link @click="copy(true); menuOpen = false" />
          <SqListItem v-if="canUndo" title="Undo" prepend-icon="refresh" link @click="undo(); menuOpen = false" />
          <SqDivider />
          <SqListItem title="Export CSV" prepend-icon="download" link @click="exportCsv(); menuOpen = false" />
          <SqListItem v-if="selectedIds.length" title="Export selected rows" prepend-icon="download" link @click="exportCsv({ onlySelected: true }); menuOpen = false" />
          <template v-if="hasGroups">
            <SqDivider />
            <SqListItem title="Expand all" prepend-icon="plus" link @click="expandAll(); menuOpen = false" />
            <SqListItem title="Collapse all" prepend-icon="minus" link @click="collapseAll(); menuOpen = false" />
          </template>
        </template>
      </div>
    </SqMenu>
    <div ref="ctxAnchor" class="sq-datagrid__ctx-anchor" :style="{ left: ctxPos.x + 'px', top: ctxPos.y + 'px' }"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch, type PropType } from 'vue'
import { clamp, downloadText, formatDate, getByPath, toUnit } from '@squirkle-ui/core'
import {
  SqBtn, SqCheckbox, SqChip, SqDivider, SqEmptyState, SqIcon, SqListItem, SqMenu, SqPagination, SqProgressCircular, SqShape, SqTextField,
  config, useProxiedModel,
} from '@squirkle-ui/ui'
import SqGridFilter from './GridFilter.vue'
import {
  aggregate, allGroupIds, colIdOf, filterKindOf, filterRows, flatten, groupRows, makeGetter, parseTsv, pivotRows, rowLayout, sortIndices, toCsv, treeRows,
} from './engine'
import type { CellRange, CellValue, ColumnDef, Datasource, DisplayRow, FilterCondition, FilterModel, RowData, SortItem } from './types'

interface RCol {
  key: string
  id: string
  col: ColumnDef | null
  title: string
  width: number
  pinned: 'left' | 'right' | null
  auto?: boolean
  flatIndex: number
  style: Record<string, string>
  edgeLeft?: boolean
  edgeRight?: boolean
}
interface VRow { index: number; top: number; height: number; row: DisplayRow }
interface Change { row: RowData; col: ColumnDef; oldValue: CellValue; newValue: CellValue }

const SELECT_COL: ColumnDef = { colId: '__select', headerName: '', width: 48, resizable: false, sortable: false, filter: false, suppressMenu: true, lockPosition: true }

function setByPath(obj: RowData, path: string, value: CellValue) {
  const keys = path.split('.')
  let cur: RowData = obj
  for (let i = 0; i < keys.length - 1; i++) cur = (cur[keys[i]] ??= {}) as RowData
  cur[keys[keys.length - 1]] = value
}

/**
 * Enterprise-style data grid: row + column virtualization, multi-sort, column/quick/set filters, row grouping with
 * aggregation, tree data, pivot, master/detail, pinned rows/columns, resizing, drag reorder, cell editing with undo,
 * range selection + clipboard, CSV export, pagination and an infinite server-side row model.
 */
export default defineComponent({
  name: 'SqDataGrid',
  components: { SqShape, SqBtn, SqCheckbox, SqChip, SqDivider, SqEmptyState, SqIcon, SqListItem, SqMenu, SqPagination, SqProgressCircular, SqTextField, SqGridFilter },
  props: {
    rows: { type: Array as PropType<RowData[]>, default: () => [] },
    columns: { type: Array as PropType<ColumnDef[]>, default: () => [] },
    defaultColDef: { type: Object as PropType<Partial<ColumnDef>>, default: () => ({}) },
    /** Field name or function producing a stable row id. */
    rowId: { type: [String, Function] as PropType<string | ((row: RowData, index: number) => string | number)>, default: 'id' },
    height: { type: [Number, String], default: 520 },
    rowHeight: { type: Number, default: 40 },
    headerHeight: { type: Number, default: 42 },
    detailHeight: { type: Number, default: 220 },
    rowSelection: { type: String as PropType<'single' | 'multiple' | null>, default: null },
    /** Auto checkbox column when rowSelection = multiple. */
    selectionColumn: { type: Boolean, default: true },
    selected: { type: Array as PropType<string[]>, default: undefined },
    sortModel: { type: Array as PropType<SortItem[]>, default: undefined },
    filterModel: { type: Object as PropType<FilterModel>, default: undefined },
    quickFilter: { type: String, default: undefined },
    groupBy: { type: Array as PropType<string[]>, default: undefined },
    /** Levels expanded by default; -1 = all. */
    groupDefaultExpanded: { type: Number, default: 0 },
    groupColumn: { type: Object as PropType<Partial<ColumnDef>>, default: () => ({}) },
    treeData: Boolean,
    getDataPath: { type: Function as PropType<(row: RowData) => string[]>, default: undefined },
    pivotMode: Boolean,
    pivotColumn: { type: String, default: undefined },
    masterDetail: Boolean,
    pinnedTopRows: { type: Array as PropType<RowData[]>, default: () => [] },
    pinnedBottomRows: { type: Array as PropType<RowData[]>, default: () => [] },
    /** Bottom row with column aggFunc totals over the filtered rows. */
    totalsRow: Boolean,
    pagination: Boolean,
    pageSize: { type: Number, default: 50 },
    pageSizes: { type: Array as PropType<number[]>, default: () => [25, 50, 100, 500] },
    /** Infinite / server-side row model. Sorting & filtering are delegated to getRows. */
    datasource: { type: Object as PropType<Datasource>, default: undefined },
    blockSize: { type: Number, default: 100 },
    loading: Boolean,
    toolbar: Boolean,
    groupPanel: Boolean,
    floatingFilters: Boolean,
    statusBar: { type: Boolean, default: true },
    striped: Boolean,
    columnLines: Boolean,
    rowClassName: { type: Function as PropType<(row: RowData) => string | undefined>, default: undefined },
    locale: { type: String, default: undefined },
  },
  emits: ['update:selected', 'update:sortModel', 'update:filterModel', 'update:quickFilter', 'update:groupBy', 'row-click', 'row-dblclick', 'cell-click', 'cell-value-changed', 'column-state-change', 'selection-change'],
  setup(props, { emit, slots }) {
    const viewport = ref<HTMLElement | null>(null)
    const ctxAnchor = ref<HTMLElement | null>(null)
    const scrollTop = ref(0)
    const scrollLeft = ref(0)
    const vpWidth = ref(800)
    const vpHeight = ref(400)
    const dataVersion = ref(0)
    const loc = computed(() => props.locale ?? config.locale.code)
    const isServer = computed(() => !!props.datasource)

    // ---------- models ----------
    const sortModelRef = useProxiedModel<SortItem[]>(props, emit, 'sortModel', () => [])
    const filterModelRef = useProxiedModel<FilterModel>(props, emit, 'filterModel', () => ({}))
    const quick = useProxiedModel<string>(props, emit, 'quickFilter', () => '')
    const groupByRef = useProxiedModel<string[]>(props, emit, 'groupBy', () => props.columns.filter((c) => c.rowGroup).map(colIdOf))
    const selectedRef = useProxiedModel<string[]>(props, emit, 'selected', () => [])
    const sortModelList = computed(() => sortModelRef.value ?? [])
    const filterModelObj = computed(() => filterModelRef.value ?? {})
    const groupBy = computed(() => groupByRef.value ?? [])
    const selectedIds = computed(() => selectedRef.value ?? [])
    const selectedSet = computed(() => new Set(selectedIds.value))

    // ---------- columns ----------
    const colOrder = ref<string[]>([])
    const colWidth = ref<Record<string, number>>({})
    const colHidden = ref<Record<string, boolean>>({})
    const colPinned = ref<Record<string, 'left' | 'right' | null>>({})
    const baseCols = computed(() => props.columns.map((c) => ({ ...props.defaultColDef, ...c }) as ColumnDef))
    watch(baseCols, (cols) => {
      const ids = cols.map(colIdOf)
      colOrder.value = [...colOrder.value.filter((id) => ids.includes(id)), ...ids.filter((id) => !colOrder.value.includes(id))]
    }, { immediate: true })

    const rowIdOf = (row: RowData, i: number) => String(typeof props.rowId === 'function' ? props.rowId(row, i) : (row?.[props.rowId] ?? i))

    // ---------- client pipeline ----------
    const raw = computed(() => {
      void dataVersion.value
      return toRaw(props.rows) as RowData[]
    })
    // Debounced copy of the quick filter so typing stays responsive on large data sets.
    const quickApplied = ref(quick.value ?? '')
    let quickApplyTimer: ReturnType<typeof setTimeout> | undefined
    watch(quick, (q) => { clearTimeout(quickApplyTimer); quickApplyTimer = setTimeout(() => (quickApplied.value = q ?? ''), raw.value.length > 20000 ? 160 : 0) })
    const filteredIdx = computed(() => (isServer.value ? [] : filterRows(raw.value, baseCols.value, filterModelObj.value, quickApplied.value)))
    const sortedIdx = computed(() => sortIndices(raw.value, filteredIdx.value, baseCols.value, sortModelList.value))
    const pivot = computed(() => (props.pivotMode && props.pivotColumn && !isServer.value ? pivotRows(raw.value, sortedIdx.value, baseCols.value, groupBy.value, props.pivotColumn) : null))
    const viewRows = computed(() => (pivot.value ? pivot.value.rows : raw.value))
    const viewIdx = computed(() => (pivot.value ? pivot.value.rows.map((_, i) => i) : sortedIdx.value))
    const viewCols = computed(() => (pivot.value ? pivot.value.columns.map((c) => ({ ...props.defaultColDef, ...c }) as ColumnDef) : baseCols.value))
    const groups = computed(() => {
      if (isServer.value || pivot.value) return null
      if (props.treeData && props.getDataPath) return treeRows(viewRows.value, viewIdx.value, viewCols.value, props.getDataPath)
      return groupBy.value.length ? groupRows(viewRows.value, viewIdx.value, viewCols.value, groupBy.value) : null
    })
    const hasGroups = computed(() => !!groups.value)
    const expanded = ref(new Set<string>())
    const collapsed = ref(new Set<string>())
    const expandAllFlag = ref(props.groupDefaultExpanded === -1)
    const detailOpen = ref(new Set<string>())
    watch(groups, (g) => {
      if (!g || props.groupDefaultExpanded <= 0) return
      const ids = new Set(expanded.value)
      const walk = (nodes: typeof g, lvl: number) => nodes.forEach((n) => { if (lvl < props.groupDefaultExpanded) { ids.add(n.id); walk(n.children, lvl + 1) } })
      walk(g, 0)
      expanded.value = ids
    }, { immediate: true })

    const display = computed<DisplayRow[]>(() =>
      flatten(viewRows.value, viewIdx.value, groups.value, {
        expanded: expanded.value,
        expandAll: expandAllFlag.value,
        collapsed: collapsed.value,
        rowId: rowIdOf,
        detailOpen: props.masterDetail ? detailOpen.value : undefined,
        tree: props.treeData,
      }),
    )

    // pagination
    const page = ref(1)
    const pageSizeState = ref(props.pageSize)
    const pageCount = computed(() => Math.max(1, Math.ceil(display.value.length / pageSizeState.value)))
    watch([pageCount, filteredIdx], () => (page.value = Math.min(page.value, pageCount.value)))
    const paged = computed(() => (props.pagination ? display.value.slice((page.value - 1) * pageSizeState.value, page.value * pageSizeState.value) : display.value))
    const onPageSize = (e: Event) => { pageSizeState.value = Number((e.target as HTMLSelectElement).value); page.value = 1 }
    const pageRangeText = computed(() => {
      const n = display.value.length
      const a = n ? (page.value - 1) * pageSizeState.value + 1 : 0
      return config.locale.messages.pageRange.replace('{0}', String(a)).replace('{1}', String(Math.min(n, page.value * pageSizeState.value))).replace('{2}', String(n))
    })

    // ---------- server (infinite) row model ----------
    const blocks = new Map<number, RowData[] | 'loading'>()
    const blockVersion = ref(0)
    const serverCount = ref(0)
    const serverLoading = ref(false)
    let epoch = 0
    const loadBlock = async (b: number) => {
      if (!props.datasource || blocks.has(b)) return
      blocks.set(b, 'loading')
      const my = epoch
      serverLoading.value = true
      try {
        const res = await props.datasource.getRows({ startRow: b * props.blockSize, endRow: (b + 1) * props.blockSize, sortModel: sortModelList.value, filterModel: filterModelObj.value, quickFilter: quick.value ?? '' })
        if (my !== epoch) return
        blocks.set(b, res.rows)
        if (res.lastRow != null) serverCount.value = res.lastRow
        else if (res.rows.length < props.blockSize) serverCount.value = b * props.blockSize + res.rows.length
        else serverCount.value = Math.max(serverCount.value, (b + 2) * props.blockSize)
      } catch {
        if (my === epoch) blocks.delete(b)
      } finally {
        if (my === epoch) { serverLoading.value = [...blocks.values()].some((v) => v === 'loading'); blockVersion.value++ }
      }
    }
    const purge = () => {
      epoch++
      blocks.clear()
      serverCount.value = 0
      blockVersion.value++
      if (viewport.value) viewport.value.scrollTop = 0
      loadBlock(0)
    }
    let quickTimer: ReturnType<typeof setTimeout> | undefined
    watch([sortModelList, filterModelObj], () => isServer.value && purge(), { deep: true })
    watch(quick, () => { if (!isServer.value) return; clearTimeout(quickTimer); quickTimer = setTimeout(purge, 250) })
    // First block loads on mount (not during server rendering); later datasource swaps purge immediately.
    watch(() => props.datasource, (ds) => ds && purge())
    onMounted(() => props.datasource && purge())

    const rowCount = computed(() => (isServer.value ? serverCount.value : paged.value.length))
    const rowAt = (i: number): DisplayRow => {
      if (!isServer.value) return paged.value[i]
      void blockVersion.value
      const b = Math.floor(i / props.blockSize)
      const data = blocks.get(b)
      if (Array.isArray(data)) {
        const row = data[i - b * props.blockSize]
        if (row) return { kind: 'data', id: rowIdOf(row, i), data: row, level: 0, sourceIndex: i }
      }
      return { kind: 'loading', id: `__loading_${i}`, data: null, level: 0 }
    }

    // ---------- column layout ----------
    const titleOf = (id: string) => {
      const c = viewCols.value.find((x) => colIdOf(x) === id) ?? baseCols.value.find((x) => colIdOf(x) === id)
      return c?.headerName ?? (c?.field ? c.field.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase()) : id)
    }
    const groupColDef = computed<ColumnDef>(() => ({ colId: '__group', headerName: props.treeData ? 'Name' : 'Group', width: 240, sortable: false, filter: false, suppressMenu: true, lockPosition: true, ...props.groupColumn }))
    const orderedCols = computed(() => {
      const cols = viewCols.value
      const byId = new Map(cols.map((c) => [colIdOf(c), c]))
      const ordered = pivot.value ? cols : [...colOrder.value.map((id) => byId.get(id)).filter(Boolean) as ColumnDef[], ...cols.filter((c) => !colOrder.value.includes(colIdOf(c)))]
      const auto: ColumnDef[] = []
      if (props.rowSelection === 'multiple' && props.selectionColumn) auto.push(SELECT_COL)
      if (groups.value || (props.masterDetail && !props.treeData)) auto.push(groupColDef.value)
      return { auto, ordered }
    })
    const visibleCols = computed(() => {
      const { auto, ordered } = orderedCols.value
      const list = [
        ...auto.map((c) => ({ id: colIdOf(c), col: c, auto: true })),
        ...ordered.filter((c) => !(colHidden.value[colIdOf(c)] ?? c.hide)).map((c) => ({ id: colIdOf(c), col: c, auto: false })),
      ]
      const resolved = list.map((x) => ({
        ...x,
        pinned: x.auto ? ('left' as const) : colPinned.value[x.id] !== undefined ? colPinned.value[x.id] : x.col.pinned ?? null,
        width: colWidth.value[x.id] ?? x.col.width ?? (x.col.flex ? 0 : 150),
        title: x.id === '__group' ? (x.col.headerName as string) : titleOf(x.id),
      }))
      // pinned-left auto columns only when something else is pinned left, else keep them first in the centre
      const anyLeft = resolved.some((r) => !r.auto && r.pinned === 'left')
      if (!anyLeft) resolved.forEach((r) => { if (r.auto) r.pinned = null })
      // flex distribution
      const fixed = resolved.reduce((s, r) => s + (r.col.flex && colWidth.value[r.id] == null ? 0 : r.width), 0)
      const flexCols = resolved.filter((r) => r.col.flex && colWidth.value[r.id] == null)
      const totalFlex = flexCols.reduce((s, r) => s + (r.col.flex ?? 0), 0)
      const avail = Math.max(0, vpWidth.value - fixed - 2)
      for (const r of flexCols) r.width = clamp(Math.floor((avail * (r.col.flex ?? 1)) / totalFlex), r.col.minWidth ?? 80, r.col.maxWidth ?? 4000)
      const left = resolved.filter((r) => r.pinned === 'left')
      const right = resolved.filter((r) => r.pinned === 'right')
      const center = resolved.filter((r) => !r.pinned)
      return { left, center, right }
    })
    const flatCols = computed(() => [...visibleCols.value.left, ...visibleCols.value.center, ...visibleCols.value.right])
    const flatIndex = computed(() => new Map(flatCols.value.map((c, i) => [c.id, i])))
    const leftWidth = computed(() => visibleCols.value.left.reduce((s, c) => s + c.width, 0))
    const rightWidth = computed(() => visibleCols.value.right.reduce((s, c) => s + c.width, 0))
    const centerOffsets = computed(() => {
      const o = [0]
      for (const c of visibleCols.value.center) o.push(o[o.length - 1] + c.width)
      return o
    })
    const totalWidth = computed(() => leftWidth.value + rightWidth.value + centerOffsets.value[centerOffsets.value.length - 1])

    const renderCols = computed<RCol[]>(() => {
      const { left, center, right } = visibleCols.value
      const out: RCol[] = []
      let acc = 0
      left.forEach((c, i) => {
        out.push({ key: c.id, id: c.id, col: c.col, title: c.title, width: c.width, pinned: 'left', auto: c.auto, flatIndex: flatIndex.value.get(c.id)!, edgeLeft: i === left.length - 1, style: { width: `${c.width}px`, left: `${acc}px` } })
        acc += c.width
      })
      // centre column virtualization
      const offs = centerOffsets.value
      const viewW = Math.max(0, vpWidth.value - leftWidth.value - rightWidth.value)
      let start = 0
      while (start < center.length && offs[start + 1] < scrollLeft.value) start++
      let end = start
      while (end < center.length && offs[end] < scrollLeft.value + viewW) end++
      start = Math.max(0, start - 2)
      end = Math.min(center.length, end + 2)
      if (offs[start] > 0) out.push({ key: '__padL', id: '__padL', col: null, title: '', width: offs[start], pinned: null, flatIndex: -1, style: { width: `${offs[start]}px` } })
      for (let i = start; i < end; i++) {
        const c = center[i]
        out.push({ key: c.id, id: c.id, col: c.col, title: c.title, width: c.width, pinned: null, auto: c.auto, flatIndex: flatIndex.value.get(c.id)!, style: { width: `${c.width}px` } })
      }
      const padR = offs[center.length] - offs[end]
      if (padR > 0) out.push({ key: '__padR', id: '__padR', col: null, title: '', width: padR, pinned: null, flatIndex: -1, style: { width: `${padR}px` } })
      let racc = 0
      for (let i = right.length - 1; i >= 0; i--) {
        const c = right[i]
        out.push({ key: c.id, id: c.id, col: c.col, title: c.title, width: c.width, pinned: 'right', auto: c.auto, flatIndex: flatIndex.value.get(c.id)!, edgeRight: i === 0, style: { width: `${c.width}px`, right: `${racc}px` } })
        racc += c.width
      }
      // right pinned were pushed in reverse; restore visual order
      const rightPart = out.splice(out.length - right.length, right.length).reverse()
      return [...out, ...rightPart]
    })

    const hasHeaderGroups = computed(() => flatCols.value.some((c) => c.col.group))
    const headerGroups = computed(() => {
      type HG = { key: string; label: string; pin: 'left' | 'right' | null; width: number; style: Record<string, string>; cls: Record<string, boolean> }
      const out: HG[] = []
      for (const rc of renderCols.value) {
        const label = rc.col?.group ?? ''
        const last = out[out.length - 1]
        if (last && label && rc.col && last.label === label && last.pin === rc.pinned) {
          last.width += rc.width
          last.style.width = `${last.width}px`
          continue
        }
        const style: Record<string, string> = { width: `${rc.width}px` }
        if (rc.pinned === 'left') style.left = rc.style.left
        if (rc.pinned === 'right') style.right = rc.style.right
        out.push({
          key: `${rc.key}-g`, label: rc.col ? label : '', pin: rc.pinned, width: rc.width, style,
          cls: { 'sq-datagrid__hcell--pinned-left': rc.pinned === 'left', 'sq-datagrid__hcell--pinned-right': rc.pinned === 'right', 'sq-datagrid__header-group--empty': !label },
        })
      }
      // a right-pinned group's sticky offset is its rightmost member's offset
      return out
    })

    // ---------- row virtualization ----------
    const filterRowHeight = 38
    const headBlock = computed(() => props.headerHeight * (hasHeaderGroups.value ? 2 : 1) + (props.floatingFilters ? filterRowHeight : 0) + props.pinnedTopRows.length * props.rowHeight)
    const layout = computed(() => {
      if (isServer.value) {
        const n = serverCount.value
        return { offsets: null as Float64Array | null, total: n * props.rowHeight, indexAt: (y: number) => Math.floor(y / props.rowHeight) }
      }
      return rowLayout(paged.value, props.rowHeight, props.detailHeight)
    })
    const range = computed(() => {
      const n = rowCount.value
      if (!n) return { start: 0, end: -1 }
      const top = Math.max(0, scrollTop.value)
      const start = Math.max(0, layout.value.indexAt(top) - 6)
      const end = Math.min(n - 1, layout.value.indexAt(top + vpHeight.value) + 6)
      return { start, end }
    })
    const visibleRows = computed<VRow[]>(() => {
      const out: VRow[] = []
      const { start, end } = range.value
      const offs = layout.value.offsets
      for (let i = start; i <= end; i++) {
        const row = rowAt(i)
        if (!row) continue
        const top = offs ? offs[i] : i * props.rowHeight
        const height = offs ? offs[i + 1] - offs[i] : props.rowHeight
        out.push({ index: i, top, height, row })
      }
      return out
    })
    watch(range, (r) => {
      if (!isServer.value || r.end < 0) return
      for (let b = Math.floor(r.start / props.blockSize); b <= Math.floor(r.end / props.blockSize); b++) loadBlock(b)
    })

    // Scroll events already fire at most once per frame and Vue batches the re-render, so no rAF throttle
    // (rAF also stalls in background tabs, which would leave stale rows).
    const onScroll = () => {
      const el = viewport.value
      if (!el) return
      scrollTop.value = el.scrollTop
      scrollLeft.value = el.scrollLeft
    }
    let ro: ResizeObserver | undefined
    onMounted(() => {
      const el = viewport.value!
      const measure = () => { vpWidth.value = el.clientWidth; vpHeight.value = el.clientHeight }
      measure()
      if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(measure); ro.observe(el) }
    })
    onBeforeUnmount(() => { ro?.disconnect(); clearTimeout(quickTimer); clearTimeout(quickApplyTimer); window.removeEventListener('pointermove', onResizeMove); window.removeEventListener('pointerup', onResizeEnd); window.removeEventListener('mouseup', endSelect) })

    // ---------- values & formatting ----------
    const getters = new WeakMap<ColumnDef, (row: RowData) => CellValue>()
    const cellValue = (rc: { col: ColumnDef | null }, row: RowData | null) => {
      if (!rc.col || !row) return undefined
      let g = getters.get(rc.col)
      if (!g) getters.set(rc.col, (g = makeGetter(rc.col)))
      return g(row)
    }
    let numFmt: Intl.NumberFormat | null = null
    let numFmtLocale = ''
    const fmtNum = (v: number) => {
      if (numFmtLocale !== loc.value) { numFmt = new Intl.NumberFormat(loc.value, { maximumFractionDigits: 2 }); numFmtLocale = loc.value }
      return numFmt!.format(v)
    }
    const formatValue = (col: ColumnDef, v: CellValue, row: RowData | null) => {
      if (col.valueFormatter) return col.valueFormatter(v, row as RowData)
      if (v == null || v === '') return ''
      if (col.type === 'number' && typeof v === 'number') return fmtNum(v)
      if (col.type === 'date') return formatDate(v as string, loc.value)
      return String(v)
    }
    const formatCell = (rc: RCol, row: RowData | null) => (rc.col ? formatValue(rc.col, cellValue(rc, row), row) : '')
    const cellParams = (row: RowData | null, rc: RCol, rowIndex: number) => ({ value: cellValue(rc, row), formatted: formatCell(rc, row), row, column: rc.col, rowIndex })
    const groupLabel = (row: DisplayRow) => {
      if (row.kind === 'group') {
        const g = row.group!
        if (g.colId === '__tree') return String(g.key ?? '')
        const col = viewCols.value.find((c) => colIdOf(c) === g.colId)
        return col ? formatValue(col, g.key, null) || '(Blank)' : String(g.key ?? '')
      }
      if (props.treeData && props.getDataPath && row.data) {
        const p = props.getDataPath(row.data)
        return p[p.length - 1]
      }
      return ''
    }
    const groupAggText = (row: DisplayRow, rc: RCol) => {
      if (!rc.col) return ''
      const v = row.group?.agg[rc.id]
      if (v === undefined) return row.data && props.treeData ? formatCell(rc, row.data) : ''
      return formatValue(rc.col, v, null)
    }
    const filterKind = (col: ColumnDef) => filterKindOf(col)
    const distinctValues = (id: string) => {
      const col = baseCols.value.find((c) => colIdOf(c) === id)
      if (!col) return []
      const get = makeGetter(col)
      const set = new Set<CellValue>()
      for (const r of raw.value) {
        set.add(get(r))
        if (set.size > 5000) break
      }
      return Array.from(set).sort((a, b) => String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true }))
    }

    // ---------- sorting / filtering / grouping ----------
    const sortIndex = (id: string) => sortModelList.value.findIndex((s) => s.colId === id)
    const sortDir = (id: string) => sortModelList.value.find((s) => s.colId === id)?.sort
    const ariaSort = (id: string) => (sortDir(id) === 'asc' ? 'ascending' : sortDir(id) === 'desc' ? 'descending' : 'none')
    const setSort = (id: string, dir: 'asc' | 'desc' | null, multi = false) => {
      const rest = multi ? sortModelList.value.filter((s) => s.colId !== id) : []
      sortModelRef.value = dir ? [...rest, { colId: id, sort: dir }] : rest
    }
    let resized = false
    const onHeaderClick = (e: MouseEvent, rc: RCol) => {
      if (resized) return void (resized = false)
      if (!rc.col || rc.auto || rc.col.sortable === false) return
      const cur = sortDir(rc.id)
      const next = cur === 'asc' ? 'desc' : cur === 'desc' ? null : 'asc'
      if (e.shiftKey) {
        const list = sortModelList.value.slice()
        const i = list.findIndex((s) => s.colId === rc.id)
        if (next && i >= 0) list[i] = { colId: rc.id, sort: next }
        else if (next) list.push({ colId: rc.id, sort: next })
        else list.splice(i, 1)
        sortModelRef.value = list
      } else setSort(rc.id, next)
    }
    const setFilter = (id: string, cond: FilterCondition | undefined) => {
      const next = { ...filterModelObj.value }
      if (cond) next[id] = cond
      else delete next[id]
      filterModelRef.value = next
    }
    const floatingValue = (id: string) => {
      const f = filterModelObj.value[id]
      return f && f.kind !== 'set' ? (f.value as string) ?? '' : ''
    }
    let floatTimer: ReturnType<typeof setTimeout> | undefined
    const onFloatingInput = (e: Event, rc: RCol) => {
      const value = (e.target as HTMLInputElement).value
      const kind = filterKind(rc.col!)
      clearTimeout(floatTimer)
      floatTimer = setTimeout(() => setFilter(rc.id, value === '' ? undefined : { kind, op: kind === 'text' ? 'contains' : 'equals', value: kind === 'number' ? Number(value) : value }), 180)
    }
    const toggleGroupBy = (id: string) => (groupByRef.value = groupBy.value.includes(id) ? groupBy.value.filter((x) => x !== id) : [...groupBy.value, id])
    const removeGroup = (id: string) => (groupByRef.value = groupBy.value.filter((x) => x !== id))
    const toggleGroup = (row: DisplayRow) => {
      if (expandAllFlag.value) {
        const s = new Set(collapsed.value)
        s.has(row.id) ? s.delete(row.id) : s.add(row.id)
        collapsed.value = s
      } else {
        const s = new Set(expanded.value)
        s.has(row.id) ? s.delete(row.id) : s.add(row.id)
        expanded.value = s
      }
    }
    const expandAll = () => { expandAllFlag.value = true; collapsed.value = new Set() }
    const collapseAll = () => { expandAllFlag.value = false; expanded.value = new Set() }
    const toggleDetail = (id: string) => {
      const s = new Set(detailOpen.value)
      s.has(id) ? s.delete(id) : s.add(id)
      detailOpen.value = s
    }

    // ---------- column state ops ----------
    const emitColumnState = () => emit('column-state-change', flatCols.value.filter((c) => !c.auto).map((c) => ({ colId: c.id, width: c.width, hide: false, pinned: c.pinned })))
    const setHidden = (id: string, hide: boolean) => { colHidden.value = { ...colHidden.value, [id]: hide }; emitColumnState() }
    const setPinned = (id: string, pin: 'left' | 'right' | null) => { colPinned.value = { ...colPinned.value, [id]: pin }; emitColumnState() }
    const chooserCols = computed(() => orderedCols.value.ordered.map((c) => ({ id: colIdOf(c), title: titleOf(colIdOf(c)), hidden: colHidden.value[colIdOf(c)] ?? !!c.hide })))

    let resizeState: { id: string; startX: number; startW: number; min: number; max: number } | null = null
    const onResizeMove = (e: PointerEvent) => {
      if (!resizeState) return
      const w = clamp(resizeState.startW + e.clientX - resizeState.startX, resizeState.min, resizeState.max)
      colWidth.value = { ...colWidth.value, [resizeState.id]: Math.round(w) }
    }
    const onResizeEnd = () => {
      if (resizeState) { resized = true; setTimeout(() => (resized = false), 0); emitColumnState() }
      resizeState = null
      window.removeEventListener('pointermove', onResizeMove)
      window.removeEventListener('pointerup', onResizeEnd)
    }
    const startResize = (e: PointerEvent, rc: RCol) => {
      resizeState = { id: rc.id, startX: e.clientX, startW: rc.width, min: rc.col?.minWidth ?? 48, max: rc.col?.maxWidth ?? 2000 }
      window.addEventListener('pointermove', onResizeMove)
      window.addEventListener('pointerup', onResizeEnd)
    }
    let canvas: HTMLCanvasElement | null = null
    const autoSize = (ids?: string[]) => {
      canvas ??= document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx || !viewport.value) return
      const cs = getComputedStyle(viewport.value)
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const sample = isServer.value ? [] : paged.value.filter((r) => r.kind === 'data').slice(0, 300)
      const next = { ...colWidth.value }
      for (const c of flatCols.value) {
        if (c.auto || (ids && !ids.includes(c.id))) continue
        let w = ctx.measureText(c.title).width + 64
        for (const r of sample) w = Math.max(w, ctx.measureText(formatValue(c.col, cellValue(c, r.data), r.data)).width + 32)
        next[c.id] = Math.ceil(clamp(w, c.col.minWidth ?? 48, c.col.maxWidth ?? 600))
      }
      colWidth.value = next
      emitColumnState()
    }
    const dragColId = ref<string | null>(null)
    const dropTarget = ref<{ id: string; before: boolean } | null>(null)
    const onDragStart = (e: DragEvent, rc: RCol) => {
      if (!rc.col || rc.auto || rc.col.lockPosition) return e.preventDefault()
      dragColId.value = rc.id
      e.dataTransfer?.setData('text/plain', rc.id)
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
    }
    const onDragOver = (e: DragEvent, rc: RCol) => {
      if (!dragColId.value || !rc.col || rc.auto) return
      dropTarget.value = { id: rc.id, before: e.offsetX < rc.width / 2 }
    }
    const onDrop = (rc: RCol) => {
      const from = dragColId.value
      const target = dropTarget.value
      dragColId.value = null
      dropTarget.value = null
      if (!from || !target || from === target.id || !rc.col || rc.auto) return
      const order = colOrder.value.filter((id) => id !== from)
      const i = order.indexOf(target.id)
      order.splice(target.before ? i : i + 1, 0, from)
      colOrder.value = order
      const pin = visibleCols.value.left.some((c) => c.id === target.id) ? 'left' : visibleCols.value.right.some((c) => c.id === target.id) ? 'right' : null
      colPinned.value = { ...colPinned.value, [from]: pin }
      emitColumnState()
    }
    const onGroupDrop = () => {
      const id = dragColId.value
      dragColId.value = null
      if (id && !groupBy.value.includes(id)) groupByRef.value = [...groupBy.value, id]
    }

    // ---------- selection ----------
    const dataIdsInView = () => (isServer.value ? [] : viewIdx.value.map((i) => rowIdOf(viewRows.value[i], i)))
    const setSelected = (ids: string[]) => {
      selectedRef.value = ids
      emit('selection-change', ids)
    }
    const allSelected = computed(() => {
      const ids = filteredIdx.value
      return ids.length > 0 && selectedIds.value.length >= ids.length && ids.every((i) => selectedSet.value.has(rowIdOf(raw.value[i], i)))
    })
    const someSelected = computed(() => !allSelected.value && selectedIds.value.length > 0)
    const toggleAll = () => setSelected(allSelected.value ? [] : dataIdsInView())
    const isRowChecked = (row: DisplayRow) => (row.kind === 'group' ? row.group!.leafIds.every((id) => selectedSet.value.has(id)) : selectedSet.value.has(row.id))
    const isRowPartial = (row: DisplayRow) => row.kind === 'group' && !isRowChecked(row) && row.group!.leafIds.some((id) => selectedSet.value.has(id))
    const toggleRowCheck = (row: DisplayRow) => {
      const ids = row.kind === 'group' ? row.group!.leafIds : [row.id]
      const on = isRowChecked(row)
      const s = new Set(selectedIds.value)
      ids.forEach((id) => (on ? s.delete(id) : s.add(id)))
      setSelected(Array.from(s))
    }
    let lastClicked = -1
    const onRowClick = (e: MouseEvent, vr: VRow) => {
      if (vr.row.kind !== 'data') return
      emit('row-click', { row: vr.row.data, event: e })
      if (!props.rowSelection) return
      if (props.rowSelection === 'single') setSelected(selectedSet.value.has(vr.row.id) && (e.ctrlKey || e.metaKey) ? [] : [vr.row.id])
      else if (e.shiftKey && lastClicked >= 0) {
        const [a, b] = [Math.min(lastClicked, vr.index), Math.max(lastClicked, vr.index)]
        const ids = new Set(selectedIds.value)
        for (let i = a; i <= b; i++) { const r = rowAt(i); if (r?.kind === 'data') ids.add(r.id) }
        setSelected(Array.from(ids))
      } else if (e.ctrlKey || e.metaKey) toggleRowCheck(vr.row)
      else if (!props.selectionColumn) setSelected([vr.row.id])
      lastClicked = vr.index
    }

    // ---------- focus, range, editing ----------
    const focus = ref<{ row: number; col: number } | null>(null)
    const cellRange = ref<CellRange | null>(null)
    let anchor: { row: number; col: number } | null = null
    let selecting = false
    const endSelect = () => { selecting = false; window.removeEventListener('mouseup', endSelect) }
    const setRange = (a: { row: number; col: number }, b: { row: number; col: number }) =>
      (cellRange.value = { startRow: Math.min(a.row, b.row), endRow: Math.max(a.row, b.row), startCol: Math.min(a.col, b.col), endCol: Math.max(a.col, b.col) })
    const inRange = (row: number, col: number) => {
      const r = cellRange.value
      return !!r && (r.startRow !== r.endRow || r.startCol !== r.endCol) && row >= r.startRow && row <= r.endRow && col >= r.startCol && col <= r.endCol
    }
    const onCellMousedown = (e: MouseEvent, vr: VRow, rc: RCol) => {
      if (!rc.col || e.button !== 0) return
      const pos = { row: vr.index, col: rc.flatIndex }
      if (editing.value && !isEditing(vr, rc)) commitEdit()
      if (e.shiftKey && focus.value) setRange(focus.value, pos)
      else { focus.value = pos; anchor = pos; setRange(pos, pos) }
      selecting = true
      window.addEventListener('mouseup', endSelect)
      emit('cell-click', { row: vr.row.data, colId: rc.id, value: cellValue(rc, vr.row.data), event: e })
    }
    const onCellEnter = (vr: VRow, rc: RCol) => { if (selecting && anchor && rc.col) setRange(anchor, { row: vr.index, col: rc.flatIndex }) }

    const editing = ref<{ row: number; colId: string; value: CellValue } | null>(null)
    const isEditable = (col: ColumnDef, row: RowData | null) => !!row && (typeof col.editable === 'function' ? col.editable(row) : !!col.editable)
    const isEditing = (vr: VRow, rc: RCol) => !!editing.value && editing.value.row === vr.index && editing.value.colId === rc.id
    const editorKind = (rc: RCol) => rc.col?.cellEditor ?? (rc.col?.type === 'number' ? 'number' : rc.col?.type === 'date' ? 'date' : 'text')
    const undoStack: Change[][] = []
    const redoStack: Change[][] = []
    const canUndo = ref(false)
    const applyChanges = (changes: Change[], dir: 'new' | 'old') => {
      for (const c of changes) {
        const v = dir === 'new' ? c.newValue : c.oldValue
        if (c.col.valueSetter) c.col.valueSetter(c.row, v)
        else if (c.col.field) setByPath(c.row, c.col.field, v)
        emit('cell-value-changed', { row: c.row, colId: colIdOf(c.col), oldValue: dir === 'new' ? c.oldValue : c.newValue, newValue: v })
      }
      dataVersion.value++
    }
    const record = (changes: Change[]) => {
      if (!changes.length) return
      applyChanges(changes, 'new')
      undoStack.push(changes)
      if (undoStack.length > 100) undoStack.shift()
      redoStack.length = 0
      canUndo.value = true
    }
    const undo = () => { const c = undoStack.pop(); if (c) { applyChanges(c, 'old'); redoStack.push(c) } canUndo.value = undoStack.length > 0 }
    const redo = () => { const c = redoStack.pop(); if (c) { applyChanges(c, 'new'); undoStack.push(c) } canUndo.value = undoStack.length > 0 }
    const parseFor = (col: ColumnDef, text: string, row: RowData): CellValue => {
      if (col.valueParser) return col.valueParser(text, row)
      if (col.type === 'number') return text === '' ? null : Number(text.replace(/[^\d.-]/g, ''))
      if (col.type === 'boolean') return /^(true|1|yes|✓)$/i.test(text)
      return text
    }
    const startEdit = (rowIndex: number, flatCol: number, initial?: string) => {
      const c = flatCols.value[flatCol]
      const r = rowAt(rowIndex)
      if (!c || !r || r.kind !== 'data' || !isEditable(c.col, r.data)) return
      if (c.col.type === 'boolean') return record([{ row: r.data!, col: c.col, oldValue: cellValue(c, r.data), newValue: !cellValue(c, r.data) }])
      editing.value = { row: rowIndex, colId: c.id, value: initial ?? (cellValue(c, r.data) as CellValue) }
      nextTick(() => {
        const el = viewport.value?.querySelector<HTMLInputElement>('.sq-datagrid__editor')
        el?.focus()
        if (initial === undefined) el?.select?.()
      })
    }
    const onEditorInput = (e: Event) => editing.value && (editing.value = { ...editing.value, value: (e.target as HTMLInputElement).value })
    const commitEdit = () => {
      const ed = editing.value
      if (!ed) return
      editing.value = null
      const r = rowAt(ed.row)
      const c = flatCols.value.find((x) => x.id === ed.colId)
      if (!r?.data || !c) return
      const newValue = parseFor(c.col, String(ed.value ?? ''), r.data)
      const oldValue = cellValue(c, r.data)
      if (newValue !== oldValue) record([{ row: r.data, col: c.col, oldValue, newValue }])
    }
    const cancelEdit = () => { editing.value = null; rootEl()?.focus() }
    const onEditorKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commitEdit(); rootEl()?.focus(); moveFocus(e.key === 'Enter' ? (e.shiftKey ? -1 : 1) : 0, e.key === 'Tab' ? (e.shiftKey ? -1 : 1) : 0, false) }
      else if (e.key === 'Escape') cancelEdit()
    }
    const onCellDblclick = (vr: VRow, rc: RCol) => rc.col && startEdit(vr.index, rc.flatIndex)

    const rootEl = () => viewport.value?.parentElement as HTMLElement | null
    const ensureVisible = (row: number, col: number) => {
      const el = viewport.value
      if (!el) return
      const offs = layout.value.offsets
      const top = offs ? offs[row] : row * props.rowHeight
      const h = offs ? offs[row + 1] - offs[row] : props.rowHeight
      const bodyTop = el.scrollTop
      const visibleH = el.clientHeight - headBlock.value
      if (top < bodyTop) el.scrollTop = top
      else if (top + h > bodyTop + visibleH) el.scrollTop = top + h - visibleH
      const c = flatCols.value[col]
      if (c && !c.pinned) {
        const ci = visibleCols.value.center.indexOf(c as (typeof visibleCols.value.center)[number])
        const x = centerOffsets.value[ci]
        const viewW = el.clientWidth - leftWidth.value - rightWidth.value
        if (x < el.scrollLeft) el.scrollLeft = x
        else if (x + c.width > el.scrollLeft + viewW) el.scrollLeft = x + c.width - viewW
      }
    }
    const moveFocus = (dr: number, dc: number, extend: boolean) => {
      const f = focus.value ?? { row: 0, col: 0 }
      const next = { row: clamp(f.row + dr, 0, Math.max(0, rowCount.value - 1)), col: clamp(f.col + dc, 0, Math.max(0, flatCols.value.length - 1)) }
      focus.value = next
      if (extend && anchor) setRange(anchor, next)
      else { anchor = next; setRange(next, next) }
      ensureVisible(next.row, next.col)
    }
    const rangeCells = () => {
      const r = cellRange.value ?? (focus.value ? { startRow: focus.value.row, endRow: focus.value.row, startCol: focus.value.col, endCol: focus.value.col } : null)
      return r
    }
    const copy = async (withHeaders = false) => {
      const r = rangeCells()
      let lines: string[][] = []
      let header: string[] = []
      if (props.rowSelection && selectedIds.value.length && (!r || (r.startRow === r.endRow && r.startCol === r.endCol))) {
        const cols = flatCols.value.filter((c) => !c.auto)
        header = cols.map((c) => c.title)
        const sel = selectedSet.value
        lines = viewIdx.value.filter((i) => sel.has(rowIdOf(viewRows.value[i], i))).map((i) => cols.map((c) => String(cellValue(c, viewRows.value[i]) ?? '')))
      } else if (r) {
        const cols = flatCols.value.slice(r.startCol, r.endCol + 1).filter((c) => !c.auto)
        header = cols.map((c) => c.title)
        for (let i = r.startRow; i <= r.endRow; i++) {
          const row = rowAt(i)
          if (row?.kind === 'data') lines.push(cols.map((c) => String(cellValue(c, row.data) ?? '')))
        }
      }
      const text = [...(withHeaders ? [header] : []), ...lines].map((l) => l.join('\t')).join('\n')
      try { await navigator.clipboard.writeText(text) } catch { /* clipboard unavailable (insecure context) */ }
      return text
    }
    const onPaste = (e: ClipboardEvent) => {
      if (editing.value || !focus.value) return
      const text = e.clipboardData?.getData('text/plain')
      if (!text) return
      e.preventDefault()
      const grid = parseTsv(text)
      const changes: Change[] = []
      grid.forEach((line, dr) => line.forEach((cellText, dc) => {
        const row = rowAt(focus.value!.row + dr)
        const c = flatCols.value[focus.value!.col + dc]
        if (row?.kind === 'data' && c && !c.auto && isEditable(c.col, row.data)) changes.push({ row: row.data!, col: c.col, oldValue: cellValue(c, row.data), newValue: parseFor(c.col, cellText, row.data!) })
      }))
      record(changes)
    }
    const clearRange = () => {
      const r = rangeCells()
      if (!r) return
      const changes: Change[] = []
      for (let i = r.startRow; i <= r.endRow; i++)
        for (let j = r.startCol; j <= r.endCol; j++) {
          const row = rowAt(i)
          const c = flatCols.value[j]
          if (row?.kind === 'data' && c && !c.auto && isEditable(c.col, row.data)) changes.push({ row: row.data!, col: c.col, oldValue: cellValue(c, row.data), newValue: c.col.type === 'number' ? null : '' })
        }
      record(changes)
    }
    const onKeydown = (e: KeyboardEvent) => {
      if (editing.value || (e.target as HTMLElement).closest('input, select, textarea, .sq-datagrid__toolbar')) return
      const mod = e.ctrlKey || e.metaKey
      const page = Math.max(1, Math.floor((vpHeight.value - headBlock.value) / props.rowHeight) - 1)
      const map: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1], PageUp: [-page, 0], PageDown: [page, 0] }
      if (map[e.key]) { e.preventDefault(); moveFocus(map[e.key][0], map[e.key][1], e.shiftKey) }
      else if (e.key === 'Home') { e.preventDefault(); moveFocus(mod ? -rowCount.value : 0, -flatCols.value.length, e.shiftKey) }
      else if (e.key === 'End') { e.preventDefault(); moveFocus(mod ? rowCount.value : 0, flatCols.value.length, e.shiftKey) }
      else if (e.key === 'Tab' && focus.value) { e.preventDefault(); moveFocus(0, e.shiftKey ? -1 : 1, false) }
      else if ((e.key === 'Enter' || e.key === 'F2') && focus.value) { e.preventDefault(); const r = rowAt(focus.value.row); r?.kind === 'group' ? toggleGroup(r) : startEdit(focus.value.row, focus.value.col) }
      else if (e.key === ' ' && focus.value && props.rowSelection) { e.preventDefault(); const r = rowAt(focus.value.row); if (r && r.kind !== 'loading' && r.kind !== 'detail') toggleRowCheck(r) }
      else if (mod && e.key.toLowerCase() === 'c') { e.preventDefault(); copy(e.shiftKey) }
      else if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); if (props.rowSelection === 'multiple') setSelected(dataIdsInView()); else cellRange.value = { startRow: 0, endRow: rowCount.value - 1, startCol: 0, endCol: flatCols.value.length - 1 } }
      else if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() }
      else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo() }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); clearRange() }
      else if (e.key.length === 1 && !mod && focus.value) startEdit(focus.value.row, focus.value.col, e.key)
    }

    // ---------- menus ----------
    const menuOpen = ref(false)
    const menuAnchor = ref<HTMLElement | null>(null)
    const menuColId = ref<string | null>(null)
    const menuMode = ref<'column' | 'context'>('column')
    const ctxPos = ref({ x: 0, y: 0 })
    const menuCol = computed(() => (menuColId.value ? flatCols.value.find((c) => c.id === menuColId.value) ?? null : null))
    const menuFormatter = (v: CellValue) => (menuCol.value ? formatValue(menuCol.value.col, v, null) : String(v ?? ''))
    const openMenu = (e: MouseEvent, id: string) => {
      menuMode.value = 'column'
      menuColId.value = id
      menuAnchor.value = e.currentTarget as HTMLElement
      menuOpen.value = true
    }
    const openContext = (e: MouseEvent, vr: VRow, rc: RCol) => {
      if (!rc.col) return
      if (!inRange(vr.index, rc.flatIndex)) { const p = { row: vr.index, col: rc.flatIndex }; focus.value = p; anchor = p; setRange(p, p) }
      const rect = rootEl()!.getBoundingClientRect()
      ctxPos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      menuMode.value = 'context'
      menuColId.value = rc.id
      menuAnchor.value = ctxAnchor.value
      menuOpen.value = true
    }

    // ---------- export ----------
    const exportCsv = (opts: { fileName?: string; onlySelected?: boolean; separator?: string } = {}) => {
      const cols = flatCols.value.filter((c) => !c.auto)
      const sel = selectedSet.value
      const idx = isServer.value ? [] : viewIdx.value.filter((i) => !opts.onlySelected || sel.has(rowIdOf(viewRows.value[i], i)))
      const body = idx.map((i) => cols.map((c) => formatValue(c.col, cellValue(c, viewRows.value[i]), viewRows.value[i])))
      const csv = toCsv(cols.map((c) => c.title), body, opts.separator)
      downloadText(opts.fileName ?? 'export.csv', '﻿' + csv, 'text/csv;charset=utf-8')
      return csv
    }

    // ---------- totals / status ----------
    const bottomRows = computed(() => {
      const extra: RowData[] = []
      if (props.totalsRow && !isServer.value) {
        const r: RowData = {}
        for (const c of viewCols.value) if (c.aggFunc) {
          const get = makeGetter(c)
          const v = aggregate(viewIdx.value.map((i) => get(viewRows.value[i])), c.aggFunc)
          if (c.field) setByPath(r, c.field, v)
          else r[colIdOf(c)] = v
        }
        extra.push(r)
      }
      return [...props.pinnedBottomRows, ...extra]
    })
    const statusText = computed(() => {
      if (isServer.value) return `${serverCount.value.toLocaleString(loc.value)} rows`
      const total = raw.value.length
      const shown = filteredIdx.value.length
      return shown === total ? `${total.toLocaleString(loc.value)} rows` : `${shown.toLocaleString(loc.value)} of ${total.toLocaleString(loc.value)} rows`
    })
    const rangeStats = computed(() => {
      const r = cellRange.value
      if (!r || (r.startRow === r.endRow && r.startCol === r.endCol)) return null
      const nums: number[] = []
      let count = 0
      const maxCells = 200_000
      for (let i = r.startRow; i <= r.endRow && count < maxCells; i++) {
        const row = rowAt(i)
        if (row?.kind !== 'data') continue
        for (let j = r.startCol; j <= r.endCol; j++) {
          const c = flatCols.value[j]
          if (!c || c.auto) continue
          const v = cellValue(c, row.data)
          if (v != null && v !== '') count++
          if (typeof v === 'number') nums.push(v)
        }
      }
      if (!nums.length) return { count, sum: 0, avg: 0, min: 0, max: 0 }
      const sum = nums.reduce((a, b) => a + b, 0)
      return { count, sum, avg: sum / nums.length, min: Math.min(...nums), max: Math.max(...nums) }
    })

    // ---------- classes ----------
    const headerCellClass = (rc: RCol) => ({
      'sq-datagrid__hcell--pinned-left': rc.pinned === 'left',
      'sq-datagrid__hcell--pinned-right': rc.pinned === 'right',
      'sq-datagrid__hcell--edge-left': rc.edgeLeft,
      'sq-datagrid__hcell--edge-right': rc.edgeRight,
      'sq-datagrid__hcell--sortable': !!rc.col && !rc.auto && rc.col.sortable !== false,
      'sq-datagrid__hcell--spacer': !rc.col,
      'sq-datagrid__hcell--drop-before': dropTarget.value?.id === rc.id && dropTarget.value.before,
      'sq-datagrid__hcell--drop-after': dropTarget.value?.id === rc.id && !dropTarget.value.before,
      [`sq-datagrid__align-${rc.col?.align ?? (rc.col?.type === 'number' ? 'right' : 'left')}`]: true,
      [rc.col?.headerClass ?? '']: !!rc.col?.headerClass,
    })
    const cellAlignClass = (rc: RCol) => ({
      'sq-datagrid__cell--pinned-left': rc.pinned === 'left',
      'sq-datagrid__cell--pinned-right': rc.pinned === 'right',
      'sq-datagrid__cell--edge-left': !!rc.edgeLeft,
      'sq-datagrid__cell--edge-right': !!rc.edgeRight,
      [`sq-datagrid__align-${rc.col?.align ?? (rc.col?.type === 'number' ? 'right' : rc.col?.type === 'boolean' ? 'center' : 'left')}`]: !!rc.col,
    })
    const cellClass = (vr: VRow, rc: RCol) => {
      const base: Record<string, boolean> = cellAlignClass(rc)
      if (!rc.col) return base
      base['sq-datagrid__cell--focused'] = !!focus.value && focus.value.row === vr.index && focus.value.col === rc.flatIndex
      base['sq-datagrid__cell--range'] = inRange(vr.index, rc.flatIndex)
      base['sq-datagrid__cell--editable'] = vr.row.kind === 'data' && isEditable(rc.col, vr.row.data)
      if (rc.col.cellClass && vr.row.kind === 'data') {
        const extra = typeof rc.col.cellClass === 'function' ? rc.col.cellClass({ value: cellValue(rc, vr.row.data), row: vr.row.data!, column: rc.col, rowIndex: vr.index }) : rc.col.cellClass
        if (extra) base[extra] = true
      }
      return base
    }
    const cellStyle = (vr: VRow, rc: RCol) => {
      if (!rc.col?.cellStyle || vr.row.kind !== 'data') return rc.style
      const extra = typeof rc.col.cellStyle === 'function' ? rc.col.cellStyle({ value: cellValue(rc, vr.row.data), row: vr.row.data!, column: rc.col, rowIndex: vr.index }) : rc.col.cellStyle
      return extra ? { ...rc.style, ...extra } : rc.style
    }
    const rowClass = (vr: VRow) => {
      const c: Record<string, boolean> = {
        'sq-datagrid__row--group': vr.row.kind === 'group',
        'sq-datagrid__row--detail': vr.row.kind === 'detail',
        'sq-datagrid__row--selected': vr.row.kind === 'data' && selectedSet.value.has(vr.row.id),
        'sq-datagrid__row--odd': vr.index % 2 === 1,
      }
      if (props.rowClassName && vr.row.data && vr.row.kind === 'data') { const x = props.rowClassName(vr.row.data); if (x) c[x] = true }
      return c
    }
    const showLoading = computed(() => props.loading || (isServer.value && serverLoading.value && serverCount.value === 0))
    const rootStyle = { '--sq-r': 'var(--sq-radius-xl)', '--sq-bg': 'var(--sq-surface)', '--sq-bd': 'var(--sq-border)', '--sq-bw': '1px', '--sq-grid-row-h': `${props.rowHeight}px` }

    const api = {
      getSelectedRows: () => (isServer.value ? [] : viewIdx.value.map((i) => viewRows.value[i]).filter((r, k) => selectedSet.value.has(rowIdOf(r, viewIdx.value[k])))),
      getDisplayedRows: () => display.value,
      selectAll: () => setSelected(dataIdsInView()),
      deselectAll: () => setSelected([]),
      exportCsv,
      copy,
      undo,
      redo,
      expandAll,
      collapseAll,
      autoSize,
      refresh: () => (isServer.value ? purge() : dataVersion.value++),
      ensureIndexVisible: (i: number) => ensureVisible(i, focus.value?.col ?? 0),
      getColumnState: () => flatCols.value.filter((c) => !c.auto).map((c) => ({ colId: c.id, width: c.width, hide: false, pinned: c.pinned })),
      setColumnState: (state: { colId: string; width?: number; hide?: boolean; pinned?: 'left' | 'right' | null }[]) => {
        colOrder.value = [...state.map((s) => s.colId), ...colOrder.value.filter((id) => !state.some((s) => s.colId === id))]
        colWidth.value = { ...colWidth.value, ...Object.fromEntries(state.filter((s) => s.width).map((s) => [s.colId, s.width!])) }
        colHidden.value = { ...colHidden.value, ...Object.fromEntries(state.filter((s) => s.hide !== undefined).map((s) => [s.colId, s.hide!])) }
        colPinned.value = { ...colPinned.value, ...Object.fromEntries(state.filter((s) => s.pinned !== undefined).map((s) => [s.colId, s.pinned!])) }
      },
    }

    return {
      ...api, api, viewport, ctxAnchor, scrollLeft, vpWidth, isServer, quick, groupBy, selectedIds, selectedSet, sortModelList, filterModelObj,
      renderCols, flatCols, totalWidth, hasHeaderGroups, headerGroups, layout, visibleRows, rowCount, filterRowHeight, page, pageSizeState, pageCount, onPageSize, pageRangeText,
      hasGroups, detailOpen, onScroll, cellValue, formatValue, formatCell, cellParams, groupLabel, groupAggText, filterKind, distinctValues, sortIndex, sortDir, ariaSort, setSort,
      onHeaderClick, setFilter, floatingValue, onFloatingInput, toggleGroupBy, removeGroup, toggleGroup, toggleDetail, setHidden, setPinned, chooserCols, startResize,
      dragColId, onDragStart, onDragOver, onDrop, onGroupDrop, allSelected, someSelected, toggleAll, isRowChecked, isRowPartial, toggleRowCheck, onRowClick,
      onCellMousedown, onCellEnter, editing, isEditing, editorKind, onEditorInput, commitEdit, onEditorKey, onCellDblclick, canUndo, onKeydown, onPaste,
      menuOpen, menuAnchor, menuMode, menuCol, menuFormatter, openMenu, openContext, ctxPos, bottomRows, statusText, rangeStats, fmtNum, headerCellClass, cellAlignClass, cellClass, cellStyle,
      rowClass, showLoading, rootStyle, titleOf, toUnit, getByPath, has: (n: string) => !!slots[n], messages: computed(() => config.locale.messages),
    }
  },
})
</script>

<style>
.sq-datagrid { display: flex; flex-direction: column; overflow: hidden; color: var(--sq-on-surface); font-size: var(--sq-text-sm); outline: none; min-width: 0; }
.sq-datagrid:focus-visible { box-shadow: var(--sq-focus-ring); }
.sq-datagrid__toolbar { display: flex; align-items: center; gap: var(--sq-space-2); padding: var(--sq-space-2) var(--sq-space-3); border-bottom: 1px solid var(--sq-border); }
.sq-datagrid__quick { max-width: 280px; }
.sq-datagrid__chooser { display: flex; flex-direction: column; padding: var(--sq-space-1) var(--sq-space-3); max-height: 340px; overflow: auto; }
.sq-datagrid__group-panel { display: flex; align-items: center; flex-wrap: wrap; gap: var(--sq-space-2); min-height: 42px; padding: var(--sq-space-1) var(--sq-space-3); border-bottom: 1px dashed var(--sq-border); color: var(--sq-muted); background: color-mix(in srgb, var(--sq-surface-variant) 50%, transparent); }
.sq-datagrid__group-hint { font-size: var(--sq-text-xs); }
.sq-datagrid__viewport { position: relative; overflow: auto; overscroll-behavior: contain; flex: 1 1 auto; }
.sq-datagrid__canvas { position: relative; min-width: 100%; }
.sq-datagrid__head { position: sticky; top: 0; z-index: 4; background: var(--sq-surface-variant); }
.sq-datagrid__foot { position: sticky; bottom: 0; z-index: 4; background: var(--sq-surface-variant); border-top: 1px solid var(--sq-border-strong); }
.sq-datagrid__header-row { display: flex; border-bottom: 1px solid var(--sq-border); }
.sq-datagrid__hcell, .sq-datagrid__header-group {
  position: relative; display: flex; align-items: center; gap: 4px; flex: none; padding: 0 var(--sq-space-3);
  font-size: var(--sq-text-xs); font-weight: var(--sq-weight-semibold); color: var(--sq-on-surface-variant); user-select: none; background: var(--sq-surface-variant); min-width: 0;
}
.sq-datagrid__header-group { justify-content: center; border-inline-end: 1px solid var(--sq-border); letter-spacing: 0.02em; }
.sq-datagrid__header-group--empty { border-inline-end-color: transparent; }
.sq-datagrid__hcell--sortable { cursor: pointer; }
.sq-datagrid__hcell--sortable:hover { color: var(--sq-on-surface); }
.sq-datagrid__htitle { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sq-datagrid__align-right { justify-content: flex-end; text-align: right; }
.sq-datagrid__align-center { justify-content: center; text-align: center; }
.sq-datagrid__hcell.sq-datagrid__align-right { flex-direction: row-reverse; }
.sq-datagrid__sort { display: inline-flex; align-items: center; color: var(--sq-primary); }
.sq-datagrid__sort sup { font-size: 9px; }
.sq-datagrid__filtered { color: var(--sq-primary); }
.sq-datagrid__menu-btn { display: flex; margin-inline-start: auto; padding: 2px; border: 0; background: none; color: inherit; border-radius: var(--sq-radius-xs); cursor: pointer; opacity: 0; transition: opacity var(--sq-duration-fast); }
.sq-datagrid__align-right .sq-datagrid__menu-btn { margin-inline-start: 0; margin-inline-end: auto; }
.sq-datagrid__hcell:hover .sq-datagrid__menu-btn, .sq-datagrid__menu-btn:focus-visible { opacity: 1; }
.sq-datagrid__menu-btn:hover { background: color-mix(in srgb, var(--sq-on-surface) 10%, transparent); }
.sq-datagrid__resizer { position: absolute; top: 20%; bottom: 20%; right: 0; width: 7px; cursor: col-resize; border-right: 2px solid transparent; z-index: 1; }
.sq-datagrid__hcell:hover .sq-datagrid__resizer { border-right-color: var(--sq-border-strong); }
.sq-datagrid__resizer:hover { border-right-color: var(--sq-primary) !important; }
.sq-datagrid__hcell--drop-before { box-shadow: inset 3px 0 0 var(--sq-primary); }
.sq-datagrid__hcell--drop-after { box-shadow: inset -3px 0 0 var(--sq-primary); }
.sq-datagrid__fcell { padding: 0 6px; }
.sq-datagrid__ffilter { --sq-r: var(--sq-radius-xs); width: 100%; height: 28px; padding: 0 8px; border: 1px solid var(--sq-border); background: var(--sq-surface); color: var(--sq-on-surface); font: inherit; font-size: var(--sq-text-xs); outline: none; }
.sq-datagrid__ffilter:focus { border-color: var(--sq-primary); }
.sq-datagrid__body { position: relative; }
.sq-datagrid__row { position: absolute; top: 0; left: 0; display: flex; min-width: 100%; border-bottom: 1px solid var(--sq-border); background: var(--sq-surface); contain: layout style; }
.sq-datagrid__row--pinned { position: relative; background: var(--sq-surface-variant); font-weight: var(--sq-weight-medium); }
.sq-datagrid--striped .sq-datagrid__row--odd { background: color-mix(in srgb, var(--sq-surface-variant) 45%, var(--sq-surface)); }
.sq-datagrid__row:hover { --sq-row-hover: color-mix(in srgb, var(--sq-primary) 5%, var(--sq-surface)); background: var(--sq-row-hover); }
.sq-datagrid__row--selected, .sq-datagrid__row--selected:hover { background: color-mix(in srgb, var(--sq-primary) 11%, var(--sq-surface)) !important; }
.sq-datagrid__row--group { font-weight: var(--sq-weight-semibold); background: color-mix(in srgb, var(--sq-surface-variant) 60%, var(--sq-surface)); }
.sq-datagrid__cell { position: relative; display: flex; align-items: center; flex: none; min-width: 0; padding: 0 var(--sq-space-3); white-space: nowrap; overflow: hidden; background: inherit; outline: none; }
.sq-datagrid--column-lines .sq-datagrid__cell, .sq-datagrid--column-lines .sq-datagrid__hcell { border-inline-end: 1px solid var(--sq-border); }
.sq-datagrid__cell--pinned-left, .sq-datagrid__hcell--pinned-left { position: sticky; z-index: 2; }
.sq-datagrid__cell--pinned-right, .sq-datagrid__hcell--pinned-right { position: sticky; z-index: 2; }
.sq-datagrid--scrolled-x .sq-datagrid__cell--edge-left, .sq-datagrid--scrolled-x .sq-datagrid__hcell--edge-left { box-shadow: 6px 0 8px -6px rgb(16 18 35 / 0.25); }
.sq-datagrid__cell--edge-right, .sq-datagrid__hcell--edge-right { box-shadow: -6px 0 8px -6px rgb(16 18 35 / 0.25); }
.sq-datagrid__cell--range { background: color-mix(in srgb, var(--sq-primary) 14%, var(--sq-surface)) !important; }
.sq-datagrid__cell--focused { box-shadow: inset 0 0 0 2px var(--sq-primary) !important; border-radius: var(--sq-radius-xs); }
.sq-datagrid__text { overflow: hidden; text-overflow: ellipsis; }
.sq-datagrid__bool { display: inline-flex; color: var(--sq-border-strong); }
.sq-datagrid__bool--on { color: var(--sq-success); }
.sq-datagrid__check { min-height: 0 !important; }
.sq-datagrid__group-cell { display: flex; align-items: center; gap: 4px; min-width: 0; }
.sq-datagrid__expander { display: flex; padding: 1px; border: 0; background: none; color: var(--sq-muted); border-radius: var(--sq-radius-xs); cursor: pointer; transition: transform var(--sq-duration) var(--sq-ease); }
.sq-datagrid__expander:hover { background: color-mix(in srgb, var(--sq-on-surface) 8%, transparent); color: var(--sq-on-surface); }
.sq-datagrid__expander--open { transform: rotate(90deg); }
.sq-datagrid__expander-spacer { width: 20px; flex: none; }
.sq-datagrid__group-key { overflow: hidden; text-overflow: ellipsis; }
.sq-datagrid__group-count { padding: 0 7px; border-radius: var(--sq-radius-pill); background: color-mix(in srgb, var(--sq-primary) 14%, transparent); color: var(--sq-primary); font-size: var(--sq-text-2xs); font-weight: var(--sq-weight-bold); }
.sq-datagrid__agg { color: var(--sq-on-surface-variant); font-variant-numeric: tabular-nums; }
.sq-datagrid__align-right .sq-datagrid__text { font-variant-numeric: tabular-nums; }
.sq-datagrid__editor-wrap { position: absolute; inset: 2px; display: flex; }
.sq-datagrid__editor { width: 100%; height: 100%; padding: 0 8px; border: 2px solid var(--sq-primary); border-radius: var(--sq-radius-xs); background: var(--sq-surface); color: var(--sq-on-surface); font: inherit; outline: none; }
.sq-datagrid__skeleton { position: relative; display: block; width: 70%; height: 10px; border-radius: var(--sq-radius-xs); }
.sq-datagrid__detail { position: sticky; left: 0; height: 100%; padding: var(--sq-space-3) var(--sq-space-4); overflow: auto; background: color-mix(in srgb, var(--sq-surface-variant) 40%, var(--sq-surface)); }
.sq-datagrid__overlay { position: absolute; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--sq-surface) 55%, transparent); pointer-events: none; }
.sq-datagrid__overlay--empty { background: none; }
.sq-datagrid__footer { display: flex; align-items: center; flex-wrap: wrap; gap: var(--sq-space-3); min-height: 40px; padding: 4px var(--sq-space-3); border-top: 1px solid var(--sq-border); color: var(--sq-muted); font-size: var(--sq-text-xs); }
.sq-datagrid__status { display: flex; gap: var(--sq-space-2); flex-wrap: wrap; }
.sq-datagrid__range-stats { color: var(--sq-on-surface-variant); font-variant-numeric: tabular-nums; }
.sq-datagrid__page-size { display: inline-flex; align-items: center; gap: 6px; }
.sq-datagrid__page-select { --sq-r: var(--sq-radius-xs); height: 26px; padding: 0 6px; border: 1px solid var(--sq-border); background: var(--sq-surface); color: var(--sq-on-surface); font: inherit; }
.sq-datagrid__menu { min-width: 220px; padding: 2px 0; }
.sq-datagrid__menu .sq-list-item { min-height: 34px; padding-block: 4px; font-size: var(--sq-text-sm); }
.sq-datagrid__ctx-anchor { position: absolute; width: 1px; height: 1px; pointer-events: none; }
</style>
