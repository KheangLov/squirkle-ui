<template>
  <SqField
    v-bind="fieldProps"
    :id="id"
    :messages="errors"
    :error="hasError"
    :focused="focused"
    :dirty="model != null && model !== ''"
    :disabled="isDisabled"
    :readonly="isReadonly"
    :counter="counterText"
    :append-inner-icon="type === 'password' ? (reveal ? 'eyeOff' : 'eye') : appendInnerIcon"
    :append-inner-clickable="type === 'password'"
    @click:control="focus"
    @click:clear="clear"
    @click:append-inner="onAppendInner"
  >
    <template v-if="has('prepend-inner')" #prepend-inner><slot name="prepend-inner" /></template>
    <template v-if="has('append-inner')" #append-inner><slot name="append-inner" /></template>
    <input
      :id="id"
      ref="input"
      :value="model"
      :type="type === 'password' && reveal ? 'text' : type"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :readonly="isReadonly"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :name="name"
      :inputmode="inputmode"
      :aria-invalid="hasError ? 'true' : undefined"
      :aria-describedby="`${id}-messages`"
      :aria-required="required ? 'true' : undefined"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlurInput"
      @keydown.enter="$emit('keydown:enter', $event)"
    />
  </SqField>
</template>

<script lang="ts">
import { useUid } from '../composables/id'
import { computed, defineComponent, ref, type PropType } from 'vue'
import SqField from './SqField.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { useValidation, validationProps } from '../composables/validation'
import { fieldShellProps, pickShellProps } from '../composables/field'

export default defineComponent({
  name: 'SqTextField',
  components: { SqField },
  model: vModel,
  props: {
    modelValue: { type: [String, Number], default: undefined },
    type: { type: String, default: 'text' },
    name: { type: String, default: undefined },
    autocomplete: { type: String, default: undefined },
    inputmode: { type: String as PropType<'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search'>, default: undefined },
    maxlength: { type: Number, default: undefined },
    /** true = show length; number = show length / max. */
    counter: { type: [Boolean, Number], default: undefined },
    ...fieldShellProps,
    ...validationProps,
  },
  emits: ['update:modelValue', 'focus', 'blur', 'click:clear', 'keydown:enter'],
  setup(props, { emit, slots }) {
    const model = useProxiedModel<string | number | undefined>(props, emit)
    const v = useValidation(props, model, () => (typeof props.modelValue === 'number' ? undefined : ''))
    const autoId = useUid('sq-input')
    const id = computed(() => props.id ?? autoId)
    const input = ref<HTMLInputElement | null>(null)
    const focused = ref(false)
    const reveal = ref(false)
    const fieldProps = computed(() => pickShellProps(props))
    const counterText = computed(() => {
      if (props.counter == null || props.counter === false) return undefined
      const len = String(model.value ?? '').length
      return typeof props.counter === 'number' ? `${len} / ${props.counter}` : props.maxlength ? `${len} / ${props.maxlength}` : String(len)
    })
    const onInput = (e: Event) => {
      const val = (e.target as HTMLInputElement).value
      model.value = props.type === 'number' ? (val === '' ? undefined : Number(val)) : val
    }
    const onFocus = (e: FocusEvent) => { focused.value = true; emit('focus', e) }
    const onBlurInput = (e: FocusEvent) => { focused.value = false; v.onBlur(); emit('blur', e) }
    const focus = () => input.value?.focus()
    const clear = (e: Event) => { model.value = ''; emit('click:clear', e); focus() }
    const onAppendInner = () => props.type === 'password' && (reveal.value = !reveal.value)
    return { model, id, input, focused, reveal, fieldProps, counterText, onInput, onFocus, onBlurInput, focus, clear, onAppendInner, has: (n: string) => !!slots[n], ...v }
  },
})
</script>
