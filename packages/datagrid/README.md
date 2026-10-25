# @squirkle-ui/datagrid

Data grid: sort, filter, group, aggregate, pivot, tree data, master/detail, pinning, editing with undo, range selection, clipboard, CSV, virtual scroll, server-side model for [Squirkle UI](https://www.npmjs.com/package/squirkle-ui). Works with Vue 3 and Vue 2.7.

## Install
```bash
npm i @squirkle-ui/datagrid @squirkle-ui/ui
```
Or get every component and add-on with [`squirkle-ui`](https://www.npmjs.com/package/squirkle-ui) and import from `squirkle-ui/datagrid`.

Peer dependencies: `vue`, `@squirkle-ui/ui`. Set up `@squirkle-ui/ui` first (`app.use(createSquirkle())` and `@squirkle-ui/ui/styles.css`).

## Usage
```ts
import { SqDataGrid } from '@squirkle-ui/datagrid'        // Vue 3
// import { SqDataGrid } from '@squirkle-ui/datagrid/vue2' // Vue 2.7
import '@squirkle-ui/datagrid/styles.css'
```
```vue
<template>
  <SqDataGrid :rows="rows" :columns="columns" :height="480" />
</template>
<script setup lang="ts">
import { SqDataGrid } from '@squirkle-ui/datagrid'
const rows = [{ name: 'Ada', department: 'R&D', salary: 120000 }]
const columns = [
  { field: 'name', sortable: true },
  { field: 'department', filter: 'set' },
  { field: 'salary', type: 'number', aggFunc: 'sum' },
]
</script>
```
Key props: `rows`, `columns`, `defaultColDef`, `rowId`, `height`, `rowHeight`, `headerHeight`. Slots: `cell`, `cell-<colId>`, `header-<colId>`, `detail`, `group`, `toolbar`, `loading`, `no-rows`.

Features: sorting and multi-sort, filters (text, number, set), row grouping with a drag-to-group panel, aggregation, totals and pinned rows, tree data, pivot mode, master/detail, pinned columns, header groups, resize and reorder, row and range selection, clipboard, cell editing with undo, CSV export, virtual scrolling, and a server-side datasource.


## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
