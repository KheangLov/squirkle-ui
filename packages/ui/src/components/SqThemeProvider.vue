<template>
  <div class="sq-theme-provider sq-root" :class="`sq-theme--${theme}`" :style="withBackground ? { background: 'var(--sq-background)', color: 'var(--sq-on-background)' } : undefined"><slot /></div>
</template>

<script lang="ts">
import { computed, defineComponent, provide } from 'vue'

/** Applies a theme to a subtree; overlays opened inside (SqPortal) inherit it. */
export default defineComponent({
  name: 'SqThemeProvider',
  props: {
    theme: { type: String, required: true },
    withBackground: Boolean,
  },
  setup(props) {
    provide('sq-theme-scope', computed(() => props.theme))
  },
})
</script>
