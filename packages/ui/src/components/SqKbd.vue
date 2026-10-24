<template>
  <kbd class="sq-kbd sq-squircle"><slot /></kbd>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'SqKbd' })
</script>

<style>
.sq-kbd { --sq-r: var(--sq-radius-xs); display: inline-flex; align-items: center; min-width: 22px; height: 22px; padding: 0 6px; font-family: var(--sq-font-mono); font-size: var(--sq-text-xs); background: var(--sq-surface-variant); color: var(--sq-on-surface); border: 1px solid var(--sq-border); box-shadow: inset 0 -2px 0 var(--sq-border); justify-content: center; }
</style>
