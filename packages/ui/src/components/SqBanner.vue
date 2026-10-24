<template>
  <div class="sq-banner" :class="{ 'sq-banner--sticky': sticky }" role="banner">
    <SqAvatar v-if="icon" :icon="icon" :color="color" size="small" />
    <div class="sq-banner__text"><slot>{{ text }}</slot></div>
    <div class="sq-banner__actions"><slot name="actions" /></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SqAvatar from './SqAvatar.vue'

export default defineComponent({
  name: 'SqBanner',
  components: { SqAvatar },
  props: {
    text: { type: String, default: undefined },
    icon: { type: String, default: undefined },
    color: { type: String, default: 'primary' },
    sticky: Boolean,
  },
})
</script>

<style>
.sq-banner { display: flex; align-items: center; flex-wrap: wrap; gap: var(--sq-space-3); padding: var(--sq-space-3) var(--sq-space-4); background: var(--sq-surface); border-bottom: 1px solid var(--sq-border); }
.sq-banner--sticky { position: sticky; top: 0; z-index: 2; }
.sq-banner__text { flex: 1; min-width: 200px; font-size: var(--sq-text-sm); }
.sq-banner__actions { display: flex; gap: var(--sq-space-2); margin-inline-start: auto; }
</style>
