<template>
  <header class="sq-app-bar" :class="{ 'sq-app-bar--flat': flat, 'sq-app-bar--floating': floating, 'sq-app-bar--blur': blur }" :style="style">
    <div class="sq-app-bar__inner" :class="{ 'sq-surface': floating }">
      <SqShape v-if="floating" />
      <slot name="prepend" />
      <div v-if="title || has('title')" class="sq-app-bar__title"><slot name="title">{{ title }}</slot></div>
      <slot />
      <div class="sq-app-bar__append"><slot name="append" /></div>
    </div>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { toUnit } from '@squirkle/core'
import SqShape from './SqShape.vue'
import { colorValue, onColorValue } from '../composables/style'

export default defineComponent({
  name: 'SqAppBar',
  components: { SqShape },
  props: {
    title: { type: String, default: undefined },
    /** Bar height; when changed also set --sq-app-bar-height on SqApp so sticky drawers line up. */
    height: { type: [Number, String], default: undefined },
    color: { type: String, default: undefined },
    flat: Boolean,
    /** Detached squircle bar with margins (iOS-style). */
    floating: Boolean,
    /** Translucent background with backdrop blur. */
    blur: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    const style = computed(() => ({
      '--sq-app-bar-height': props.height ? toUnit(props.height) : undefined,
      '--sq-bg': colorValue(props.color) ?? 'color-mix(in srgb, var(--sq-surface) 82%, transparent)',
      color: props.color ? onColorValue(props.color) : undefined,
    }))
    return { style, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-app-bar { grid-area: bar; position: sticky; top: 0; z-index: var(--sq-z-app-bar); }
.sq-app-bar__inner {
  display: flex; align-items: center; gap: var(--sq-space-2);
  height: var(--sq-app-bar-height, 60px); padding: 0 var(--sq-space-4);
  background: var(--sq-bg); border-bottom: 1px solid var(--sq-border);
}
.sq-app-bar--blur .sq-app-bar__inner { backdrop-filter: saturate(1.6) blur(14px); -webkit-backdrop-filter: saturate(1.6) blur(14px); }
.sq-app-bar--flat .sq-app-bar__inner { border-bottom-color: transparent; }
.sq-app-bar--floating { padding: var(--sq-space-2) var(--sq-space-3) 0; }
.sq-app-bar--floating .sq-app-bar__inner { --sq-r: var(--sq-radius-lg); --sq-bw: 1px; --sq-bd: var(--sq-border); --sq-shadow: var(--sq-elevation-2); --sq-shadow-filter: var(--sq-elevation-2-filter); border-bottom: var(--sq-bw) solid var(--sq-bd); }
.sq-app-bar__title { font-size: var(--sq-text-lg); font-weight: var(--sq-weight-bold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; }
.sq-app-bar__append { margin-inline-start: auto; display: flex; align-items: center; gap: var(--sq-space-1); }
</style>
