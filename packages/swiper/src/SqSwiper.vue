<template>
  <div
    ref="root"
    class="sq-swiper sq-surface"
    :class="[`sq-swiper--${effect}`, { 'sq-swiper--dragging': dragging, 'sq-swiper--vertical': vertical }]"
    :style="rootStyle"
    role="region"
    aria-roledescription="carousel"
    :aria-label="label"
    tabindex="0"
    @keydown.left.prevent="!vertical && prev()"
    @keydown.right.prevent="!vertical && next()"
    @keydown.up.prevent="vertical && prev()"
    @keydown.down.prevent="vertical && next()"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <SqShape clip />
    <div ref="track" class="sq-swiper__track" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onCancel" @click.capture="onClickCapture" @dragstart.prevent>
      <div
        v-for="(item, i) in list"
        :key="keyOf(item, i)"
        class="sq-swiper__slide"
        :class="{ 'sq-swiper__slide--active': i === normIndex, 'sq-swiper__slide--jump': jumping.has(i) }"
        :style="slideStyle(i)"
        role="group"
        aria-roledescription="slide"
        :aria-label="`${i + 1} / ${list.length}`"
        :aria-hidden="isVisible(i) ? undefined : 'true'"
      >
        <slot :item="item" :index="i" :active="i === normIndex" />
      </div>
    </div>
    <template v-if="navigation && list.length > 1">
      <SqBtn class="sq-swiper__nav sq-swiper__nav--prev" :icon="vertical ? 'chevronUp' : 'chevronLeft'" color="surface" variant="elevated" size="small" :disabled="!canPrev" aria-label="Previous slide" @click="prev" />
      <SqBtn class="sq-swiper__nav sq-swiper__nav--next" :icon="vertical ? 'chevronDown' : 'chevronRight'" color="surface" variant="elevated" size="small" :disabled="!canNext" aria-label="Next slide" @click="next" />
    </template>
    <div v-if="pagination === 'dots' && pageCount > 1" class="sq-swiper__dots">
      <button v-for="p in pageCount" :key="p" type="button" class="sq-swiper__dot" :class="{ 'sq-swiper__dot--active': p - 1 === normIndex }" :aria-label="`Go to slide ${p}`" @click="goTo(p - 1)"></button>
    </div>
    <div v-else-if="pagination === 'fraction'" class="sq-swiper__fraction">{{ normIndex + 1 }} / {{ list.length }}</div>
    <div v-else-if="pagination === 'progress'" class="sq-swiper__progress"><div :style="{ width: ((normIndex + 1) / Math.max(1, list.length)) * 100 + '%' }"></div></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import { getByPath } from '@squirkle-ui/core'
import { SqBtn, SqShape, radiusValue, useProxiedModel, vModel } from '@squirkle-ui/ui'

type Effect = 'slide' | 'fade' | 'coverflow' | 'cards'
interface Responsive { slidesPerView?: number; spaceBetween?: number }

/**
 * Touch/mouse swiper. `loop` is a real infinite loop without cloned slides: every slide is positioned
 * at its wrapped offset from the active index, and slides that wrap around jump without animating.
 * Dragging the `slide` effect writes a CSS variable on the track (no re-render per pointer move);
 * the other effects need per-slide math and re-render at most once per animation frame.
 */
export default defineComponent({
  name: 'SqSwiper',
  components: { SqBtn, SqShape },
  model: vModel,
  props: {
    modelValue: { type: Number, default: 0 },
    items: { type: Array as PropType<unknown[]>, default: () => [] },
    itemKey: { type: String, default: undefined },
    slidesPerView: { type: Number, default: 1 },
    spaceBetween: { type: Number, default: 16 },
    /** { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } — keys are min container widths. */
    breakpoints: { type: Object as PropType<Record<number, Responsive>>, default: undefined },
    effect: { type: String as PropType<Effect>, default: 'slide' },
    loop: Boolean,
    centered: Boolean,
    vertical: Boolean,
    /** Autoplay delay in ms; 0 disables. */
    autoplay: { type: Number, default: 0 },
    pauseOnHover: { type: Boolean, default: true },
    speed: { type: Number, default: 420 },
    navigation: { type: Boolean, default: true },
    pagination: { type: [String, Boolean] as PropType<'dots' | 'fraction' | 'progress' | false>, default: 'dots' },
    height: { type: [Number, String], default: 320 },
    rounded: { type: [String, Number], default: 'xl' },
    label: { type: String, default: 'Carousel' },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const model = useProxiedModel<number>(props, emit)
    const root = ref<HTMLElement | null>(null)
    const track = ref<HTMLElement | null>(null)
    const size = ref(800)
    const drag = ref(0)
    const dragging = ref(false)
    const hovering = ref(false)
    const jumping = ref(new Set<number>())
    const list = computed(() => props.items)
    const n = computed(() => list.value.length)
    const keyOf = (item: unknown, i: number) => (props.itemKey ? (getByPath(item, props.itemKey) as string) : i)

    const responsive = computed<Required<Responsive>>(() => {
      let r: Required<Responsive> = { slidesPerView: props.slidesPerView, spaceBetween: props.spaceBetween }
      if (props.breakpoints) for (const bp of Object.keys(props.breakpoints).map(Number).sort((a, b) => a - b)) if (size.value >= bp) r = { ...r, ...props.breakpoints[bp] }
      if (props.effect !== 'slide') r = { ...r, slidesPerView: 1 }
      return r
    })
    const spv = computed(() => Math.max(1, Math.min(responsive.value.slidesPerView, n.value || 1)))
    const slideSize = computed(() => (size.value - responsive.value.spaceBetween * (spv.value - 1)) / spv.value)
    const step = computed(() => slideSize.value + responsive.value.spaceBetween)
    const maxIndex = computed(() => (props.loop || props.centered ? n.value - 1 : Math.max(0, n.value - spv.value)))
    const normIndex = computed(() => (n.value ? ((model.value % n.value) + n.value) % n.value : 0))
    const pageCount = computed(() => (props.loop || props.centered ? n.value : maxIndex.value + 1))
    const canPrev = computed(() => props.loop || normIndex.value > 0)
    const canNext = computed(() => props.loop || normIndex.value < maxIndex.value)

    const offsetOf = (i: number) => {
      let o = i - normIndex.value
      if (props.loop && n.value > 1) {
        const half = n.value / 2
        o = ((((o + half) % n.value) + n.value) % n.value) - half
      }
      return o
    }
    const prevOffsets = new Map<number, number>()
    let autoStepping = false
    watch(normIndex, () => {
      const jumps = new Set<number>()
      for (let i = 0; i < n.value; i++) {
        const o = offsetOf(i)
        const was = prevOffsets.get(i)
        if (was != null && Math.abs(o - was) > 1.5) jumps.add(i)
        prevOffsets.set(i, o)
      }
      jumping.value = jumps
      requestAnimationFrame(() => requestAnimationFrame(() => (jumping.value = new Set())))
      emit('change', normIndex.value)
      // A manual slide change gives the user a full autoplay delay before the next automatic one.
      if (!autoStepping) restart()
      autoStepping = false
    })

    const isVisible = (i: number) => {
      const o = offsetOf(i)
      return props.centered ? Math.abs(o) <= spv.value / 2 : o >= 0 && o < spv.value
    }
    const slideStyle = (i: number) => {
      const o = offsetOf(i)
      const center = props.centered ? (size.value - slideSize.value) / 2 : 0
      const s: Record<string, string> = { [props.vertical ? 'height' : 'width']: `${slideSize.value}px` }
      if (props.effect === 'slide') {
        const at = `calc(${center + o * step.value}px + var(--sq-drag, 0px))`
        s.transform = props.vertical ? `translate3d(0, ${at}, 0)` : `translate3d(${at}, 0, 0)`
        return s
      }
      const pos = o + drag.value / step.value
      if (props.effect === 'fade') {
        s.opacity = String(Math.max(0, 1 - Math.abs(pos)))
        s.zIndex = String(o === 0 ? 2 : 1)
      } else if (props.effect === 'coverflow') {
        const x = (size.value - slideSize.value) / 2 + pos * slideSize.value * 0.62
        s.transform = `translate3d(${x}px, 0, 0) perspective(900px) rotateY(${Math.max(-1, Math.min(1, pos)) * -42}deg) scale(${1 - Math.min(1, Math.abs(pos)) * 0.18})`
        s.zIndex = String(100 - Math.round(Math.abs(pos) * 10))
        s.opacity = Math.abs(pos) > 2.5 ? '0' : '1'
      } else {
        const p = Math.max(-1, pos)
        s.transform = p < 0 ? `translate3d(${p * size.value}px, 0, 0) rotate(${p * 8}deg)` : `translate3d(0, ${Math.min(p, 3) * 14}px, 0) scale(${1 - Math.min(p, 3) * 0.06})`
        s.zIndex = String(100 - Math.round(Math.abs(pos) * 10))
        s.opacity = pos > 3 ? '0' : '1'
      }
      return s
    }

    const goTo = (i: number) => {
      if (!n.value) return
      if (props.loop) {
        const target = ((i % n.value) + n.value) % n.value
        model.value = model.value + offsetOfTarget(target)
      } else model.value = Math.max(0, Math.min(maxIndex.value, i))
    }
    const offsetOfTarget = (target: number) => {
      let d = target - normIndex.value
      const half = n.value / 2
      d = ((((d + half) % n.value) + n.value) % n.value) - half
      return d
    }
    const next = () => (canNext.value ? (props.loop ? (model.value = model.value + 1) : goTo(normIndex.value + 1)) : props.autoplay && goTo(0))
    const prev = () => canPrev.value && (props.loop ? (model.value = model.value - 1) : goTo(normIndex.value - 1))

    // drag (pointer capture keeps events on the track; pointercancel = the browser took over to scroll)
    let pointerId: number | null = null
    let start = 0
    let startT = 0
    let dragPx = 0
    let moved = false
    let frame = 0
    const paint = () => {
      frame = 0
      if (props.effect === 'slide') track.value?.style.setProperty('--sq-drag', `${dragPx}px`)
      else drag.value = dragPx
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      const d = (props.vertical ? e.clientY : e.clientX) - start
      if (Math.abs(d) > 5) moved = true
      const edge = !props.loop && ((normIndex.value === 0 && d > 0) || (normIndex.value >= maxIndex.value && d < 0))
      dragPx = edge ? d * 0.3 : d
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const release = () => {
      if (track.value && pointerId != null && track.value.hasPointerCapture?.(pointerId)) track.value.releasePointerCapture(pointerId)
      pointerId = null
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }
    const settle = (steps: number) => {
      dragging.value = false
      if (steps) props.loop ? (model.value = model.value + steps) : goTo(normIndex.value + steps)
      // Reset the offset after the new positions render, in the same frame, so slides animate from where the finger left them.
      nextTick(() => {
        dragPx = 0
        track.value?.style.setProperty('--sq-drag', '0px')
        drag.value = 0
      })
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      release()
      const fast = Math.abs(dragPx) > 30 && Date.now() - startT < 250
      settle(Math.round(-dragPx / step.value) || (fast ? -Math.sign(dragPx) : 0))
    }
    const onCancel = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      release()
      moved = false
      settle(0)
    }
    const onDown = (e: PointerEvent) => {
      if (pointerId != null || e.button !== 0 || (e.target as HTMLElement).closest('button, a, input')) return
      pointerId = e.pointerId
      start = props.vertical ? e.clientY : e.clientX
      startT = Date.now()
      dragPx = 0
      moved = false
      dragging.value = true
      try { track.value?.setPointerCapture(e.pointerId) } catch { /* pointer already gone */ }
    }
    // A drag must not also click whatever slide content it started on.
    const onClickCapture = (e: MouseEvent) => {
      if (!moved) return
      moved = false
      e.preventDefault()
      e.stopPropagation()
    }

    // autoplay
    let timer: ReturnType<typeof setInterval> | undefined
    const restart = () => {
      clearInterval(timer)
      if (props.autoplay > 0) {
        timer = setInterval(() => {
          if ((props.pauseOnHover && hovering.value) || dragging.value || document.hidden) return
          autoStepping = true
          next()
        }, props.autoplay)
      }
    }
    watch(() => props.autoplay, restart)

    let ro: ResizeObserver | undefined
    onMounted(() => {
      const measure = () => root.value && (size.value = props.vertical ? root.value.clientHeight : root.value.clientWidth)
      measure()
      if (typeof ResizeObserver !== 'undefined' && root.value) { ro = new ResizeObserver(measure); ro.observe(root.value) }
      for (let i = 0; i < n.value; i++) prevOffsets.set(i, offsetOf(i))
      restart()
    })
    onBeforeUnmount(() => { clearInterval(timer); ro?.disconnect(); release() })

    const rootStyle = computed(() => ({ height: typeof props.height === 'number' ? `${props.height}px` : props.height, '--sq-swiper-speed': `${props.speed}ms`, '--sq-r': radiusValue(props.rounded as string), '--sq-bg': 'var(--sq-surface-variant)' }))
    return { root, track, list, keyOf, normIndex, pageCount, canPrev, canNext, slideStyle, isVisible, goTo, next, prev, onDown, onMove, onUp, onCancel, onClickCapture, dragging, hovering, jumping, rootStyle }
  },
})
</script>

<style>
.sq-swiper { position: relative; overflow: hidden; outline: none; touch-action: pan-y; user-select: none; }
.sq-swiper--vertical { touch-action: pan-x; }
.sq-swiper:focus-visible { box-shadow: var(--sq-focus-ring); }
.sq-swiper__track { position: relative; width: 100%; height: 100%; cursor: grab; }
.sq-swiper--dragging .sq-swiper__track { cursor: grabbing; }
.sq-swiper__slide { position: absolute; top: 0; left: 0; height: 100%; transition-property: transform, opacity; transition-duration: var(--sq-swiper-speed, 420ms); transition-timing-function: var(--sq-ease); will-change: transform; backface-visibility: hidden; }
.sq-swiper--dragging .sq-swiper__slide { transition-duration: 0ms; }
.sq-swiper__slide img { -webkit-user-drag: none; }
.sq-swiper--vertical .sq-swiper__slide { width: 100%; height: auto; }
.sq-swiper__slide--jump { transition: none !important; }
.sq-swiper__slide > * { width: 100%; height: 100%; }
.sq-swiper--fade .sq-swiper__slide, .sq-swiper--cards .sq-swiper__slide { width: 100% !important; }
.sq-swiper--cards { overflow: visible; --sq-bg: transparent; }
.sq-swiper__nav { position: absolute; top: 50%; z-index: 120; transform: translateY(-50%); }
.sq-swiper__nav--prev { left: var(--sq-space-3); }
.sq-swiper__nav--next { right: var(--sq-space-3); }
.sq-swiper--vertical .sq-swiper__nav { left: 50%; top: auto; transform: translateX(-50%); }
.sq-swiper--vertical .sq-swiper__nav--prev { top: var(--sq-space-3); }
.sq-swiper--vertical .sq-swiper__nav--next { bottom: var(--sq-space-3); }
.sq-swiper__dots { position: absolute; z-index: 120; left: 50%; bottom: var(--sq-space-3); transform: translateX(-50%); display: flex; gap: 6px; padding: 6px 8px; border-radius: var(--sq-radius-pill); background: color-mix(in srgb, var(--sq-overlay) 28%, transparent); backdrop-filter: blur(8px); }
.sq-swiper__dot { width: 7px; height: 7px; padding: 0; border: 0; border-radius: var(--sq-radius-pill); background: rgb(255 255 255 / 0.55); cursor: pointer; transition: width var(--sq-duration) var(--sq-ease), background var(--sq-duration); }
.sq-swiper__dot--active { width: 22px; background: #fff; }
.sq-swiper__fraction { position: absolute; z-index: 120; right: var(--sq-space-3); bottom: var(--sq-space-3); padding: 2px 10px; border-radius: var(--sq-radius-pill); background: color-mix(in srgb, var(--sq-overlay) 45%, transparent); color: #fff; font-size: var(--sq-text-xs); font-weight: var(--sq-weight-semibold); }
.sq-swiper__progress { position: absolute; z-index: 120; left: 0; right: 0; bottom: 0; height: 4px; background: color-mix(in srgb, var(--sq-overlay) 20%, transparent); }
.sq-swiper__progress > div { height: 100%; background: var(--sq-primary); transition: width var(--sq-duration-slow) var(--sq-ease); }
</style>
