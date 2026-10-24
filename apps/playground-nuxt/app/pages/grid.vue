<template>
  <SqDataGrid v-model:selected="selected" :rows="rows" :columns="columns" row-selection="multiple" toolbar group-panel totals-row :height="480" />
  <div id="selected">Selected: {{ selected.length }}</div>
</template>

<script setup lang="ts">
import type { ColumnDef } from '@squirkle-ui/datagrid'

const rows = markRaw(Array.from({ length: 20000 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}`, team: ['Core', 'Web', 'Ops'][i % 3], score: (i * 37) % 100 })))
const columns: ColumnDef[] = [
  { field: 'id', type: 'number', width: 90 },
  { field: 'name', flex: 1, editable: true },
  { field: 'team', filter: 'set' },
  { field: 'score', type: 'number', aggFunc: 'avg' },
]
const selected = ref<string[]>([])
</script>
