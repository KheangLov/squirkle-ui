<template>
  <div class="sq-progress-linear" :class="{ 'sq-progress-linear--indeterminate': indeterminate, 'sq-progress-linear--striped': striped }" :style="style" role="progressbar" :aria-valuenow="indeterminate ? undefined : modelValue" aria-valuemin="0" aria-valuemax="100">
    <div v-if="bufferValue < 100" class="sq-progress-linear__buffer" :style="{ width: bufferValue + '%' }"></div>
    <div class="sq-progress-linear__bar" :style="indeterminate ? undefined : { width: clamp(modelValue, 0, 100) + '%' }"></div>
    <div v-if="has('default')" class="sq-progress-linear__content"><slot :value="modelValue" /></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { clamp, toUnit } from '@squirkle-ui/core'
import { colorValue } from '../composables/style'

export default defineComponent({
  name: 'SqProgressLinear',
  props: {
    modelValue: { type: Number, default: 0 },
    bufferValue: { type: Number, default: 100 },
    indeterminate: Boolean,
    striped: Boolean,
    height: { type: [Number, String], default: 6 },
    color: { type: String, default: 'primary' },
  },
  setup(props, { slots }) {
    const style = computed(() => ({ height: toUnit(props.height), '--sq-c': colorValue(props.color) }))
    return { style, clamp, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-progress-linear { position: relative; width: 100%; overflow: hidden; border-radius: var(--sq-radius-pill); background: color-mix(in srgb, var(--sq-c) 16%, transparent); }
.sq-progress-linear__buffer { position: absolute; inset: 0 auto 0 0; background: color-mix(in srgb, var(--sq-c) 22%, transparent); }
.sq-progress-linear__bar { position: absolute; inset: 0 auto 0 0; background: var(--sq-c); border-radius: inherit; transition: width var(--sq-duration-slow) var(--sq-ease); }
.sq-progress-linear--striped .sq-progress-linear__bar { background-image: linear-gradient(135deg, rgb(255 255 255 / 0.22) 25%, transparent 25%, transparent 50%, rgb(255 255 255 / 0.22) 50%, rgb(255 255 255 / 0.22) 75%, transparent 75%); background-size: 20px 20px; }
.sq-progress-linear--indeterminate .sq-progress-linear__bar { width: 40%; animation: sq-progress-indeterminate 1.3s var(--sq-ease) infinite; }
.sq-progress-linear__content { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: var(--sq-text-2xs); font-weight: var(--sq-weight-bold); color: var(--sq-on-primary); }
@keyframes sq-progress-indeterminate { 0% { left: -40%; } 100% { left: 100%; } }
</style>
