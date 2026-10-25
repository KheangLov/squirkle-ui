import * as vue from 'vue'
import { nextId } from '@squirkle-ui/core'

// `useId` exists only in Vue 3.5+, and a named import fails to link in Vue 2 under webpack 5 (strict ESM exports).
// `Reflect.get` keeps Rollup from rewriting `vue.useId` into that named import in the built output.
const vueUseId = Reflect.get(vue, 'useId') as (() => string) | undefined

/**
 * Element id that matches between server render and hydration on Vue 3.5+ (Nuxt 3/4).
 * Vue 2.7 falls back to a module counter (its hydration does not compare attributes).
 */
export function useUid(prefix: string): string {
  return vueUseId ? `${prefix}-${vueUseId()}` : nextId(prefix)
}
