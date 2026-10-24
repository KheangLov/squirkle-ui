<template>
  <div class="sq-table sq-surface" :class="{ 'sq-table--striped': striped, 'sq-table--hover': hover, 'sq-table--dense': density === 'compact', 'sq-table--fixed-header': fixedHeader }" :style="{ '--sq-r': 'var(--sq-radius-lg)', '--sq-bg': 'var(--sq-surface)', '--sq-bd': 'var(--sq-border)', '--sq-bw': '1px' }">
    <SqShape clip />
    <div class="sq-table__wrapper" :style="{ maxHeight: toUnit(height) }">
      <table><slot /></table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { toUnit } from '@squirkle/core'
import SqShape from './SqShape.vue'

/** Styled native table. For sorting, filtering, virtualization and big data use SqDataGrid (@squirkle/datagrid). */
export default defineComponent({
  name: 'SqTable',
  components: { SqShape },
  props: {
    striped: Boolean,
    hover: { type: Boolean, default: true },
    fixedHeader: Boolean,
    height: { type: [Number, String], default: undefined },
    density: { type: String as PropType<'default' | 'compact'>, default: 'default' },
  },
  setup: () => ({ toUnit }),
})
</script>

<style>
.sq-table { overflow: hidden; }
.sq-table__wrapper { overflow: auto; border-radius: inherit; }
.sq-table table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: var(--sq-text-sm); }
.sq-table th { text-align: start; font-weight: var(--sq-weight-semibold); color: var(--sq-muted); font-size: var(--sq-text-xs); text-transform: uppercase; letter-spacing: 0.04em; background: var(--sq-surface-variant); }
.sq-table th, .sq-table td { padding: 12px 16px; border-bottom: 1px solid var(--sq-border); }
.sq-table tr:last-child td { border-bottom: 0; }
.sq-table--dense th, .sq-table--dense td { padding: 6px 12px; }
.sq-table--striped tbody tr:nth-child(even) td { background: color-mix(in srgb, var(--sq-surface-variant) 50%, transparent); }
.sq-table--hover tbody tr:hover td { background: color-mix(in srgb, var(--sq-primary) 6%, transparent); }
.sq-table--fixed-header th { position: sticky; top: 0; z-index: 1; }
</style>
