<template>
  <div class="doc-page">
    <h1>Editor</h1>
    <p class="lead"><code>@squirkle-ui/editor</code> — a rich-text field on Tiptap (StarterKit: headings, lists, quotes, code, links, undo/redo) in the same squircle field shell as the form inputs. One source for Vue 2.7 and Vue 3, SSR-safe.</p>

    <h2>HTML v-model</h2>
    <SqEditor v-model="html" label="Release notes" placeholder="Write something…" hint="Paste is cleaned to the editor schema." />
    <CodeBlock :code="html" lang="html" class="sq-mt-3" />

    <h2>Custom toolbar + JSON output</h2>
    <SqEditor v-model="json" output="json" :toolbar="[['bold', 'italic', 'strike'], ['bulletList', 'orderedList'], ['link']]" :min-height="100" :max-height="220" placeholder="Short comment…" />
    <CodeBlock :code="JSON.stringify(json, null, 2)" lang="json" class="sq-mt-3" />

    <h2>States</h2>
    <div class="doc-editor-grid">
      <SqEditor :model-value="sample" label="Read-only" readonly :min-height="80" />
      <SqEditor :model-value="sample" label="Disabled" disabled :min-height="80" />
      <SqEditor model-value="" label="Error" error hint="This field is required" :min-height="80" :toolbar="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CodeBlock from '../components/CodeBlock.vue'

const html = ref('<h2>What’s new</h2><p>New: <strong>date &amp; time field</strong>, a <em>rich-text editor</em> and a faster swiper.</p><ul><li><p>Tiptap StarterKit</p></li><li><p>Vue 2.7 + Vue 3</p></li></ul>')
const json = ref<Record<string, unknown> | string>('')
const sample = '<p>Ship the <strong>editor</strong> with the next release.</p>'
</script>

<style>
.doc-editor-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
</style>
