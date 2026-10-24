<template>
  <footer class="sq-footer" :class="{ 'sq-footer--app': app }"><slot /></footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SqFooter',
  props: { app: { type: Boolean, default: true } },
})
</script>

<style>
.sq-footer { display: flex; align-items: center; gap: var(--sq-space-3); padding: var(--sq-space-4) var(--sq-space-6); color: var(--sq-muted); font-size: var(--sq-text-sm); border-top: 1px solid var(--sq-border); }
.sq-footer--app { grid-area: footer; }
</style>
