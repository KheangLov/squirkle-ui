<template>
  <main class="sq-main" :class="{ 'sq-main--padded': padded }"><slot /></main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SqMain',
  props: { padded: Boolean },
})
</script>

<style>
.sq-main { grid-area: main; min-width: 0; }
.sq-main--padded { padding: var(--sq-space-6); }
</style>
