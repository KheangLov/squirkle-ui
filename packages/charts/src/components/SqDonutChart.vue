<template>
  <ChartFrame :title="title" :subtitle="subtitle" :flat="flat" :legend="legend" :table="table">
    <div class="sq-chart__donut" :style="{ height: size + 'px' }">
      <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" role="img" :aria-label="title || 'Donut chart'" @pointerleave="hover = -1">
        <path
          v-for="(a, i) in arcs"
          :key="a.label"
          :d="a.d"
          :fill="a.color"
          class="sq-chart__arc"
          :class="{ 'sq-chart__arc--dim': hover >= 0 && hover !== i }"
          @pointerenter="hover = i"
        />
      </svg>
      <div class="sq-chart__donut-center">
        <slot name="center" :hover="hover >= 0 ? data[hover] : null" :total="total">
          <div class="sq-chart__donut-value">{{ hover >= 0 ? fmt(data[hover].value) : fmt(total) }}</div>
          <div class="sq-chart__donut-label">{{ hover >= 0 ? data[hover].label : totalLabel }}</div>
        </slot>
      </div>
    </div>
  </ChartFrame>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue'
import ChartFrame from './ChartFrame.vue'
import { compact, seriesColor, type DonutDatum } from '../utils'

/** Pie / donut with a 2px surface gap between segments; legend always shown for 2+ segments. */
export default defineComponent({
  name: 'SqDonutChart',
  components: { ChartFrame },
  props: {
    data: { type: Array as PropType<DonutDatum[]>, default: () => [] },
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined },
    size: { type: Number, default: 220 },
    /** Ring thickness as a fraction of the radius; 1 = pie. */
    thickness: { type: Number, default: 0.34 },
    totalLabel: { type: String, default: 'Total' },
    flat: Boolean,
    format: { type: Function as PropType<(v: number) => string>, default: undefined },
  },
  setup(props) {
    const hover = ref(-1)
    const total = computed(() => props.data.reduce((s, d) => s + Math.max(0, d.value), 0))
    const fmt = (v: number) => (props.format ? props.format(v) : compact(v))
    const arcs = computed(() => {
      const c = props.size / 2
      const R = c - 4
      const r = R * (1 - props.thickness)
      const gap = props.data.length > 1 ? 2 / R : 0
      let a0 = -Math.PI / 2
      return props.data.map((d, i) => {
        const sweep = total.value ? (Math.max(0, d.value) / total.value) * Math.PI * 2 : 0
        const s = a0 + gap / 2
        const e = a0 + sweep - gap / 2
        a0 += sweep
        const large = e - s > Math.PI ? 1 : 0
        const p = (rad: number, ang: number) => `${c + rad * Math.cos(ang)},${c + rad * Math.sin(ang)}`
        const dPath = e <= s ? '' : r > 0
          ? `M${p(R, s)} A${R},${R} 0 ${large} 1 ${p(R, e)} L${p(r, e)} A${r},${r} 0 ${large} 0 ${p(r, s)} Z`
          : `M${c},${c} L${p(R, s)} A${R},${R} 0 ${large} 1 ${p(R, e)} Z`
        return { label: d.label, color: seriesColor(i, d.color), d: dPath }
      })
    })
    const legend = computed(() => props.data.map((d, i) => ({ name: `${d.label} · ${total.value ? Math.round((d.value / total.value) * 100) : 0}%`, color: seriesColor(i, d.color) })))
    const table = computed(() => ({ head: ['Label', 'Value'], rows: props.data.map((d) => [d.label, d.value]) }))
    return { hover, total, fmt, arcs, legend, table }
  },
})
</script>
