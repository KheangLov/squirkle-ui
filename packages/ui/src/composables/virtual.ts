import { computed, onBeforeUnmount, ref, shallowRef, watch, type Ref } from 'vue'
import { rafThrottle } from '@squirkle/core'

export interface VirtualOptions {
  /** Number of items. */
  count: () => number
  /** Fixed item size in px. When omitted, items are measured and `estimateSize` is used until then. */
  itemSize?: () => number | undefined
  estimateSize?: () => number
  /** Extra items rendered before/after the viewport. */
  overscan?: () => number
  horizontal?: boolean
  /** Space before the first item (e.g. a sticky header inside the scroller). */
  paddingStart?: () => number
}

export interface VirtualItem {
  index: number
  start: number
  size: number
}

/**
 * Windowing engine shared by SqVirtualScroll, SqSelect, SqList and SqDataGrid.
 * Sizes/offsets live in typed arrays outside Vue reactivity; a version ref triggers re-render,
 * so 1M+ items cost O(visible) per frame for fixed sizes and O(n) only after a re-measure.
 */
export function useVirtual(scrollEl: Ref<HTMLElement | null | undefined>, opts: VirtualOptions) {
  const scrollOffset = ref(0)
  const viewport = ref(0)
  const version = ref(0)
  let sizes = new Float64Array(0)
  let offsets = new Float64Array(1)
  let measured = new Uint8Array(0)
  let dirtyFrom = 0

  const overscan = () => opts.overscan?.() ?? 4
  const pad = () => opts.paddingStart?.() ?? 0
  const fixed = () => opts.itemSize?.()

  function ensure(n: number) {
    if (sizes.length === n) return
    const est = opts.estimateSize?.() ?? 48
    const nextSizes = new Float64Array(n)
    const nextMeasured = new Uint8Array(n)
    const keep = Math.min(n, sizes.length)
    nextSizes.set(sizes.subarray(0, keep))
    nextMeasured.set(measured.subarray(0, keep))
    nextSizes.fill(est, keep)
    sizes = nextSizes
    measured = nextMeasured
    offsets = new Float64Array(n + 1)
    dirtyFrom = 0
  }

  function rebuild() {
    for (let i = dirtyFrom; i < sizes.length; i++) offsets[i + 1] = offsets[i] + sizes[i]
    dirtyFrom = sizes.length
  }

  const totalSize = computed(() => {
    void version.value
    const n = opts.count()
    const f = fixed()
    if (f) return n * f + pad()
    ensure(n)
    rebuild()
    return offsets[n] + pad()
  })

  function startOf(i: number): number {
    const f = fixed()
    return pad() + (f ? i * f : offsets[i])
  }

  function indexAt(offset: number): number {
    const n = opts.count()
    const f = fixed()
    const o = Math.max(0, offset - pad())
    if (f) return Math.min(n - 1, Math.floor(o / f))
    let lo = 0
    let hi = n - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (offsets[mid] <= o) lo = mid
      else hi = mid - 1
    }
    return lo
  }

  const range = computed(() => {
    void totalSize.value
    const n = opts.count()
    if (!n) return { start: 0, end: -1 }
    const start = Math.max(0, indexAt(scrollOffset.value) - overscan())
    const end = Math.min(n - 1, indexAt(scrollOffset.value + Math.max(viewport.value, 1)) + overscan())
    return { start, end }
  })

  const items = computed<VirtualItem[]>(() => {
    const { start, end } = range.value
    const f = fixed()
    const out: VirtualItem[] = []
    for (let i = start; i <= end; i++) out.push({ index: i, start: startOf(i), size: f ?? sizes[i] })
    return out
  })

  const pending = new Map<number, number>()
  const flushMeasure = rafThrottle(() => {
    let changed = false
    for (const [i, s] of pending) {
      if (i < sizes.length && Math.abs(sizes[i] - s) > 0.5) {
        // Keep the visual position stable when an item above the viewport changes size.
        if (startOf(i) < scrollOffset.value && scrollEl.value) {
          const delta = s - sizes[i]
          scrollEl.value[opts.horizontal ? 'scrollLeft' : 'scrollTop'] += delta
        }
        sizes[i] = s
        measured[i] = 1
        dirtyFrom = Math.min(dirtyFrom, i)
        changed = true
      }
    }
    pending.clear()
    if (changed) version.value++
  })

  /** Report a rendered item's real size (dynamic mode). */
  function measure(index: number, size: number) {
    if (fixed()) return
    pending.set(index, size)
    flushMeasure()
  }

  const readScroll = () => {
    const el = scrollEl.value
    if (!el) return
    scrollOffset.value = opts.horizontal ? el.scrollLeft : el.scrollTop
    viewport.value = opts.horizontal ? el.clientWidth : el.clientHeight
  }
  // Direct (not rAF-throttled): scroll fires once per frame anyway and Vue batches renders.
  const onScroll = readScroll

  let ro: ResizeObserver | undefined
  watch(
    scrollEl,
    (el, old) => {
      old?.removeEventListener('scroll', onScroll)
      ro?.disconnect()
      if (!el) return
      el.addEventListener('scroll', onScroll, { passive: true })
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(readScroll)
        ro.observe(el)
      }
      readScroll()
    },
    { immediate: true, flush: 'post' },
  )
  onBeforeUnmount(() => {
    scrollEl.value?.removeEventListener('scroll', onScroll)
    ro?.disconnect()
  })

  function scrollToIndex(index: number, align: 'start' | 'center' | 'end' | 'auto' = 'auto', behavior: ScrollBehavior = 'auto') {
    const el = scrollEl.value
    if (!el) return
    const n = opts.count()
    const i = Math.max(0, Math.min(n - 1, index))
    void totalSize.value
    const start = startOf(i)
    const size = fixed() ?? sizes[i]
    const vp = opts.horizontal ? el.clientWidth : el.clientHeight
    const cur = opts.horizontal ? el.scrollLeft : el.scrollTop
    let target = start
    if (align === 'center') target = start - vp / 2 + size / 2
    else if (align === 'end') target = start - vp + size
    else if (align === 'auto') {
      if (start >= cur && start + size <= cur + vp) return
      target = start < cur ? start : start - vp + size
    }
    el.scrollTo({ [opts.horizontal ? 'left' : 'top']: Math.max(0, target), behavior })
  }

  /** Drop all measurements (e.g. after the data set was replaced). */
  function reset() {
    sizes = new Float64Array(0)
    measured = new Uint8Array(0)
    version.value++
  }

  return { items, range, totalSize, scrollOffset, viewport, measure, scrollToIndex, reset, startOf, indexAt: (o: number) => indexAt(o), _version: shallowRef(version) }
}
