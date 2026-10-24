<template>
  <ChartFrame :title="title" :subtitle="subtitle" :flat="flat" :legend="legend" :table="table">
    <div ref="box" class="sq-chart__plot" :style="{ height: height + 'px' }" @pointerleave="hover = null">
      <svg :width="w" :height="height" role="img" :aria-label="title || 'Bar chart'">
        <g class="sq-chart__grid">
          <line v-for="t in y.ticks" :key="'g' + t" v-bind="gridLine(t)" />
        </g>
        <g class="sq-chart__axis">
          <text v-for="t in y.ticks" :key="'y' + t" v-bind="valueTick(t)">{{ fmt(t) }}</text>
          <text v-for="(l, i) in labels" :key="'x' + i" v-bind="catTick(i)">{{ l }}</text>
        </g>
        <path
          v-for="b in bars"
          :key="b.key"
          :d="b.d"
          :fill="b.color"
          class="sq-chart__bar"
          :class="{ 'sq-chart__bar--dim': hover && hover.cat !== b.cat }"
          @pointerenter="hover = { cat: b.cat, x: b.cx, y: b.cy }"
        />
      </svg>
      <div v-if="hover" class="sq-chart__tooltip sq-squircle" :style="tipStyle">
        <div class="sq-chart__tooltip-title">{{ labels[hover.cat] }}</div>
        <div v-for="(s, i) in series" :key="s.name" class="sq-chart__tooltip-row"><span class="sq-chart__swatch" :style="{ background: colorOf(i) }"></span>{{ s.name }}<b>{{ fmtCell(s.data[hover.cat]) }}</b></div>
      </div>
    </div>
  </ChartFrame>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue'
import ChartFrame from './ChartFrame.vue'
import { barPath, compact, linearScale, seriesColor, useSize, yDomain, type Series } from '../utils'

/** Grouped or stacked bars with squircle data-ends, vertical or horizontal. */
export default defineComponent({
  name: 'SqBarChart',
  components: { ChartFrame },
  props: {
    labels: { type: Array as PropType<string[]>, default: () => [] },
    series: { type: Array as PropType<Series[]>, default: () => [] },
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined },
    height: { type: Number, default: 260 },
    stacked: Boolean,
    horizontal: Boolean,
    radius: { type: Number, default: 6 },
    flat: Boolean,
    format: { type: Function as PropType<(v: number) => string>, default: undefined },
  },
  setup(props) {
    const box = ref<HTMLElement | null>(null)
    const { width: w } = useSize(box, props.height)
    const pad = computed(() => (props.horizontal ? { t: 8, r: 16, b: 24, l: 84 } : { t: 12, r: 16, b: 26, l: 44 }))
    const hover = ref<{ cat: number; x: number; y: number } | null>(null)
    const colorOf = (i: number) => seriesColor(i, props.series[i]?.color)
    const fmt = (v: number) => (props.format ? props.format(v) : compact(v))
    const fmtCell = (v: number | null | undefined) => (v == null ? '–' : fmt(v))
    const y = computed(() => {
      const vals = props.stacked
        ? props.labels.flatMap((_, k) => {
            let pos = 0
            let neg = 0
            for (const s of props.series) { const v = s.data[k] ?? 0; v >= 0 ? (pos += v) : (neg += v) }
            return [pos, neg]
          })
        : props.series.flatMap((s) => s.data.filter((v): v is number => v != null))
      return yDomain(vals, true)
    })
    // value axis → pixel along the value direction
    const sv = computed(() => (props.horizontal ? linearScale(y.value.min, y.value.max, pad.value.l, w.value - pad.value.r) : linearScale(y.value.min, y.value.max, props.height - pad.value.b, pad.value.t)))
    const band = computed(() => {
      const n = Math.max(1, props.labels.length)
      const len = props.horizontal ? props.height - pad.value.t - pad.value.b : w.value - pad.value.l - pad.value.r
      const step = len / n
      return { step, inner: step * 0.72, start: props.horizontal ? pad.value.t : pad.value.l }
    })
    const bars = computed(() => {
      const out: { key: string; d: string; color: string; cat: number; cx: number; cy: number }[] = []
      const gap = 2
      const zero = sv.value(0)
      props.labels.forEach((_, k) => {
        const c0 = band.value.start + band.value.step * k + (band.value.step - band.value.inner) / 2
        let pos = 0
        let neg = 0
        const n = props.series.length
        props.series.forEach((s, i) => {
          const v = s.data[k]
          if (v == null) return
          let a: number
          let b: number
          let c: number
          let thick: number
          if (props.stacked) {
            const from = v >= 0 ? pos : neg
            const to = from + v
            v >= 0 ? (pos = to) : (neg = to)
            a = sv.value(from)
            b = sv.value(to)
            c = c0
            thick = band.value.inner
          } else {
            a = zero
            b = sv.value(v)
            thick = Math.max(1, (band.value.inner - gap * (n - 1)) / n)
            c = c0 + i * (thick + gap)
          }
          const lo = Math.min(a, b)
          const len = Math.abs(b - a) - (props.stacked ? gap : 0)
          const top = props.stacked ? props.series.slice(i + 1).every((x) => (x.data[k] ?? 0) === 0 || Math.sign(x.data[k] ?? 0) !== Math.sign(v)) : true
          const r = top ? props.radius : 0
          const d = props.horizontal
            ? barPath(v >= 0 ? lo : lo + (props.stacked ? gap : 0), c, Math.max(0, len), thick, r, true, v < 0)
            : barPath(c, v >= 0 ? lo + (props.stacked ? gap : 0) : lo, thick, Math.max(0, len), r, false, v < 0)
          out.push({ key: `${k}-${i}`, d, color: colorOf(i), cat: k, cx: props.horizontal ? Math.max(a, b) : c + thick / 2, cy: props.horizontal ? c : Math.min(a, b) })
        })
      })
      return out
    })
    const gridLine = (t: number) => (props.horizontal ? { x1: sv.value(t), x2: sv.value(t), y1: pad.value.t, y2: props.height - pad.value.b } : { x1: pad.value.l, x2: w.value - pad.value.r, y1: sv.value(t), y2: sv.value(t) })
    const valueTick = (t: number) => (props.horizontal ? { x: sv.value(t), y: props.height - 6, 'text-anchor': 'middle' } : { x: pad.value.l - 8, y: sv.value(t), 'text-anchor': 'end', 'dominant-baseline': 'middle' })
    const catTick = (i: number) => {
      const mid = band.value.start + band.value.step * (i + 0.5)
      return props.horizontal ? { x: pad.value.l - 8, y: mid, 'text-anchor': 'end', 'dominant-baseline': 'middle' } : { x: mid, y: props.height - 6, 'text-anchor': 'middle' }
    }
    const tipStyle = computed(() => {
      const h = hover.value
      if (!h) return {}
      return h.x > w.value / 2 ? { right: `${w.value - h.x + 10}px`, top: `${Math.max(4, h.y - 10)}px` } : { left: `${h.x + 10}px`, top: `${Math.max(4, h.y - 10)}px` }
    })
    const legend = computed(() => props.series.map((s, i) => ({ name: s.name, color: colorOf(i) })))
    const table = computed(() => ({ head: ['', ...props.series.map((s) => s.name)], rows: props.labels.map((l, k) => [l, ...props.series.map((s) => s.data[k] ?? '')]) }))
    return { fmtCell, box, w, hover, y, bars, gridLine, valueTick, catTick, colorOf, fmt, tipStyle, legend, table }
  },
})
</script>
