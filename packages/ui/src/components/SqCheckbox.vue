<template>
  <label class="sq-checkbox" :class="{ 'sq-checkbox--checked': checked || indeterminate, 'sq-disabled': disabled, 'sq-checkbox--error': hasError }" :style="{ '--sq-c': colorValue(color) }">
    <input
      class="sq-sr-only"
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      :name="name"
      :aria-checked="indeterminate ? 'mixed' : checked ? 'true' : 'false'"
      @change="toggle"
      @blur="onBlur"
    />
    <span class="sq-checkbox__box sq-squircle" aria-hidden="true">
      <SqIcon v-if="indeterminate" icon="minus" size="16px" />
      <SqIcon v-else-if="checked" icon="check" size="16px" />
    </span>
    <span v-if="label || has('default')" class="sq-checkbox__label"><slot>{{ label }}</slot></span>
    <span v-if="errors.length" class="sq-checkbox__error">{{ errors[0] }}</span>
  </label>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SqIcon from './SqIcon.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { colorValue } from '../composables/style'
import { useValidation, validationProps } from '../composables/validation'

/** v-model is boolean, or an array of selected `value`s when `value` is set. */
export default defineComponent({
  name: 'SqCheckbox',
  components: { SqIcon },
  model: vModel,
  props: {
    modelValue: { type: [Boolean, Array, String, Number], default: undefined },
    value: { type: [String, Number, Boolean, Object], default: undefined },
    trueValue: { type: [String, Number, Boolean], default: true },
    falseValue: { type: [String, Number, Boolean], default: false },
    label: { type: String, default: undefined },
    color: { type: String, default: 'primary' },
    indeterminate: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    name: { type: String, default: undefined },
    ...validationProps,
  },
  emits: ['update:modelValue', 'update:indeterminate'],
  setup(props, { emit, slots }) {
    const model = useProxiedModel<unknown>(props, emit)
    const v = useValidation(props, model, () => (props.value !== undefined ? [] : props.falseValue))
    const checked = computed(() => (Array.isArray(model.value) ? model.value.includes(props.value) : model.value === props.trueValue))
    const toggle = () => {
      if (props.readonly) return
      emit('update:indeterminate', false)
      if (Array.isArray(model.value) || (props.value !== undefined && model.value == null)) {
        const arr = Array.isArray(model.value) ? model.value : []
        model.value = checked.value ? arr.filter((x) => x !== props.value) : [...arr, props.value]
      } else model.value = checked.value ? props.falseValue : props.trueValue
    }
    return { checked, toggle, colorValue, has: (n: string) => !!slots[n], ...v }
  },
})
</script>

<style>
.sq-checkbox { display: inline-flex; align-items: center; flex-wrap: wrap; gap: var(--sq-space-2); cursor: pointer; user-select: none; min-height: 32px; }
.sq-checkbox__box { --sq-r: 6px; display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex: none; border: 1.5px solid var(--sq-border-strong); background: var(--sq-surface); color: var(--sq-on-primary); transition: all var(--sq-duration-fast) var(--sq-ease); }
.sq-checkbox:hover .sq-checkbox__box { border-color: var(--sq-c); }
.sq-checkbox--checked .sq-checkbox__box { background: var(--sq-c); border-color: var(--sq-c); color: #fff; transform: scale(1.04); }
.sq-checkbox input:focus-visible + .sq-checkbox__box { box-shadow: var(--sq-focus-ring); }
.sq-checkbox--error .sq-checkbox__box { border-color: var(--sq-error); }
.sq-checkbox__error { flex-basis: 100%; font-size: var(--sq-text-xs); color: var(--sq-error); padding-inline-start: 28px; }
</style>
