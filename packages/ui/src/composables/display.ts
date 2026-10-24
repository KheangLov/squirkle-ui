import { computed, reactive } from 'vue'
import { isBrowser } from '@squirkle-ui/core'

/** Breakpoints (px) — same numbers as --sq-bp-* in styles/tokens.css. */
export const breakpoints = { sm: 600, md: 960, lg: 1280, xl: 1920 }

const state = reactive({ width: isBrowser ? window.innerWidth : 1280, height: isBrowser ? window.innerHeight : 800 })
let listening = false

/** Reactive viewport info: const { mobile, mdAndUp, name } = useDisplay() */
export function useDisplay() {
  if (isBrowser && !listening) {
    listening = true
    window.addEventListener('resize', () => {
      state.width = window.innerWidth
      state.height = window.innerHeight
    }, { passive: true })
  }
  const name = computed(() => {
    const w = state.width
    return w < breakpoints.sm ? 'xs' : w < breakpoints.md ? 'sm' : w < breakpoints.lg ? 'md' : w < breakpoints.xl ? 'lg' : 'xl'
  })
  return {
    width: computed(() => state.width),
    height: computed(() => state.height),
    name,
    mobile: computed(() => state.width < breakpoints.md),
    smAndUp: computed(() => state.width >= breakpoints.sm),
    mdAndUp: computed(() => state.width >= breakpoints.md),
    lgAndUp: computed(() => state.width >= breakpoints.lg),
  }
}
