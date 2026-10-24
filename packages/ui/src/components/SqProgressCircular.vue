<template>
  <div
    class="sq-progress-circular"
    :class="{ 'sq-progress-circular--indeterminate': indeterminate }"
    :style="style"
    role="progressbar"
    :aria-valuenow="indeterminate ? undefined : modelValue"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <svg viewBox="0 0 40 40">
      <circle class="sq-progress-circular__track" cx="20" cy="20" :r="r" :stroke-width="width" />
      <circle
        class="sq-progress-circular__bar"
        cx="20"
        cy="20"
        :r="r"
        :stroke-width="width"
        :stroke-dasharray="circ"
        :stroke-dashoffset="offset"
      />
    </svg>
    <span v-if="has('default')" class="sq-progress-circular__content"><slot :value="modelValue" /></span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { clamp, toUnit } from '@squirkle/core'
import { colorValue } from '../composables/style'

export default defineComponent({
  name: 'SqProgressCircular',
  props: {
    modelValue: { type: Number, default: 0 },
    indeterminate: Boolean,
    size: { type: [Number, String], default: 32 },
    width: { type: Number, default: 4 },
    color: { type: String, default: 'primary' },
  },
  setup(props, { slots }) {
    const has = (n: string) => !!slots[n]
    const r = computed(() => 20 - props.width / 2)
    const circ = computed(() => 2 * Math.PI * r.value)
    const offset = computed(() => (props.indeterminate ? circ.value * 0.7 : circ.value * (1 - clamp(props.modelValue, 0, 100) / 100)))
    const style = computed(() => ({ width: toUnit(props.size), height: toUnit(props.size), color: colorValue(props.color) }))
    return { r, circ, offset, style, has }
  },
})
</script>

<style>
.sq-progress-circular { position: relative; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.sq-progress-circular svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.sq-progress-circular circle { fill: none; }
.sq-progress-circular__track { stroke: color-mix(in srgb, currentColor 16%, transparent); }
.sq-progress-circular__bar { stroke: currentColor; stroke-linecap: round; transition: stroke-dashoffset var(--sq-duration-slow) var(--sq-ease); }
.sq-progress-circular--indeterminate svg { animation: sq-spin 0.9s linear infinite; }
.sq-progress-circular__content { position: absolute; font-size: var(--sq-text-xs); font-weight: var(--sq-weight-semibold); }
</style>
