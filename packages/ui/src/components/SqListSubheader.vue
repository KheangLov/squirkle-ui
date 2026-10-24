<template>
  <div class="sq-list-subheader" :class="{ 'sq-list-subheader--sticky': sticky }"><slot /></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'SqListSubheader', props: { sticky: Boolean } })
</script>

<style>
.sq-list-subheader { padding: var(--sq-space-3) var(--sq-space-4) var(--sq-space-1); font-size: var(--sq-text-2xs); font-weight: var(--sq-weight-bold); letter-spacing: 0.06em; text-transform: uppercase; color: var(--sq-muted); }
.sq-list-subheader--sticky { position: sticky; top: 0; z-index: 1; background: inherit; }
</style>
