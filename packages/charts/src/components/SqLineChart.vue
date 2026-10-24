<template>
  <ChartFrame :title="title" :subtitle="subtitle" :flat="flat" :legend="legend" :table="table">
    <div ref="box" class="sq-chart__plot" :style="{ height: height + 'px' }" @pointermove="onMove" @pointerleave="hover = -1">
      <svg :width="w" :height="height" role="img" :aria-label="title || 'Line chart'">
        <g class="sq-chart__grid">
          <line v-for="t in y.ticks" :key="'g' + t" :x1="pad.l" :x2="w - pad.r" :y1="sy(t)" :y2="sy(t)" />
        </g>
        <g class="sq-chart__axis">
          <text v-for="t in y.ticks" :key="'y' + t" :x="pad.l - 8" :y="sy(t)" text-anchor="end" dominant-baseline="middle">{{ fmt(t) }}</text>
          <text v-for="(l, i) in labels" v-show="showLabel(i)" :key="'x' + i" :x="sx(i)" :y="height - 6" text-anchor="middle">{{ l }}</text>
        </g>
        <g v-for="(s, si) in paths" :key="s.name">
          <path v-if="area" :d="s.area" :fill="s.color" class="sq-chart__area" />
          <path :d="s.line" :stroke="s.color" class="sq-chart__line" />
        </g>
        <line v-if="hover >= 0" class="sq-chart__crosshair" :x1="sx(hover)" :x2="sx(hover)" :y1="pad.t" :y2="height - pad.b" />
        <g v-if="hover >= 0">
          <circle v-for="s in paths" v-show="s.pts[hover] && s.pts[hover][1] != null" :key="'p' + s.name" :cx="sx(hover)" :cy="s.pts[hover] ? s.pts[hover][1] ?? 0 : 0" r="4.5" :fill="s.color" class="sq-chart__dot" />
        </g>
        <g v-if="points && hover < 0">
          <g v-for="s in paths" :key="'pp' + s.name">
            <circle v-for="(p, i) in s.pts" v-show="p[1] != null" :key="i" :cx="p[0]" :cy="p[1] ?? 0" r="4" :fill="s.color" class="sq-chart__dot" />
          </g>
        </g>
      </svg>
      <div v-if="hover >= 0" class="sq-chart__tooltip sq-squircle" :style="tipStyle">
        <div class="sq-chart__tooltip-title">{{ labels[hover] }}</div>
        <div v-for="(s, i) in series" :key="s.name" class="sq-chart__tooltip-row"><span class="sq-chart__swatch" :style="{ background: colorOf(i) }"></span>{{ s.name }}<b>{{ fmtCell(s.data[hover]) }}</b></div>
      </div>
    </div>
  </ChartFrame>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue'
import ChartFrame from './ChartFrame.vue'
import { compact, linearScale, seriesColor, smoothPath, useSize, yDomain, type Series } from '../utils'

/** Line / area chart with crosshair tooltip. One y-axis only (by design). */
export default defineComponent({
  name: 'SqLineChart',
  components: { ChartFrame },
  props: {
    labels: { type: Array as PropType<string[]>, default: () => [] },
    series: { type: Array as PropType<Series[]>, default: () => [] },
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined },
    height: { type: Number, default: 260 },
    area: Boolean,
    smooth: { type: Boolean, default: true },
    points: Boolean,
    /** Start y at zero (recommended for areas). */
    zero: { type: Boolean, default: true },
    flat: Boolean,
    format: { type: Function as PropType<(v: number) => string>, default: undefined },
  },
  setup(props) {
    const box = ref<HTMLElement | null>(null)
    const { width: w } = useSize(box, props.height)
    const pad = { t: 12, r: 16, b: 26, l: 44 }
    const hover = ref(-1)
    const y = computed(() => yDomain(props.series.flatMap((s) => s.data.filter((v): v is number => v != null)), props.zero || props.area))
    const sy = computed(() => linearScale(y.value.min, y.value.max, props.height - pad.b, pad.t))
    const sx = computed(() => {
      const n = Math.max(1, props.labels.length - 1)
      return (i: number) => pad.l + ((w.value - pad.l - pad.r) * i) / n
    })
    const colorOf = (i: number) => seriesColor(i, props.series[i]?.color)
    const fmt = (v: number) => (props.format ? props.format(v) : compact(v))
    const fmtCell = (v: number | null | undefined) => (v == null ? '–' : fmt(v))
    const paths = computed(() =>
      props.series.map((s, i) => {
        const pts = s.data.map((v, k) => [sx.value(k), v == null ? null : sy.value(v)] as [number, number | null])
        const valid = pts.filter((p): p is [number, number] => p[1] != null)
        const line = props.smooth ? smoothPath(valid) : valid.map((p, k) => `${k ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')
        const base = sy.value(Math.max(y.value.min, 0))
        const area = valid.length ? `${line} L${valid[valid.length - 1][0]},${base} L${valid[0][0]},${base} Z` : ''
        return { name: s.name, color: colorOf(i), pts, line, area }
      }),
    )
    const showLabel = (i: number) => {
      const n = props.labels.length
      const every = Math.ceil(n / Math.max(2, Math.floor((w.value - pad.l) / 64)))
      return i % every === 0 || i === n - 1
    }
    const onMove = (e: PointerEvent) => {
      const r = box.value!.getBoundingClientRect()
      const n = props.labels.length
      if (!n) return
      const i = Math.round(((e.clientX - r.left - pad.l) / (w.value - pad.l - pad.r)) * (n - 1))
      hover.value = Math.max(0, Math.min(n - 1, i))
    }
    const tipStyle = computed(() => {
      const x = sx.value(hover.value)
      return x > w.value / 2 ? { right: `${w.value - x + 12}px`, top: '8px' } : { left: `${x + 12}px`, top: '8px' }
    })
    const legend = computed(() => props.series.map((s, i) => ({ name: s.name, color: colorOf(i) })))
    const table = computed(() => ({ head: ['', ...props.series.map((s) => s.name)], rows: props.labels.map((l, k) => [l, ...props.series.map((s) => s.data[k] ?? '')]) }))
    return { fmtCell, box, w, pad, hover, y, sy, sx, paths, colorOf, fmt, showLabel, onMove, tipStyle, legend, table }
  },
})
</script>
