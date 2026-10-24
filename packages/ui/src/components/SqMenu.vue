<template>
  <span
    ref="wrapper"
    class="sq-menu"
    @click="activatorListeners.click"
    @mouseenter="activatorListeners.mouseenter"
    @mouseleave="activatorListeners.mouseleave"
    @focusin="activatorListeners.focusin"
    @focusout="activatorListeners.focusout"
    @keydown="activatorListeners.keydown"
  >
    <slot name="activator" :is-active="!!model" :open="open" :close="close" :toggle="toggle" />
    <SqPortal>
      <transition name="sq-scale">
        <div
          v-if="model"
          ref="content"
          class="sq-menu__content sq-surface"
          :class="[`sq-menu__content--${pos.side}`, contentClass]"
          :style="[contentStyle, surfaceStyle]"
          role="menu"
          tabindex="-1"
          @click="onContentClick"
          @keydown.esc="schedule(false)"
          @mouseenter="openOnHover && open()"
          @mouseleave="openOnHover && close()"
        >
          <SqShape />
          <div class="sq-menu__scroll" :style="{ maxHeight: toUnit(maxHeight) }"><slot :close="() => schedule(false)" /></div>
        </div>
      </transition>
    </SqPortal>
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue'
import { toUnit } from '@squirkle/core'
import SqPortal from './SqPortal.vue'
import SqShape from './SqShape.vue'
import { vModel } from '../composables/model'
import { useActivatorOverlay } from '../composables/overlay'
import { radiusValue, roundedProp } from '../composables/style'
import type { Location } from '../composables/dom'

export default defineComponent({
  name: 'SqMenu',
  components: { SqPortal, SqShape },
  model: vModel,
  props: {
    modelValue: { type: Boolean, default: undefined },
    location: { type: String as PropType<Location>, default: 'bottom start' },
    offset: { type: Number, default: 6 },
    openOnHover: Boolean,
    openOnClick: { type: Boolean, default: true },
    openOnFocus: Boolean,
    openDelay: { type: Number, default: 80 },
    closeDelay: { type: Number, default: 160 },
    closeOnContentClick: { type: Boolean, default: true },
    persistent: Boolean,
    disabled: Boolean,
    /** CSS selector, element or 'parent'. `type: null` so DOM elements pass prop validation in Vue 2 too. */
    activator: { type: null as unknown as PropType<string | HTMLElement>, default: undefined },
    matchWidth: Boolean,
    maxHeight: { type: [Number, String], default: 360 },
    rounded: { ...roundedProp, default: 'lg' },
    contentClass: { type: [String, Array, Object], default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const wrapper = ref<HTMLElement | null>(null)
    const overlay = useActivatorOverlay(props, emit, wrapper)
    const onContentClick = () => {
      if (props.closeOnContentClick) overlay.schedule(false)
    }
    const surfaceStyle = computed(() => ({ '--sq-r': radiusValue(props.rounded) }))
    return { wrapper, ...overlay, onContentClick, surfaceStyle, toUnit }
  },
})
</script>

<style>
.sq-menu { display: contents; }
.sq-menu__content {
  --sq-bg: var(--sq-surface-raised); --sq-bd: var(--sq-border); --sq-bw: 1px;
  --sq-shadow: var(--sq-elevation-3); --sq-shadow-filter: var(--sq-elevation-3-filter);
  position: fixed; min-width: 160px; max-width: min(420px, calc(100vw - 16px));
  color: var(--sq-on-surface); outline: none; transform-origin: top left;
}
.sq-menu__content--top { transform-origin: bottom left; }
.sq-menu__scroll { overflow: auto; padding: var(--sq-space-1); border-radius: inherit; }
</style>
