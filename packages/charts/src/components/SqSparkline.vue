<template>
  <svg ref="el" class="sq-sparkline" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="label">
    <path v-if="fill" :d="areaD" :fill="stroke" class="sq-sparkline__area" />
    <path :d="lineD" :stroke="stroke" class="sq-sparkline__line" />
    <circle v-if="pts.length" :cx="pts[pts.length - 1][0]" :cy="pts[pts.length - 1][1]" r="2.5" :fill="stroke" />
  </svg>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { colorValue } from '@squirkle/ui'
import { smoothPath } from '../utils'

/** Inline trend line for stat tiles and table cells (no axes, no tooltip). */
export default defineComponent({
  name: 'SqSparkline',
  props: {
    data: { type: Array as PropType<number[]>, default: () => [] },
    width: { type: Number, default: 120 },
    height: { type: Number, default: 32 },
    color: { type: String, default: 'primary' },
    fill: Boolean,
    label: { type: String, default: 'Trend' },
  },
  setup(props) {
    const pts = computed<[number, number][]>(() => {
      const d = props.data
      if (!d.length) return []
      const min = Math.min(...d)
      const max = Math.max(...d)
      const span = max - min || 1
      return d.map((v, i) => [3 + ((props.width - 6) * i) / Math.max(1, d.length - 1), 3 + (props.height - 6) * (1 - (v - min) / span)])
    })
    const lineD = computed(() => smoothPath(pts.value))
    const areaD = computed(() => (pts.value.length ? `${lineD.value} L${pts.value[pts.value.length - 1][0]},${props.height} L${pts.value[0][0]},${props.height} Z` : ''))
    return { pts, lineD, areaD, stroke: computed(() => colorValue(props.color)) }
  },
})
</script>
