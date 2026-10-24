<template>
  <div class="sq-radio-group" :class="{ 'sq-radio-group--inline': inline }" role="radiogroup" :aria-label="label">
    <div v-if="label" class="sq-radio-group__label">{{ label }}</div>
    <div class="sq-radio-group__items">
      <SqRadio v-for="(o, i) in normalized" :key="i" :value="o.value" :label="o.title" :disabled="o.disabled" />
      <slot />
    </div>
    <div v-if="errors.length" class="sq-radio-group__error">{{ errors[0] }}</div>
  </div>
</template>

<script lang="ts">
import { useUid } from '../composables/id'
import { computed, defineComponent, provide, type PropType } from 'vue'
import SqRadio from './SqRadio.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { useValidation, validationProps } from '../composables/validation'

export default defineComponent({
  name: 'SqRadioGroup',
  components: { SqRadio },
  model: vModel,
  props: {
    modelValue: { type: [String, Number, Boolean, Object], default: undefined },
    items: { type: Array as PropType<(string | { title: string; value: string | number | boolean; disabled?: boolean })[]>, default: () => [] },
    label: { type: String, default: undefined },
    inline: Boolean,
    color: { type: String, default: 'primary' },
    disabled: Boolean,
    ...validationProps,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<unknown>(props, emit)
    const v = useValidation(props, model, () => undefined)
    const name = useUid('sq-radio')
    provide('sq-radio-group', { model, name, props, onBlur: v.onBlur })
    const normalized = computed(() => props.items.map((o) => (typeof o === 'string' ? { title: o, value: o } : o)))
    return { normalized, ...v }
  },
})
</script>

<style>
.sq-radio-group__label { font-size: var(--sq-text-sm); font-weight: var(--sq-weight-medium); color: var(--sq-on-surface-variant); margin-bottom: 4px; }
.sq-radio-group__items { display: flex; flex-direction: column; }
.sq-radio-group--inline .sq-radio-group__items { flex-direction: row; flex-wrap: wrap; gap: var(--sq-space-4); }
.sq-radio-group__error { font-size: var(--sq-text-xs); color: var(--sq-error); }
</style>
