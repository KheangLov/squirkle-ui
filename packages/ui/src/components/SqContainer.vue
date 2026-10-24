<template>
  <div class="sq-container" :class="{ 'sq-container--fluid': fluid }" :style="maxWidth ? { maxWidth: toUnit(maxWidth) } : undefined"><slot /></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { toUnit } from '@squirkle-ui/core'

export default defineComponent({
  name: 'SqContainer',
  props: { fluid: Boolean, maxWidth: { type: [Number, String], default: undefined } },
  setup: () => ({ toUnit }),
})
</script>

<style>
.sq-container { width: 100%; margin: 0 auto; padding: var(--sq-space-4); max-width: 1200px; }
.sq-container--fluid { max-width: none; }
@media (min-width: 960px) { .sq-container { padding: var(--sq-space-6); } }
</style>
