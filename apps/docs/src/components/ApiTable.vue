<template>
  <div class="doc-api">
    <h2 id="api">API</h2>
    <SqTabs v-model="tab" variant="segmented" :items="tabs" class="sq-mb-4" />
    <SqTable v-if="tab === 'Props'" density="compact">
      <thead><tr><th>Name</th><th>Type</th><th>Default</th></tr></thead>
      <tbody>
        <tr v-for="p in props" :key="p.name"><td><code>{{ p.name }}</code></td><td class="doc-api__type">{{ p.type }}</td><td><code>{{ p.def }}</code></td></tr>
        <tr v-if="!props.length"><td colspan="3">No props</td></tr>
      </tbody>
    </SqTable>
    <SqTable v-else density="compact">
      <thead><tr><th>Event</th></tr></thead>
      <tbody><tr v-for="e in emits" :key="e"><td><code>@{{ e }}</code></td></tr><tr v-if="!emits.length"><td>No events</td></tr></tbody>
    </SqTable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'

const p = defineProps<{ component: Component }>()
const tab = ref('Props')
const tabs = ['Props', 'Events']
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const typeName = (t: unknown): string => (t == null ? 'any' : Array.isArray(t) ? t.map(typeName).join(' | ') : (t as { name?: string }).name?.toLowerCase() ?? 'any')
const defName = (d: unknown) => (typeof d === 'function' ? (d.length ? 'fn' : (() => { try { return JSON.stringify((d as () => unknown)()) } catch { return 'fn' } })()) : d === undefined ? '—' : JSON.stringify(d))
const props = computed(() => {
  const raw = (p.component as { props?: Record<string, unknown> }).props ?? {}
  return Object.entries(raw)
    .map(([name, def]) => {
      const d = typeof def === 'function' || Array.isArray(def) ? { type: def } : (def as { type?: unknown; default?: unknown })
      const isBool = d.type === Boolean
      return { name: kebab(name), type: typeName(d.type), def: 'default' in d ? defName(d.default) : isBool ? 'false' : '—' }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
})
const emits = computed(() => ((p.component as { emits?: string[] }).emits ?? []).slice().sort())
</script>
