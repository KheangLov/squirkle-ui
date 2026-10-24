<template>
  <label class="sq-radio" :class="{ 'sq-radio--checked': checked, 'sq-disabled': isDisabled }" :style="{ '--sq-c': colorValue(group ? group.props.color : color) }">
    <input class="sq-sr-only" type="radio" :name="group ? group.name : name" :checked="checked" :disabled="isDisabled" :value="String(value)" @change="select" @blur="group && group.onBlur()" />
    <span class="sq-radio__circle" aria-hidden="true"><span class="sq-radio__dot"></span></span>
    <span v-if="label || has('default')" class="sq-radio__label"><slot>{{ label }}</slot></span>
  </label>
</template>

<script lang="ts">
import { computed, defineComponent, inject, type WritableComputedRef } from 'vue'
import { useProxiedModel, vModel } from '../composables/model'
import { colorValue } from '../composables/style'

interface RadioGroupCtx { model: WritableComputedRef<unknown>; name: string; props: { color: string; disabled: boolean }; onBlur: () => void }

export default defineComponent({
  name: 'SqRadio',
  model: vModel,
  props: {
    modelValue: { type: [String, Number, Boolean, Object], default: undefined },
    value: { type: [String, Number, Boolean, Object], default: undefined },
    label: { type: String, default: undefined },
    color: { type: String, default: 'primary' },
    name: { type: String, default: undefined },
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const group = inject<RadioGroupCtx | null>('sq-radio-group', null)
    const own = useProxiedModel<unknown>(props, emit)
    const checked = computed(() => (group ? group.model.value : own.value) === props.value)
    const isDisabled = computed(() => props.disabled || !!group?.props.disabled)
    const select = () => (group ? (group.model.value = props.value) : (own.value = props.value))
    return { group, checked, isDisabled, select, colorValue, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-radio { display: inline-flex; align-items: center; gap: var(--sq-space-2); min-height: 32px; cursor: pointer; user-select: none; }
.sq-radio__circle { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--sq-border-strong); background: var(--sq-surface); transition: border-color var(--sq-duration-fast) var(--sq-ease); }
.sq-radio__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--sq-c); transform: scale(0); transition: transform var(--sq-duration) var(--sq-ease-spring); }
.sq-radio:hover .sq-radio__circle, .sq-radio--checked .sq-radio__circle { border-color: var(--sq-c); }
.sq-radio--checked .sq-radio__dot { transform: scale(1); }
.sq-radio input:focus-visible + .sq-radio__circle { box-shadow: var(--sq-focus-ring); }
</style>
