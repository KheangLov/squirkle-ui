<template>
  <div class="sq-empty-state">
    <div v-if="icon || has('media')" class="sq-empty-state__media">
      <slot name="media"><SqAvatar :icon="icon" :size="72" :color="color" rounded="xl" /></slot>
    </div>
    <div v-if="title" class="sq-empty-state__title">{{ title }}</div>
    <div v-if="text || has('default')" class="sq-empty-state__text"><slot>{{ text }}</slot></div>
    <div v-if="has('actions')" class="sq-empty-state__actions"><slot name="actions" /></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SqAvatar from './SqAvatar.vue'

export default defineComponent({
  name: 'SqEmptyState',
  components: { SqAvatar },
  props: {
    icon: { type: String, default: 'search' },
    title: { type: String, default: undefined },
    text: { type: String, default: undefined },
    color: { type: String, default: 'primary' },
  },
  setup: (_, { slots }) => ({ has: (n: string) => !!slots[n] }),
})
</script>

<style>
.sq-empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--sq-space-2); padding: var(--sq-space-10) var(--sq-space-6); }
.sq-empty-state__media { margin-bottom: var(--sq-space-3); }
.sq-empty-state__title { font-size: var(--sq-text-xl); font-weight: var(--sq-weight-semibold); }
.sq-empty-state__text { max-width: 420px; color: var(--sq-muted); }
.sq-empty-state__actions { display: flex; gap: var(--sq-space-2); margin-top: var(--sq-space-3); }
</style>
