<template>
  <span
    ref="wrapper"
    class="sq-tooltip"
    @mouseenter="activatorListeners.mouseenter"
    @mouseleave="activatorListeners.mouseleave"
    @focusin="activatorListeners.focusin"
    @focusout="activatorListeners.focusout"
    @keydown="activatorListeners.keydown"
  >
    <slot name="activator" />
    <slot />
    <SqPortal>
      <transition name="sq-fade">
        <div v-if="model && (text || has('content'))" ref="content" class="sq-tooltip__content sq-squircle" :style="contentStyle" role="tooltip">
          <slot name="content">{{ text }}</slot>
        </div>
      </transition>
    </SqPortal>
  </span>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue'
import SqPortal from './SqPortal.vue'
import { vModel } from '../composables/model'
import { useActivatorOverlay } from '../composables/overlay'
import type { Location } from '../composables/dom'

/** Wrap any element: <SqTooltip text="Save"><SqBtn icon="check" /></SqTooltip> */
export default defineComponent({
  name: 'SqTooltip',
  components: { SqPortal },
  model: vModel,
  props: {
    modelValue: { type: Boolean, default: undefined },
    text: { type: String, default: undefined },
    location: { type: String as PropType<Location>, default: 'top' },
    offset: { type: Number, default: 8 },
    openDelay: { type: Number, default: 250 },
    closeDelay: { type: Number, default: 50 },
    disabled: Boolean,
    /** CSS selector, element or 'parent'. `type: null` so DOM elements pass prop validation in Vue 2 too. */
    activator: { type: null as unknown as PropType<string | HTMLElement>, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const wrapper = ref<HTMLElement | null>(null)
    const overlay = useActivatorOverlay(
      {
        get modelValue() { return props.modelValue },
        get location() { return props.location },
        get offset() { return props.offset },
        get disabled() { return props.disabled },
        get openDelay() { return props.openDelay },
        get closeDelay() { return props.closeDelay },
        get activator() { return props.activator },
        openOnHover: true,
        openOnFocus: true,
        openOnClick: false,
      },
      emit,
      wrapper,
    )
    return { wrapper, ...overlay, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-tooltip { display: contents; }
.sq-tooltip__content {
  --sq-r: var(--sq-radius-sm);
  position: fixed; z-index: var(--sq-z-tooltip) !important; max-width: 280px; padding: 6px 10px;
  background: color-mix(in srgb, var(--sq-on-surface) 92%, transparent); color: var(--sq-surface);
  font-size: var(--sq-text-xs); font-weight: var(--sq-weight-medium); line-height: 1.4; pointer-events: none;
  backdrop-filter: blur(6px);
}
</style>
