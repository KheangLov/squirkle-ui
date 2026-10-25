<template>
  <div class="doc-page" style="max-width:1320px">
    <h1>DataGrid</h1>
    <p class="lead"><code>@squirkle-ui/datagrid</code> — an enterprise data grid in a squircle frame. Everything below runs on 100,000 client rows or an infinite server-side model.</p>
    <SqTabs v-model="demo" variant="segmented" :items="demos" class="sq-mb-4" />

    <template v-if="demo === 'Enterprise'">
      <SqAlert type="info" variant="tonal" class="sq-mb-3" text="Try: sort (shift-click for multi-sort), drag headers to reorder or into the group bar, resize, column menu (⋮) for filters/pinning, drag-select cells for range stats, Ctrl+C / Ctrl+V, double-click to edit (Ctrl+Z undo), right-click for the context menu." />
      <SqDataGrid
        ref="grid"
        v-model:selected="selected"
        :rows="rows"
        :columns="columns"
        :default-col-def="{ sortable: true, resizable: true, filter: true }"
        row-selection="multiple"
        toolbar
        group-panel
        floating-filters
        totals-row
        striped
        :height="560"
        @cell-value-changed="log = `${$event.colId}: ${$event.oldValue} → ${$event.newValue}`"
      >
        <template #toolbar>
          <SqChip size="small" variant="tonal">{{ rows.length.toLocaleString() }} rows</SqChip>
          <SqBtn size="small" variant="text" color="surface" prepend-icon="plus" @click="grid?.expandAll()">Expand groups</SqBtn>
        </template>
        <template #cell-status="{ value }"><SqChip size="x-small" :color="statusColor(value)" variant="tonal">{{ value }}</SqChip></template>
        <template #cell-trend="{ value }"><SqSparkline :data="value" :width="90" :height="24" :color="value[value.length - 1] >= value[0] ? 'success' : 'error'" /></template>
        <template #cell-name="{ row }"><span class="sq-d-flex sq-align-center sq-gap-2"><SqAvatar :name="row.name" size="x-small" />{{ row.name }}</span></template>
      </SqDataGrid>
      <div class="sq-mt-2 sq-text-muted">Selected: {{ selected.length }} · Last edit: {{ log }}</div>
    </template>

    <template v-else-if="demo === 'Server-side infinite'">
      <SqAlert type="info" variant="tonal" class="sq-mb-3" text="1,000,000 virtual rows fetched in blocks of 100 from a simulated API (250 ms latency). Sorting, quick filter and column filters are sent to the server." />
      <SqDataGrid :datasource="datasource" :columns="serverCols" :default-col-def="{ sortable: true, resizable: true }" toolbar :height="520" />
    </template>

    <template v-else-if="demo === 'Tree data'">
      <SqDataGrid :rows="files" :columns="treeCols" tree-data :get-data-path="pathOf" :group-default-expanded="-1" :height="440" />
    </template>

    <template v-else-if="demo === 'Pivot'">
      <SqAlert type="info" variant="tonal" class="sq-mb-3" text="Pivot: rows grouped by Department, one column per Region, values = sum of Salary." />
      <SqDataGrid :rows="rows" :columns="columns" pivot-mode pivot-column="region" :group-by="['department']" :height="420" />
    </template>

    <template v-else>
      <SqDataGrid :rows="rows.slice(0, 200)" :columns="columns.slice(0, 6)" master-detail :detail-height="180" pagination :page-size="25" :height="520">
        <template #detail="{ row }">
          <div class="sq-d-flex sq-gap-4 sq-flex-wrap">
            <SqLineChart flat :height="130" :labels="['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8']" :series="[{ name: 'Performance', data: row.trend }]" style="flex:1;min-width:280px" />
            <div><b>{{ row.name }}</b><div class="sq-text-muted">{{ row.email }}</div><div>{{ row.department }} · {{ row.region }}</div></div>
          </div>
        </template>
      </SqDataGrid>
    </template>

    <h2>Feature list</h2>
    <div class="doc-grid">
      <SqSheet v-for="f in features" :key="f" border class="sq-pa-3 sq-d-flex sq-gap-2 sq-align-center"><SqIcon icon="check" color="success" />{{ f }}</SqSheet>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw, ref } from 'vue'
import type { ColumnDef, Datasource } from '@squirkle-ui/datagrid'

const demos = ['Enterprise', 'Server-side infinite', 'Tree data', 'Pivot', 'Master / detail']
const demo = ref('Enterprise')
const grid = ref<{ expandAll: () => void } | null>(null)
const selected = ref<string[]>([])
const log = ref('—')
const first = ['Alice', 'Bob', 'Chen', 'Dara', 'Eva', 'Farah', 'Gus', 'Hana', 'Ivan', 'Jana', 'Kosal', 'Lina', 'Minh', 'Nora', 'Omar', 'Pich']
const last = ['Smith', 'Sok', 'Wei', 'Müller', 'Khan', 'Lee', 'Ito', 'Novak', 'Chea', 'Garcia', 'Silva', 'Kim']
const depts = ['Engineering', 'Sales', 'Marketing', 'Finance', 'Support', 'Design']
const regions = ['APAC', 'EMEA', 'NA', 'LATAM']
const statuses = ['Active', 'On leave', 'Probation', 'Contractor']
let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const rows = markRaw(Array.from({ length: 100_000 }, (_, i) => {
  const name = `${first[i % first.length]} ${last[(i * 7) % last.length]}`
  return {
    id: i + 1, name, email: `${name.toLowerCase().replace(/\W+/g, '.')}${i}@acme.io`, department: depts[i % depts.length], region: regions[(i * 3) % regions.length],
    status: statuses[Math.floor(rnd() * 4)], salary: Math.round(42000 + rnd() * 120000), bonus: Math.round(rnd() * 15) , joined: new Date(2015 + Math.floor(rnd() * 11), Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 27)).toISOString().slice(0, 10),
    remote: rnd() > 0.5, rating: Math.round(rnd() * 50) / 10, trend: Array.from({ length: 8 }, () => Math.round(40 + rnd() * 60)),
  }
}))
const money = (v: unknown) => (v == null ? '' : `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`)
const columns: ColumnDef[] = [
  { field: 'id', headerName: 'ID', width: 90, type: 'number', pinned: 'left' },
  { field: 'name', width: 210, pinned: 'left', editable: true },
  { field: 'email', width: 260, group: 'Contact' },
  { field: 'department', width: 150, filter: 'set', group: 'Org' },
  { field: 'region', width: 120, filter: 'set', group: 'Org' },
  { field: 'status', width: 140, filter: 'set', editable: true, cellEditor: 'select', cellEditorParams: { values: statuses } },
  { field: 'salary', type: 'number', width: 140, aggFunc: 'sum', valueFormatter: money, editable: true, group: 'Compensation', cellClass: (p) => (Number(p.value) > 150000 ? 'doc-high' : undefined) },
  { field: 'bonus', headerName: 'Bonus %', type: 'number', width: 110, aggFunc: 'avg', group: 'Compensation' },
  { field: 'rating', type: 'number', width: 110, aggFunc: 'avg', editable: true },
  { field: 'joined', type: 'date', width: 140 },
  { field: 'remote', type: 'boolean', width: 100, editable: true },
  { field: 'trend', headerName: 'Trend', width: 130, sortable: false, filter: false },
]
const statusColor = (s: unknown) => ({ Active: 'success', 'On leave': 'warning', Probation: 'info', Contractor: 'secondary' })[String(s)] ?? 'surface'

// simulated server: 1M rows generated on demand
const serverCols: ColumnDef[] = [
  { field: 'id', type: 'number', width: 110 },
  { field: 'sku', width: 160 },
  { field: 'product', flex: 1, minWidth: 200 },
  { field: 'price', type: 'number', width: 130, valueFormatter: (v) => (v == null ? '' : `$${Number(v).toFixed(2)}`) },
  { field: 'stock', type: 'number', width: 110 },
]
const products = ['Squircle Lamp', 'Curve Chair', 'Smooth Desk', 'Arc Monitor', 'Round Mug', 'Soft Keyboard']
const gen = (i: number) => ({ id: i + 1, sku: `SQ-${(100000 + i).toString(36).toUpperCase()}`, product: `${products[i % 6]} ${Math.floor(i / 6) + 1}`, price: ((i * 37) % 900) + 9.99, stock: (i * 13) % 500 })
const datasource: Datasource = {
  async getRows({ startRow, endRow, sortModel, quickFilter }) {
    await new Promise((r) => setTimeout(r, 250))
    const total = quickFilter ? 50_000 : 1_000_000
    const desc = sortModel[0]?.sort === 'desc'
    const out = []
    for (let i = startRow; i < Math.min(endRow, total); i++) out.push(gen(desc ? total - 1 - i : i))
    return { rows: out, lastRow: total }
  },
}
const pathOf = (r: Record<string, unknown>) => r.path as string[]
const treeCols: ColumnDef[] = [
  { field: 'size', type: 'number', width: 120, aggFunc: 'sum', valueFormatter: (v) => (v == null ? '' : `${(Number(v) / 1024).toFixed(1)} KB`) },
  { field: 'modified', type: 'date', width: 150 },
  { field: 'owner', width: 140 },
]
const files = [
  { path: ['src'], owner: 'team' }, { path: ['src', 'components'], owner: 'team' },
  { path: ['src', 'components', 'SqBtn.vue'], size: 6200, modified: '2026-10-20', owner: 'dara' },
  { path: ['src', 'components', 'SqCard.vue'], size: 5100, modified: '2026-10-21', owner: 'eva' },
  { path: ['src', 'composables', 'virtual.ts'], size: 9800, modified: '2026-10-22', owner: 'chen' },
  { path: ['src', 'index.ts'], size: 1200, modified: '2026-10-23', owner: 'dara' },
  { path: ['docs', 'README.md'], size: 3400, modified: '2026-10-19', owner: 'hana' },
  { path: ['package.json'], size: 900, modified: '2026-10-24', owner: 'dara' },
]
const features = [
  'Row virtualization (100k+ rows)', 'Column virtualization', 'Infinite server-side row model', 'Multi-column sort', 'Text / number / date / set filters', 'Floating filters & quick filter',
  'Row grouping + drag-to-group panel', 'Aggregation (sum, avg, min, max, count)', 'Totals row & pinned rows', 'Tree data', 'Pivot mode', 'Master / detail',
  'Pinned left / right columns', 'Header groups', 'Resize, autosize, drag reorder', 'Column chooser & menu', 'Row selection (checkbox, shift, ctrl)', 'Cell range selection + status bar stats',
  'Cell editing (text, number, select, date, boolean)', 'Undo / redo', 'Clipboard copy & paste (TSV)', 'Context menu', 'CSV export', 'Pagination', 'Keyboard navigation', 'Custom cell & header slots',
]
</script>

<style>
.doc-high { color: var(--sq-success); font-weight: 600; }
</style>
