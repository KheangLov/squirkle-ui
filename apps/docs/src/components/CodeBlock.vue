<template>
  <div class="doc-code">
    <div class="doc-code__bar"><span>{{ lang }}</span><SqBtn size="x-small" variant="text" color="surface" :prepend-icon="copied ? 'check' : 'copy'" @click="copy">{{ copied ? 'Copied' : 'Copy' }}</SqBtn></div>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ code: string; lang?: string }>()
const copied = ref(false)
async function copy() {
  try { await navigator.clipboard.writeText(props.code); copied.value = true; setTimeout(() => (copied.value = false), 1500) } catch { /* clipboard blocked */ }
}
</script>
