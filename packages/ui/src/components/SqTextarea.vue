<template>
  <SqField v-bind="fieldProps" :id="id" multiline :messages="errors" :error="hasError" :focused="focused" :dirty="!!model" :disabled="isDisabled" :readonly="isReadonly" :counter="counterText" @click:clear="model = ''">
    <textarea
      :id="id"
      ref="input"
      :value="model"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :readonly="isReadonly"
      :maxlength="maxlength"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :style="{ resize: autoGrow || noResize ? 'none' : undefined }"
      :aria-invalid="hasError ? 'true' : undefined"
      @input="onInput"
      @focus="focused = true"
      @blur="focused = false; onBlur()"
    ></textarea>
  </SqField>
</template>

<script lang="ts">
import { useUid } from '../composables/id'
import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue'
import SqField from './SqField.vue'
import { fieldShellProps, pickShellProps } from '../composables/field'
import { useProxiedModel, vModel } from '../composables/model'
import { useValidation, validationProps } from '../composables/validation'

export default defineComponent({
  name: 'SqTextarea',
  components: { SqField },
  model: vModel,
  props: {
    modelValue: { type: String, default: undefined },
    rows: { type: Number, default: 3 },
    autoGrow: Boolean,
    noResize: Boolean,
    maxlength: { type: Number, default: undefined },
    counter: { type: [Boolean, Number], default: undefined },
    ...fieldShellProps,
    ...validationProps,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<string | undefined>(props, emit)
    const autoId = useUid('sq-textarea')
    const v = useValidation(props, model, () => '')
    const input = ref<HTMLTextAreaElement | null>(null)
    const focused = ref(false)
    const grow = () => {
      if (!props.autoGrow || !input.value) return
      input.value.style.height = 'auto'
      input.value.style.height = `${input.value.scrollHeight}px`
    }
    const onInput = (e: Event) => { model.value = (e.target as HTMLTextAreaElement).value; grow() }
    watch(model, () => nextTick(grow))
    onMounted(grow)
    const counterText = computed(() => (props.counter ? `${(model.value ?? '').length}${props.maxlength ? ` / ${props.maxlength}` : ''}` : undefined))
    return { model, id: computed(() => props.id ?? autoId), input, focused, onInput, counterText, fieldProps: computed(() => pickShellProps(props)), ...v }
  },
})
</script>
