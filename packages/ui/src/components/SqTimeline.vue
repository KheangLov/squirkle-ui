<template>
  <div class="sq-timeline" :class="[`sq-timeline--${align}`, { 'sq-timeline--dense': dense }]" role="list"><slot /></div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'SqTimeline',
  props: {
    align: { type: String as PropType<'start' | 'alternate'>, default: 'start' },
    dense: Boolean,
  },
})
</script>

<style>
.sq-timeline { position: relative; display: flex; flex-direction: column; }
.sq-timeline::before { content: ''; position: absolute; top: 8px; bottom: 8px; left: 15px; width: 2px; background: var(--sq-border); border-radius: 2px; }
.sq-timeline--alternate::before { left: 50%; margin-left: -1px; }
</style>
