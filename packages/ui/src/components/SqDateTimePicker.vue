<template>
  <div class="sq-datetime-picker sq-surface" :class="{ 'sq-datetime-picker--flat': flat }">
    <SqShape v-if="!flat" />
    <SqDatePicker :model-value="datePart" flat :min="min" :max="max" :first-day-of-week="firstDayOfWeek" :color="color" @update:modelValue="setDate" />
    <div class="sq-datetime-picker__divider"></div>
    <SqTimePicker :model-value="timePart" flat :format="format" :use-seconds="useSeconds" :minute-step="minuteStep" :color="color" @update:modelValue="setTime" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { toISODate } from '@squirkle-ui/core'
import SqShape from './SqShape.vue'
import SqDatePicker from './SqDatePicker.vue'
import SqTimePicker from './SqTimePicker.vue'
import { useProxiedModel, vModel } from '../composables/model'

/** v-model: local `YYYY-MM-DDTHH:mm` (`:ss` with useSeconds) — the `<input type="datetime-local">` format. */
export default defineComponent({
  name: 'SqDateTimePicker',
  components: { SqShape, SqDatePicker, SqTimePicker },
  model: vModel,
  props: {
    modelValue: { type: String, default: undefined },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    firstDayOfWeek: { type: Number, default: 0 },
    format: { type: String as PropType<'24hr' | 'ampm'>, default: '24hr' },
    useSeconds: Boolean,
    minuteStep: { type: Number, default: 5 },
    color: { type: String, default: 'primary' },
    flat: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<string | undefined>(props, emit)
    const datePart = computed(() => (model.value ? model.value.slice(0, 10) : undefined))
    const timePart = computed(() => {
      const t = model.value?.slice(11)
      return t || (props.useSeconds ? '00:00:00' : '00:00')
    })
    const setDate = (d: string | string[] | null) => {
      if (typeof d === 'string' && d) model.value = `${d}T${timePart.value}`
    }
    // Picking a time before a date fills in today.
    const setTime = (t: string) => (model.value = `${datePart.value ?? toISODate(new Date())}T${t}`)
    return { datePart, timePart, setDate, setTime }
  },
})
</script>

<style>
.sq-datetime-picker { --sq-bg: var(--sq-surface-raised); --sq-r: var(--sq-radius-xl); --sq-bd: var(--sq-border); --sq-bw: 1px; display: inline-flex; flex-wrap: wrap; gap: var(--sq-space-3); max-width: 100%; padding: var(--sq-space-3); color: var(--sq-on-surface); }
.sq-datetime-picker--flat { --sq-bw: 0px; --sq-bg: transparent; padding: 0; }
.sq-datetime-picker__divider { width: 1px; align-self: stretch; background: var(--sq-border); }
</style>
