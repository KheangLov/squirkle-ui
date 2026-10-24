<template>
  <figure class="sq-chart sq-surface" :class="{ 'sq-chart--flat': flat }">
    <SqShape v-if="!flat" />
    <figcaption v-if="title || subtitle" class="sq-chart__caption">
      <div v-if="title" class="sq-chart__title">{{ title }}</div>
      <div v-if="subtitle" class="sq-chart__subtitle">{{ subtitle }}</div>
    </figcaption>
    <div v-if="legend.length > 1" class="sq-chart__legend" role="list">
      <span v-for="(l, i) in legend" :key="l.name" class="sq-chart__legend-item" role="listitem">
        <span class="sq-chart__swatch" :style="{ background: l.color }"></span>{{ l.name }}
      </span>
    </div>
    <slot />
    <table class="sq-sr-only">
      <caption>{{ title || 'Chart data' }}</caption>
      <thead><tr><th v-for="h in table.head" :key="h">{{ h }}</th></tr></thead>
      <tbody><tr v-for="(r, i) in table.rows" :key="i"><td v-for="(c, j) in r" :key="j">{{ c }}</td></tr></tbody>
    </table>
  </figure>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { SqShape } from '@squirkle-ui/ui'

/** Card, caption, legend and an accessible data table shared by every chart (internal). */
export default defineComponent({
  name: 'SqChartFrame',
  components: { SqShape },
  props: {
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined },
    flat: Boolean,
    legend: { type: Array as PropType<{ name: string; color: string }[]>, default: () => [] },
    table: { type: Object as PropType<{ head: string[]; rows: (string | number)[][] }>, default: () => ({ head: [], rows: [] }) },
  },
})
</script>
