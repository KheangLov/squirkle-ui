<template>
  <div class="sq-row" :class="{ 'sq-row--dense': dense, 'sq-row--no-gutters': noGutters }" :style="{ alignItems: align, justifyContent: justify }"><slot /></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/** 12-column flex row; combine with SqCol. */
export default defineComponent({
  name: 'SqRow',
  props: {
    dense: Boolean,
    noGutters: Boolean,
    align: { type: String, default: undefined },
    justify: { type: String, default: undefined },
  },
})
</script>

<style>
.sq-row { --sq-gutter: var(--sq-space-6); display: flex; flex-wrap: wrap; margin: calc(var(--sq-gutter) / -2); }
.sq-row--dense { --sq-gutter: var(--sq-space-2); }
.sq-row--no-gutters { --sq-gutter: 0px; }
</style>
