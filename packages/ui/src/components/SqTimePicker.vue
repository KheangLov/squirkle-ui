<template>
  <div class="sq-time-picker sq-surface" :class="{ 'sq-time-picker--flat': flat }" :style="{ '--sq-c': colorValue(color) }">
    <SqShape v-if="!flat" />
    <div class="sq-time-picker__display">
      <span class="sq-time-picker__big">{{ pad(display12(h)) }}</span><span class="sq-time-picker__colon">:</span><span class="sq-time-picker__big">{{ pad(m) }}</span>
      <span v-if="useSeconds" class="sq-time-picker__colon">:</span><span v-if="useSeconds" class="sq-time-picker__big">{{ pad(s) }}</span>
      <div v-if="format === 'ampm'" class="sq-time-picker__ampm">
        <button type="button" class="sq-squircle" :class="{ active: h < 12 }" @click="setPeriod('am')">AM</button>
        <button type="button" class="sq-squircle" :class="{ active: h >= 12 }" @click="setPeriod('pm')">PM</button>
      </div>
    </div>
    <div class="sq-time-picker__columns">
      <div class="sq-time-picker__col" role="listbox" aria-label="Hours">
        <button v-for="x in hours" :key="'h' + x" type="button" class="sq-time-picker__cell sq-squircle" :class="{ 'sq-time-picker__cell--active': x === (format === 'ampm' ? display12(h) : h) }" @click="setHour(x)">{{ pad(x) }}</button>
      </div>
      <div class="sq-time-picker__col" role="listbox" aria-label="Minutes">
        <button v-for="x in minutes" :key="'m' + x" type="button" class="sq-time-picker__cell sq-squircle" :class="{ 'sq-time-picker__cell--active': x === m }" @click="set(h, x, s)">{{ pad(x) }}</button>
      </div>
      <div v-if="useSeconds" class="sq-time-picker__col" role="listbox" aria-label="Seconds">
        <button v-for="x in 60" :key="'s' + x" type="button" class="sq-time-picker__cell sq-squircle" :class="{ 'sq-time-picker__cell--active': x - 1 === s }" @click="set(h, m, x - 1)">{{ pad(x - 1) }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import SqShape from './SqShape.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { colorValue } from '../composables/style'

/** v-model: `HH:mm` (or `HH:mm:ss` with useSeconds), 24h. */
export default defineComponent({
  name: 'SqTimePicker',
  components: { SqShape },
  model: vModel,
  props: {
    modelValue: { type: String, default: undefined },
    format: { type: String as PropType<'24hr' | 'ampm'>, default: '24hr' },
    useSeconds: Boolean,
    minuteStep: { type: Number, default: 5 },
    color: { type: String, default: 'primary' },
    flat: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<string | undefined>(props, emit)
    const parts = computed(() => (model.value ?? '00:00:00').split(':').map(Number))
    const h = computed(() => parts.value[0] || 0)
    const m = computed(() => parts.value[1] || 0)
    const s = computed(() => parts.value[2] || 0)
    const pad = (n: number) => String(n).padStart(2, '0')
    const set = (hh: number, mm: number, ss: number) => (model.value = `${pad(hh)}:${pad(mm)}${props.useSeconds ? `:${pad(ss)}` : ''}`)
    const display12 = (x: number) => (props.format === 'ampm' ? x % 12 || 12 : x)
    const hours = computed(() => (props.format === 'ampm' ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 24 }, (_, i) => i)))
    const minutes = computed(() => Array.from({ length: Math.ceil(60 / props.minuteStep) }, (_, i) => i * props.minuteStep))
    const setHour = (x: number) => set(props.format === 'ampm' ? (x % 12) + (h.value >= 12 ? 12 : 0) : x, m.value, s.value)
    const setPeriod = (p: 'am' | 'pm') => set(p === 'am' ? h.value % 12 : (h.value % 12) + 12, m.value, s.value)
    return { h, m, s, pad, set, display12, hours, minutes, setHour, setPeriod, colorValue }
  },
})
</script>

<style>
.sq-time-picker { --sq-bg: var(--sq-surface-raised); --sq-r: var(--sq-radius-xl); --sq-bd: var(--sq-border); --sq-bw: 1px; display: inline-flex; flex-direction: column; padding: var(--sq-space-3); gap: var(--sq-space-3); color: var(--sq-on-surface); }
.sq-time-picker--flat { --sq-bw: 0px; --sq-bg: transparent; padding: 0; }
.sq-time-picker__display { display: flex; align-items: center; justify-content: center; gap: 2px; font-variant-numeric: tabular-nums; }
.sq-time-picker__big { font-size: var(--sq-text-4xl); font-weight: var(--sq-weight-semibold); padding: 0 6px; border-radius: var(--sq-radius-md); background: color-mix(in srgb, var(--sq-c) 12%, transparent); color: var(--sq-c); }
.sq-time-picker__colon { font-size: var(--sq-text-3xl); color: var(--sq-muted); }
.sq-time-picker__ampm { display: flex; flex-direction: column; gap: 2px; margin-inline-start: var(--sq-space-2); }
.sq-time-picker__ampm button { --sq-r: var(--sq-radius-xs); border: 1px solid var(--sq-border); background: none; color: inherit; font: inherit; font-size: var(--sq-text-xs); padding: 2px 8px; cursor: pointer; }
.sq-time-picker__ampm button.active { background: var(--sq-c); color: #fff; border-color: var(--sq-c); }
.sq-time-picker__columns { display: flex; gap: var(--sq-space-2); }
.sq-time-picker__col { display: flex; flex-direction: column; gap: 2px; height: 220px; overflow-y: auto; padding: 2px; scrollbar-width: thin; }
.sq-time-picker__cell { --sq-r: var(--sq-radius-sm); border: 0; background: none; color: inherit; font: inherit; font-variant-numeric: tabular-nums; padding: 6px 16px; cursor: pointer; }
.sq-time-picker__cell:hover { background: color-mix(in srgb, var(--sq-c) 10%, transparent); }
.sq-time-picker__cell--active { background: var(--sq-c) !important; color: #fff; font-weight: var(--sq-weight-semibold); }
</style>
