<template>
  <div v-if="entry" class="doc-page">
    <SqBreadcrumbs :items="[{ title: 'Components', to: '/components' }, { title: entry.category }, { title: entry.name }]" />
    <h1>{{ entry.name }}</h1>
    <p class="lead">{{ entry.description }}</p>
    <CodeBlock :code="usage" lang="ts" />
    <SqAlert v-if="entry.route" type="info" class="sq-mt-4">This component has a full showcase. <RouterLink :to="entry.route">Open it →</RouterLink></SqAlert>
    <h2 v-if="entry.examples.length">Examples</h2>
    <DocExample v-for="ex in entry.examples" :key="ex.title" :example="ex" />
    <SqBtn variant="tonal" prepend-icon="lucide:flask-conical" :to="'/playground?c=' + entry.name" class="sq-mt-4">Open in playground</SqBtn>
    <ApiTable :component="entry.component" />
  </div>
  <div v-else class="doc-page"><SqEmptyState title="Component not found" /></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DocExample from '../components/DocExample.vue'
import ApiTable from '../components/ApiTable.vue'
import CodeBlock from '../components/CodeBlock.vue'
import { bySlug } from '../registry'

const route = useRoute()
const entry = computed(() => bySlug(String(route.params.slug)))
const usage = computed(() => {
  const e = entry.value!
  const pkg = e.pkg ?? '@squirkle/ui'
  return `import { ${e.name} } from '${pkg}'          // Vue 3 / Nuxt 3-4\nimport { ${e.name} } from '${pkg}/vue2'     // Vue 2.7 / Nuxt 2`
})
</script>
