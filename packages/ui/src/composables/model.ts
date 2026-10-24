import { computed, ref, watch, type Ref, type WritableComputedRef } from 'vue'

/** Accepts any component `emit`, whatever its declared event union. */
type Emit = (event: never, ...args: never[]) => void

/**
 * Two-way binding that works controlled (v-model) and uncontrolled, in Vue 2.7 and Vue 3.
 * Components must also declare `model: { prop: 'modelValue', event: 'update:modelValue' }` for Vue 2.
 */
export function useProxiedModel<T>(
  props: Record<string, unknown>,
  emit: Emit,
  prop = 'modelValue',
  fallback?: () => T,
): WritableComputedRef<T> {
  const read = () => (props[prop] === undefined && fallback ? fallback() : (props[prop] as T))
  const internal = ref(read()) as Ref<T>
  watch(() => props[prop], () => (internal.value = read()))
  return computed<T>({
    get: () => internal.value,
    set: (v) => {
      internal.value = v
      ;(emit as unknown as (e: string, v: unknown) => void)(`update:${prop}`, v)
    },
  })
}

/** Shared `model` option so `v-model` maps to modelValue/update:modelValue in Vue 2.7. */
export const vModel = { prop: 'modelValue', event: 'update:modelValue' } as const
