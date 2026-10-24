<template>
  <div class="sq-slider" :class="{ 'sq-disabled': disabled, 'sq-slider--dragging': dragging >= 0 }" :style="{ '--sq-c': colorValue(color) }">
    <div v-if="label" class="sq-slider__label">{{ label }}</div>
    <div class="sq-slider__row">
      <slot name="prepend" />
      <div ref="track" class="sq-slider__track" @pointerdown="onTrackDown">
        <div class="sq-slider__rail"></div>
        <div class="sq-slider__fill" :style="fillStyle"></div>
        <div v-if="showTicks" class="sq-slider__ticks"><span v-for="t in ticks" :key="t" class="sq-slider__tick" :style="{ left: pct(t) + '%' }"></span></div>
        <div
          v-for="(v, i) in values"
          :key="i"
          class="sq-slider__thumb sq-squircle"
          :style="{ left: pct(v) + '%' }"
          role="slider"
          tabindex="0"
          :aria-valuemin="min"
          :aria-valuemax="max"
          :aria-valuenow="v"
          :aria-label="label || 'Value'"
          @pointerdown.stop="startDrag($event, i)"
          @keydown="onKey($event, i)"
        >
          <span v-if="thumbLabel" class="sq-slider__thumb-label">{{ format(v) }}</span>
        </div>
      </div>
      <slot name="append" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref, type PropType } from 'vue'
import { clamp } from '@squirkle/core'
import { useProxiedModel, vModel } from '../composables/model'
import { colorValue } from '../composables/style'

/** Single value slider; with `range` (or SqRangeSlider) the model is [start, end]. */
export default defineComponent({
  name: 'SqSlider',
  model: vModel,
  props: {
    modelValue: { type: [Number, Array] as PropType<number | number[]>, default: undefined },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    range: Boolean,
    label: { type: String, default: undefined },
    color: { type: String, default: 'primary' },
    thumbLabel: Boolean,
    showTicks: Boolean,
    disabled: Boolean,
    format: { type: Function as PropType<(v: number) => string>, default: (v: number) => String(v) },
  },
  emits: ['update:modelValue', 'end'],
  setup(props, { emit }) {
    const model = useProxiedModel<number | number[]>(props, emit, 'modelValue', () => (props.range ? [props.min, props.max] : props.min))
    const track = ref<HTMLElement | null>(null)
    const dragging = ref(-1)
    const values = computed(() => (Array.isArray(model.value) ? model.value : [model.value ?? props.min]))
    const pct = (v: number) => ((v - props.min) / (props.max - props.min || 1)) * 100
    const snap = (v: number) => clamp(Math.round((v - props.min) / props.step) * props.step + props.min, props.min, props.max)
    const set = (i: number, v: number) => {
      if (!Array.isArray(model.value) && !props.range) return (model.value = snap(v))
      const arr = [...values.value]
      arr[i] = snap(v)
      if (arr[0] > arr[1]) {
        arr.reverse()
        dragging.value = dragging.value >= 0 ? 1 - dragging.value : -1
      }
      model.value = arr
    }
    const valueAt = (clientX: number) => {
      const r = track.value!.getBoundingClientRect()
      return props.min + ((clientX - r.left) / r.width) * (props.max - props.min)
    }
    const onMove = (e: PointerEvent) => dragging.value >= 0 && set(dragging.value, valueAt(e.clientX))
    const onUp = () => {
      if (dragging.value >= 0) emit('end', model.value)
      dragging.value = -1
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    const startDrag = (e: PointerEvent, i: number) => {
      if (props.disabled) return
      dragging.value = i
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      e.preventDefault()
    }
    const onTrackDown = (e: PointerEvent) => {
      if (props.disabled) return
      const v = valueAt(e.clientX)
      const i = values.value.length > 1 && Math.abs(v - values.value[1]) < Math.abs(v - values.value[0]) ? 1 : 0
      set(i, v)
      startDrag(e, i)
    }
    const onKey = (e: KeyboardEvent, i: number) => {
      const big = (props.max - props.min) / 10
      const d = { ArrowRight: props.step, ArrowUp: props.step, ArrowLeft: -props.step, ArrowDown: -props.step, PageUp: big, PageDown: -big }[e.key]
      if (d) { e.preventDefault(); set(i, values.value[i] + d) }
      if (e.key === 'Home') set(i, props.min)
      if (e.key === 'End') set(i, props.max)
    }
    onBeforeUnmount(onUp)
    const fillStyle = computed(() => {
      const [a, b] = values.value.length > 1 ? [pct(values.value[0]), pct(values.value[1])] : [0, pct(values.value[0])]
      return { left: `${a}%`, width: `${b - a}%` }
    })
    const ticks = computed(() => {
      const n = Math.floor((props.max - props.min) / props.step)
      return n > 100 ? [] : Array.from({ length: n + 1 }, (_, i) => props.min + i * props.step)
    })
    return { track, dragging, values, pct, fillStyle, ticks, startDrag, onTrackDown, onKey, colorValue }
  },
})
</script>

<style>
.sq-slider { width: 100%; }
.sq-slider__label { font-size: var(--sq-text-sm); font-weight: var(--sq-weight-medium); color: var(--sq-on-surface-variant); margin-bottom: 4px; }
.sq-slider__row { display: flex; align-items: center; gap: var(--sq-space-3); }
.sq-slider__track { position: relative; flex: 1; height: 28px; cursor: pointer; touch-action: none; }
.sq-slider__rail, .sq-slider__fill { position: absolute; top: 50%; height: 6px; margin-top: -3px; border-radius: var(--sq-radius-pill); }
.sq-slider__rail { left: 0; right: 0; background: color-mix(in srgb, var(--sq-c) 18%, var(--sq-surface-variant)); }
.sq-slider__fill { background: var(--sq-c); }
.sq-slider:not(.sq-slider--dragging) .sq-slider__fill, .sq-slider:not(.sq-slider--dragging) .sq-slider__thumb { transition: left var(--sq-duration-fast) var(--sq-ease), width var(--sq-duration-fast) var(--sq-ease); }
.sq-slider__tick { position: absolute; top: 50%; width: 2px; height: 2px; margin: -1px 0 0 -1px; border-radius: 50%; background: var(--sq-surface); }
.sq-slider__thumb { --sq-r: 8px; position: absolute; top: 50%; width: 20px; height: 20px; margin: -10px 0 0 -10px; background: #fff; border: 2px solid var(--sq-c); box-shadow: var(--sq-elevation-1); outline: none; transition: transform var(--sq-duration-fast) var(--sq-ease); }
.sq-slider__thumb:hover, .sq-slider__thumb:focus-visible { box-shadow: 0 0 0 6px color-mix(in srgb, var(--sq-c) 18%, transparent); }
.sq-slider--dragging .sq-slider__thumb { transform: scale(1.12); }
.sq-slider__thumb-label { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); padding: 2px 8px; border-radius: var(--sq-radius-sm); background: var(--sq-c); color: #fff; font-size: var(--sq-text-2xs); font-weight: var(--sq-weight-bold); white-space: nowrap; }
</style>
