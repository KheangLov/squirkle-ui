<template>
  <div class="sq-card-title sq-card-title--standalone"><slot /></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'SqCardTitle' })
</script>

<style>
.sq-card-title--standalone { padding: var(--sq-space-4) var(--sq-space-5) 0; }
</style>
