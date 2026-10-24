import * as vue from 'vue'
import { nextId } from '@squirkle/core'

// Namespace import: `useId` exists only in Vue 3.5+, and a named import would fail to link in Vue 2.
const vueUseId = (vue as unknown as { useId?: () => string }).useId

/**
 * Element id that matches between server render and hydration on Vue 3.5+ (Nuxt 3/4).
 * Vue 2.7 falls back to a module counter (its hydration does not compare attributes).
 */
export function useUid(prefix: string): string {
  return vueUseId ? `${prefix}-${vueUseId()}` : nextId(prefix)
}
