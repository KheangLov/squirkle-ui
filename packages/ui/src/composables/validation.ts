import { computed, inject, onBeforeUnmount, provide, ref, watch, type Ref } from 'vue'

export type ValidationRule = (value: unknown) => true | string | Promise<true | string>

export interface FormContext {
  register: (field: FieldRef) => void
  unregister: (field: FieldRef) => void
  disabled: () => boolean
  readonly: () => boolean
}

interface FieldRef {
  validate: () => Promise<string[]>
  reset: () => void
  resetValidation: () => void
}

export const validationProps = {
  rules: { type: Array as () => ValidationRule[], default: () => [] },
  errorMessages: { type: [String, Array] as unknown as () => string | string[], default: undefined },
  error: Boolean,
  /** When to validate: on input (after first blur), on blur, or only via form.validate(). */
  validateOn: { type: String as () => 'input' | 'blur' | 'submit', default: 'input' },
}

/** Field-level validation that registers with the nearest SqForm. */
export function useValidation(
  props: { rules: ValidationRule[]; errorMessages?: string | string[]; error?: boolean; validateOn: string; disabled?: boolean; readonly?: boolean },
  model: Ref<unknown>,
  resetValue: () => unknown,
) {
  const form = inject<FormContext | null>('sq-form', null)
  const internalErrors = ref<string[]>([])
  const dirty = ref(false)

  const validate = async () => {
    const out: string[] = []
    for (const rule of props.rules) {
      const r = await rule(model.value)
      if (r !== true) out.push(typeof r === 'string' ? r : 'Invalid value')
    }
    internalErrors.value = out
    return out
  }
  const field: FieldRef = {
    validate,
    reset: () => {
      model.value = resetValue()
      internalErrors.value = []
      dirty.value = false
    },
    resetValidation: () => {
      internalErrors.value = []
      dirty.value = false
    },
  }
  form?.register(field)
  onBeforeUnmount(() => form?.unregister(field))

  watch(model, () => {
    if (props.validateOn === 'input' && dirty.value) validate()
  })
  const onBlur = () => {
    dirty.value = true
    if (props.validateOn !== 'submit') validate()
  }

  const errors = computed(() => {
    const ext = props.errorMessages
    if (ext && ext.length) return Array.isArray(ext) ? ext : [ext]
    return internalErrors.value
  })
  const isDisabled = computed(() => !!props.disabled || !!form?.disabled())
  const isReadonly = computed(() => !!props.readonly || !!form?.readonly())
  return { errors, hasError: computed(() => props.error || errors.value.length > 0), onBlur, isDisabled, isReadonly, ...field }
}

export function provideForm(props: { disabled?: boolean; readonly?: boolean }) {
  const fields: FieldRef[] = []
  provide<FormContext>('sq-form', {
    register: (f) => fields.push(f),
    unregister: (f) => {
      const i = fields.indexOf(f)
      if (i >= 0) fields.splice(i, 1)
    },
    disabled: () => !!props.disabled,
    readonly: () => !!props.readonly,
  })
  return {
    async validate() {
      const results = await Promise.all(fields.map((f) => f.validate()))
      const errors = results.flat()
      return { valid: errors.length === 0, errors }
    },
    reset: () => fields.forEach((f) => f.reset()),
    resetValidation: () => fields.forEach((f) => f.resetValidation()),
  }
}
