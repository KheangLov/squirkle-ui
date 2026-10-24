import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import { isBrowser } from '@squirkle-ui/core'

export function useResizeObserver(target: Ref<Element | null | undefined>, cb: (entry: ResizeObserverEntry) => void) {
  let ro: ResizeObserver | undefined
  const stop = watch(
    target,
    (el) => {
      ro?.disconnect()
      if (!el || typeof ResizeObserver === 'undefined') return
      ro = new ResizeObserver((entries) => entries[0] && cb(entries[0]))
      ro.observe(el)
    },
    { immediate: true, flush: 'post' },
  )
  onBeforeUnmount(() => {
    stop()
    ro?.disconnect()
  })
}

export function useEventListener<K extends keyof WindowEventMap>(
  target: () => Window | Document | HTMLElement | null | undefined,
  event: K,
  handler: (e: WindowEventMap[K]) => void,
  options: AddEventListenerOptions = { passive: true },
) {
  let el: Window | Document | HTMLElement | null | undefined
  onMounted(() => {
    el = target()
    el?.addEventListener(event, handler as EventListener, options)
  })
  onBeforeUnmount(() => el?.removeEventListener(event, handler as EventListener, options))
}

/** Calls handler on pointerdown outside every element returned by `els`. */
export function useClickOutside(els: () => (Element | null | undefined)[], handler: (e: PointerEvent) => void, active: () => boolean) {
  const onDown = (e: PointerEvent) => {
    if (!active()) return
    const path = e.composedPath()
    if (els().some((el) => el && path.includes(el))) return
    handler(e)
  }
  onMounted(() => document.addEventListener('pointerdown', onDown, true))
  onBeforeUnmount(() => document.removeEventListener('pointerdown', onDown, true))
}

let lockCount = 0
let savedOverflow = ''
export function lockScroll() {
  if (!isBrowser) return
  if (lockCount++ === 0) {
    savedOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
  }
}
export function unlockScroll() {
  if (!isBrowser || lockCount === 0) return
  if (--lockCount === 0) document.documentElement.style.overflow = savedOverflow
}

let zIndex = 2000
/** Monotonic z-index so the most recently opened overlay is on top. */
export const nextZIndex = () => ++zIndex

export type Location =
  | 'top' | 'bottom' | 'left' | 'right'
  | 'top start' | 'top end' | 'bottom start' | 'bottom end'
  | 'left start' | 'left end' | 'right start' | 'right end'

/** Positions a fixed element next to an anchor rect, flipping and shifting to stay on screen. */
export function computePosition(anchor: DOMRect, content: HTMLElement, location: Location, offset = 8, margin = 8) {
  const [side0, align = 'center'] = location.split(' ') as [string, string?]
  const w = content.offsetWidth
  const h = content.offsetHeight
  const vw = window.innerWidth
  const vh = window.innerHeight
  let side = side0
  if (side === 'bottom' && anchor.bottom + offset + h > vh && anchor.top - offset - h > 0) side = 'top'
  else if (side === 'top' && anchor.top - offset - h < 0 && anchor.bottom + offset + h < vh) side = 'bottom'
  else if (side === 'right' && anchor.right + offset + w > vw && anchor.left - offset - w > 0) side = 'left'
  else if (side === 'left' && anchor.left - offset - w < 0) side = 'right'

  let x = 0
  let y = 0
  if (side === 'top' || side === 'bottom') {
    y = side === 'bottom' ? anchor.bottom + offset : anchor.top - offset - h
    x = align === 'start' ? anchor.left : align === 'end' ? anchor.right - w : anchor.left + anchor.width / 2 - w / 2
  } else {
    x = side === 'right' ? anchor.right + offset : anchor.left - offset - w
    y = align === 'start' ? anchor.top : align === 'end' ? anchor.bottom - h : anchor.top + anchor.height / 2 - h / 2
  }
  x = Math.max(margin, Math.min(x, vw - w - margin))
  y = Math.max(margin, Math.min(y, vh - h - margin))
  return { x: Math.round(x), y: Math.round(y), side }
}

/** Focusable descendants for focus trapping. */
export function focusableIn(el: HTMLElement): HTMLElement[] {
  return Array.from(
    el.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ).filter((n) => n.offsetParent !== null)
}
