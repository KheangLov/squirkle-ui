<template>
  <span v-if="active && d" class="sq-shape-layers">
    <!-- fill + shadow under the content -->
    <svg class="sq-shape" aria-hidden="true" focusable="false" :width="w" :height="h" :viewBox="`0 0 ${w} ${h}`">
      <path class="sq-shape__fill" :d="d" />
    </svg>
    <!-- stroke above the content, so child backgrounds (table headers, rows) never cover the border -->
    <svg v-if="bw > 0" class="sq-shape sq-shape--stroke" aria-hidden="true" focusable="false" :width="w" :height="h" :viewBox="`0 0 ${w} ${h}`">
      <path class="sq-shape__stroke" :d="strokeD" :stroke-width="bw" />
    </svg>
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getSquirclePath, getSquircleStrokePath, supportsNativeSquircle } from '@squirkle/core'
import { config } from '../config'

/**
 * SVG squircle painter for browsers without `corner-shape: squircle`.
 * Place it as a child of any `.sq-surface`; it measures the parent (size, per-corner radius, border width)
 * and paints fill / stroke / drop-shadow from the parent's --sq-* variables.
 */
export default defineComponent({
  name: 'SqShape',
  props: {
    /** Any value; changing it forces a re-measure (e.g. when `rounded` changes without a resize). */
    watchKey: { type: [String, Number, Boolean, Object, Array], default: undefined },
    /** Also clip the host to the squircle (for scrolling content). Clips drop shadows too, so use on flat surfaces. */
    clip: Boolean,
  },
  setup(props) {
    const instance = getCurrentInstance()
    const active = ref(false)
    const w = ref(0)
    const h = ref(0)
    const bw = ref(0)
    const radii = ref({ topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 })
    const smoothing = ref(config.squircle.smoothing)
    let host: HTMLElement | null = null
    let ro: ResizeObserver | undefined

    const shouldRender = () => {
      const mode = config.squircle.mode
      return mode === 'svg' || (mode === 'auto' && !supportsNativeSquircle())
    }

    const measure = () => {
      if (!host) return
      const cs = getComputedStyle(host)
      w.value = host.offsetWidth
      h.value = host.offsetHeight
      bw.value = parseFloat(cs.borderTopWidth) || 0
      radii.value = {
        topLeft: parseFloat(cs.borderTopLeftRadius) || 0,
        topRight: parseFloat(cs.borderTopRightRadius) || 0,
        bottomRight: parseFloat(cs.borderBottomRightRadius) || 0,
        bottomLeft: parseFloat(cs.borderBottomLeftRadius) || 0,
      }
      const s = parseFloat(cs.getPropertyValue('--sq-smoothing'))
      smoothing.value = isNaN(s) ? config.squircle.smoothing : s
    }

    const setup = () => {
      const el = instance?.proxy?.$el as Node | undefined
      host = (el?.parentElement as HTMLElement) ?? null
      if (!host) return
      active.value = shouldRender()
      if (active.value) {
        host.setAttribute('data-sq-shape', '')
        measure()
        if (typeof ResizeObserver !== 'undefined') {
          ro = new ResizeObserver(measure)
          ro.observe(host)
        }
      } else {
        host.removeAttribute('data-sq-shape')
        ro?.disconnect()
      }
    }

    onMounted(setup)
    watch(() => config.squircle.mode, () => {
      ro?.disconnect()
      setup()
    })
    watch(() => props.watchKey, () => requestAnimationFrame(measure))
    // Radius scale / smoothing change CSS variables without resizing the host.
    watch(() => [config.appearance.radiusScale, config.appearance.smoothing], () => nextTick(measure))
    onBeforeUnmount(() => {
      ro?.disconnect()
      host?.removeAttribute('data-sq-shape')
    })

    const d = computed(() =>
      getSquirclePath({ width: w.value, height: h.value, radius: radii.value, smoothing: smoothing.value }),
    )
    watch([d, active], ([path, on]) => {
      if (!props.clip || !host) return
      host.style.clipPath = on && path ? `path('${path}')` : ''
    })
    const strokeD = computed(() =>
      getSquircleStrokePath({ width: w.value, height: h.value, radius: radii.value, smoothing: smoothing.value, strokeWidth: bw.value }),
    )
    return { active, w, h, bw, d, strokeD }
  },
})
</script>
