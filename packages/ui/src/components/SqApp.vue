<template>
  <div class="sq-app sq-root" :class="[`sq-theme--${themeName}`, { 'sq-app--full-height': fullHeight }]">
    <slot />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { config } from '../config'

/**
 * Application root. Grid areas: app-bar (top), navigation drawers (start / end), main, footer.
 * Children place themselves via their own grid-area.
 */
export default defineComponent({
  name: 'SqApp',
  props: {
    /** Force a theme for this subtree; defaults to the global theme. */
    theme: { type: String, default: undefined },
    fullHeight: { type: Boolean, default: true },
  },
  setup(props) {
    return { themeName: computed(() => props.theme ?? config.theme.name) }
  },
})
</script>

<style>
.sq-app {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-rows: auto 1fr auto;
  grid-template-areas: 'bar bar bar' 'start main end' 'footer footer footer';
  background: var(--sq-background);
  color: var(--sq-on-background);
}
.sq-app:has(> .sq-app-bar) { --sq-app-bar-height: 60px; }
.sq-app--full-height { min-height: 100vh; min-height: 100dvh; }
</style>
