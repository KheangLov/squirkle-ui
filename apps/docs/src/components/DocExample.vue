<template>
  <section class="doc-example">
    <header class="doc-example__head">
      <h3>{{ example.title }}</h3>
      <SqBtn size="small" variant="text" color="surface" prepend-icon="code" @click="showCode = !showCode">{{ showCode ? 'Hide code' : 'Code' }}</SqBtn>
    </header>
    <div class="doc-example__stage"><component :is="comp" /></div>
    <CodeBlock v-if="showCode" :code="example.code" lang="vue" />
  </section>
</template>

<script setup lang="ts">
import { defineComponent, markRaw, ref } from 'vue'
import CodeBlock from './CodeBlock.vue'
import type { Example } from '../registry'

const props = defineProps<{ example: Example }>()
const showCode = ref(false)
// Example templates are authored in this repo (registry.ts) and compiled with Vue's runtime compiler.
const comp = markRaw(defineComponent({ template: `<div class="doc-example__root">${props.example.code}</div>`, setup: props.example.setup }))
</script>
