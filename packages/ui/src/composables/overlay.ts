import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useProxiedModel } from './model'
import { computePosition, nextZIndex, useClickOutside, type Location } from './dom'

/** Accepts any component `emit`, whatever its declared event union. */
type Emit = (event: never, ...args: never[]) => void

export interface ActivatorOverlayProps {
  modelValue?: boolean
  location: Location
  offset: number
  openOnHover?: boolean
  openOnClick?: boolean
  openOnFocus?: boolean
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
  closeOnContentClick?: boolean
  persistent?: boolean
  /** CSS selector, element or 'parent' — default: the activator slot's first element. */
  activator?: string | HTMLElement
  matchWidth?: boolean
}

/** Shared engine for SqMenu, SqTooltip and select dropdowns: activator events, positioning, outside click. */
export function useActivatorOverlay(props: ActivatorOverlayProps, emit: Emit | ((e: string, v: unknown) => void), wrapper: Ref<HTMLElement | null>) {
  const model = useProxiedModel<boolean>(props as unknown as Record<string, unknown>, emit as Emit, 'modelValue', () => false)
  const content = ref<HTMLElement | null>(null)
  const pos = ref({ x: -9999, y: -9999, side: 'bottom', width: 0 })
  const z = ref(2000)
  let timer: ReturnType<typeof setTimeout> | undefined

  const activatorEl = (): HTMLElement | null => {
    if (props.activator === 'parent') return (wrapper.value?.parentElement as HTMLElement) ?? null
    if (typeof props.activator === 'string') return document.querySelector(props.activator)
    if (props.activator) return props.activator
    return (wrapper.value?.firstElementChild as HTMLElement) ?? null
  }

  const update = () => {
    const a = activatorEl()
    if (!a || !content.value) return
    const rect = a.getBoundingClientRect()
    const p = computePosition(rect, content.value, props.location, props.offset)
    pos.value = { ...p, width: rect.width }
  }

  const schedule = (open: boolean, delay = 0) => {
    clearTimeout(timer)
    if (props.disabled && open) return
    timer = setTimeout(() => (model.value = open), delay)
  }
  const open = () => schedule(true, props.openOnHover ? props.openDelay ?? 0 : 0)
  const close = () => schedule(false, props.openOnHover ? props.closeDelay ?? 0 : 0)
  const toggle = () => (model.value ? close() : schedule(true))

  const onScroll = () => model.value && update()
  watch(model, async (v) => {
    if (v) {
      z.value = nextZIndex()
      await nextTick()
      update()
      // a second pass once content has its final size (fonts, images)
      requestAnimationFrame(update)
      window.addEventListener('scroll', onScroll, { capture: true, passive: true })
      window.addEventListener('resize', onScroll, { passive: true })
    } else {
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions)
      window.removeEventListener('resize', onScroll)
    }
  })
  onBeforeUnmount(() => {
    clearTimeout(timer)
    window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions)
    window.removeEventListener('resize', onScroll)
  })

  useClickOutside(() => [activatorEl(), content.value], () => !props.persistent && schedule(false), () => !!model.value && !props.openOnHover)

  const activatorListeners = {
    click: () => props.openOnClick !== false && !props.openOnHover && toggle(),
    mouseenter: () => props.openOnHover && open(),
    mouseleave: () => props.openOnHover && close(),
    focusin: () => props.openOnFocus && open(),
    focusout: () => props.openOnFocus && close(),
    keydown: (e: KeyboardEvent) => {
      if (e.key === 'Escape' && model.value) {
        schedule(false)
        activatorEl()?.focus()
      }
      if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !model.value && props.openOnClick !== false && !props.openOnHover) {
        if (e.key !== 'Enter' || activatorEl()?.tagName !== 'BUTTON') {
          e.preventDefault()
          schedule(true)
        }
      }
    },
  }

  const contentStyle = computed(() => ({
    left: `${pos.value.x}px`,
    top: `${pos.value.y}px`,
    zIndex: z.value,
    minWidth: props.matchWidth ? `${pos.value.width}px` : undefined,
  }))

  return { model, content, contentStyle, pos, open, close, toggle, update, activatorListeners, schedule }
}
