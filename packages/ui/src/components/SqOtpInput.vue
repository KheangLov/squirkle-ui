<template>
  <div class="sq-otp-input" :class="{ 'sq-otp-input--error': error }" role="group" :aria-label="label">
    <input
      v-for="i in length"
      :key="i"
      class="sq-otp-input__cell sq-squircle sq-focusable"
      :value="chars[i - 1] || ''"
      :type="masked ? 'password' : 'text'"
      :inputmode="type === 'number' ? 'numeric' : 'text'"
      maxlength="1"
      :autocomplete="i === 1 ? 'one-time-code' : 'off'"
      :disabled="disabled"
      :aria-label="`${label} ${i}`"
      @input="onInput($event, i - 1)"
      @keydown="onKeydown($event, i - 1)"
      @paste.prevent="onPaste"
      @focus="selectAll"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, type PropType } from 'vue'
import { useProxiedModel, vModel } from '../composables/model'

export default defineComponent({
  name: 'SqOtpInput',
  model: vModel,
  props: {
    modelValue: { type: String, default: '' },
    length: { type: Number, default: 6 },
    type: { type: String as PropType<'number' | 'text'>, default: 'number' },
    masked: Boolean,
    disabled: Boolean,
    error: Boolean,
    label: { type: String, default: 'Digit' },
  },
  emits: ['update:modelValue', 'finish'],
  setup(props, { emit }) {
    const model = useProxiedModel<string>(props, emit)
    const inst = getCurrentInstance()
    const chars = computed(() => (model.value ?? '').split(''))
    const cells = () => Array.from((inst!.proxy!.$el as HTMLElement).querySelectorAll<HTMLInputElement>('input'))
    const valid = (c: string) => (props.type === 'number' ? /\d/.test(c) : /\S/.test(c))
    const setAt = (i: number, c: string) => {
      const arr = Array.from({ length: props.length }, (_, k) => chars.value[k] ?? '')
      arr[i] = c
      model.value = arr.join('').slice(0, props.length)
      if (model.value.length === props.length && !model.value.includes('')) emit('finish', model.value)
    }
    const onInput = (e: Event, i: number) => {
      const el = e.target as HTMLInputElement
      const c = el.value.slice(-1)
      if (!valid(c)) { el.value = chars.value[i] ?? ''; return }
      setAt(i, c)
      cells()[i + 1]?.focus()
    }
    const onKeydown = (e: KeyboardEvent, i: number) => {
      if (e.key === 'Backspace' && !chars.value[i]) cells()[i - 1]?.focus()
      if (e.key === 'ArrowLeft') cells()[i - 1]?.focus()
      if (e.key === 'ArrowRight') cells()[i + 1]?.focus()
    }
    const onPaste = (e: ClipboardEvent) => {
      const text = (e.clipboardData?.getData('text') ?? '').split('').filter(valid).slice(0, props.length).join('')
      model.value = text
      cells()[Math.min(text.length, props.length - 1)]?.focus()
      if (text.length === props.length) emit('finish', text)
    }
    const selectAll = (e: FocusEvent) => (e.target as HTMLInputElement).select()
    return { chars, onInput, onKeydown, onPaste, selectAll }
  },
})
</script>

<style>
.sq-otp-input { display: inline-flex; gap: var(--sq-space-2); }
.sq-otp-input__cell { --sq-r: var(--sq-radius-md); width: 46px; height: 54px; text-align: center; font: inherit; font-size: var(--sq-text-2xl); font-weight: var(--sq-weight-semibold); color: var(--sq-on-surface); background: var(--sq-surface); border: 1px solid var(--sq-border-strong); outline: none; caret-color: var(--sq-primary); }
.sq-otp-input__cell:focus { border-color: var(--sq-primary); box-shadow: var(--sq-focus-ring); }
.sq-otp-input--error .sq-otp-input__cell { border-color: var(--sq-error); }
</style>
