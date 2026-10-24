<template>
  <div class="sq-divider" :class="{ 'sq-divider--vertical': vertical, 'sq-divider--inset': inset }" role="separator" :aria-orientation="vertical ? 'vertical' : 'horizontal'">
    <span v-if="has('default')" class="sq-divider__content"><slot /></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SqDivider',
  props: { vertical: Boolean, inset: Boolean },
  setup: (_, { slots }) => ({ has: (n: string) => !!slots[n] }),
})
</script>

<style>
.sq-divider { display: flex; align-items: center; gap: var(--sq-space-3); color: var(--sq-muted); font-size: var(--sq-text-xs); margin: var(--sq-space-2) 0; }
.sq-divider::before, .sq-divider::after { content: ''; flex: 1; border-top: 1px solid var(--sq-border); }
.sq-divider:not(:has(.sq-divider__content))::after { display: none; }
.sq-divider--inset { margin-inline-start: 56px; }
.sq-divider--vertical { flex-direction: column; align-self: stretch; margin: 0 var(--sq-space-2); }
.sq-divider--vertical::before, .sq-divider--vertical::after { border-top: 0; border-left: 1px solid var(--sq-border); }
</style>
