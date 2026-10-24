<template>
  <SqField v-bind="fieldProps" :id="id" :messages="errors" :error="hasError" :focused="focused" :dirty="model != null" :disabled="isDisabled" :readonly="isReadonly" @click:clear="model = undefined">
    <template #prepend-inner>
      <button v-if="controlVariant === 'split'" type="button" class="sq-number-input__btn" tabindex="-1" :disabled="!canDec" aria-label="Decrease" @click="stepBy(-1)"><SqIcon icon="minus" size="16px" /></button>
    </template>
    <input
      :id="id"
      :value="display"
      type="text"
      inputmode="decimal"
      role="spinbutton"
      :aria-valuenow="model"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :readonly="isReadonly"
      class="sq-number-input__input"
      @input="onInput"
      @focus="focused = true"
      @blur="onBlurNum"
      @keydown.up.prevent="stepBy(1)"
      @keydown.down.prevent="stepBy(-1)"
    />
    <template #append-inner>
      <span class="sq-number-input__controls" :class="`sq-number-input__controls--${controlVariant}`">
        <button v-if="controlVariant !== 'split'" type="button" class="sq-number-input__btn" tabindex="-1" :disabled="!canDec" aria-label="Decrease" @click="stepBy(-1)"><SqIcon icon="minus" size="16px" /></button>
        <button type="button" class="sq-number-input__btn" tabindex="-1" :disabled="!canInc" aria-label="Increase" @click="stepBy(1)"><SqIcon icon="plus" size="16px" /></button>
      </span>
    </template>
  </SqField>
</template>

<script lang="ts">
import { useUid } from '../composables/id'
import { computed, defineComponent, ref, type PropType } from 'vue'
import { clamp } from '@squirkle/core'
import SqField from './SqField.vue'
import SqIcon from './SqIcon.vue'
import { fieldShellProps, pickShellProps } from '../composables/field'
import { useProxiedModel, vModel } from '../composables/model'
import { useValidation, validationProps } from '../composables/validation'

export default defineComponent({
  name: 'SqNumberInput',
  components: { SqField, SqIcon },
  model: vModel,
  props: {
    modelValue: { type: Number, default: undefined },
    min: { type: Number, default: -Infinity },
    max: { type: Number, default: Infinity },
    step: { type: Number, default: 1 },
    precision: { type: Number, default: undefined },
    controlVariant: { type: String as PropType<'default' | 'split'>, default: 'default' },
    ...fieldShellProps,
    ...validationProps,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<number | undefined>(props, emit)
    const autoId = useUid('sq-number')
    const v = useValidation(props, model, () => undefined)
    const focused = ref(false)
    const text = ref<string | null>(null)
    const round = (n: number) => (props.precision != null ? Number(n.toFixed(props.precision)) : Math.round(n * 1e10) / 1e10)
    const display = computed(() => text.value ?? (model.value == null ? '' : props.precision != null ? model.value.toFixed(props.precision) : String(model.value)))
    const onInput = (e: Event) => {
      const raw = (e.target as HTMLInputElement).value.replace(',', '.')
      text.value = raw
      const n = Number(raw)
      if (raw === '' || raw === '-') model.value = undefined
      else if (!isNaN(n)) model.value = n
    }
    const onBlurNum = () => {
      focused.value = false
      text.value = null
      if (model.value != null) model.value = round(clamp(model.value, props.min, props.max))
      v.onBlur()
    }
    const stepBy = (d: number) => {
      if (v.isDisabled.value || v.isReadonly.value) return
      text.value = null
      const base = model.value ?? (props.min > -Infinity ? props.min : 0)
      model.value = round(clamp(base + d * props.step, props.min, props.max))
    }
    const canDec = computed(() => model.value == null || model.value > props.min)
    const canInc = computed(() => model.value == null || model.value < props.max)
    return { model, id: computed(() => props.id ?? autoId), focused, display, onInput, onBlurNum, stepBy, canDec, canInc, fieldProps: computed(() => pickShellProps(props)), ...v }
  },
})
</script>

<style>
.sq-number-input__input { font-variant-numeric: tabular-nums; }
.sq-number-input__controls { display: flex; gap: 2px; }
.sq-number-input__btn { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: 0; border-radius: var(--sq-radius-xs); background: var(--sq-surface-variant); color: var(--sq-on-surface); cursor: pointer; }
.sq-number-input__btn:hover:not(:disabled) { background: color-mix(in srgb, var(--sq-primary) 16%, var(--sq-surface-variant)); }
.sq-number-input__btn:disabled { opacity: 0.4; cursor: default; }
</style>
