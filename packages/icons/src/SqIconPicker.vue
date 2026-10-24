<template>
  <div class="sq-icon-picker sq-surface" :style="{ '--sq-r': 'var(--sq-radius-xl)', '--sq-bg': 'var(--sq-surface-raised)', '--sq-bd': 'var(--sq-border)', '--sq-bw': '1px' }">
    <SqShape />
    <div class="sq-icon-picker__bar">
      <SqTextField v-model="query" :placeholder="placeholder" prepend-inner-icon="search" density="compact" hide-details clearable />
      <SqSelect v-if="prefixes.length > 1" v-model="prefix" :items="prefixItems" density="compact" hide-details class="sq-icon-picker__prefix" />
    </div>
    <div v-if="loading" class="sq-icon-picker__state"><SqProgressCircular indeterminate :size="22" :width="3" /></div>
    <div v-else-if="error" class="sq-icon-picker__state">{{ error }}</div>
    <div v-else-if="!results.length" class="sq-icon-picker__state">{{ query ? 'No icons found' : 'Type to search 200,000+ Iconify icons' }}</div>
    <SqVirtualScroll v-else :items="rows" :item-height="56" :height="height">
      <template #default="{ item }">
        <div class="sq-icon-picker__row">
          <button
            v-for="name in item"
            :key="name"
            type="button"
            class="sq-icon-picker__cell sq-squircle"
            :class="{ 'sq-icon-picker__cell--active': name === model }"
            :title="name"
            :aria-label="name"
            :aria-pressed="name === model ? 'true' : 'false'"
            @click="model = name"
          ><SqIcon :icon="name" size="24px" /></button>
        </div>
      </template>
    </SqVirtualScroll>
    <div v-if="model" class="sq-icon-picker__selected"><SqIcon :icon="model" size="20px" /><code>{{ model }}</code></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch, type PropType } from 'vue'
import { debounce } from '@squirkle/core'
import { SqIcon, SqProgressCircular, SqSelect, SqShape, SqTextField, SqVirtualScroll, config, useProxiedModel, vModel } from '@squirkle/ui'

/** Searchable Iconify browser (uses the configured Iconify API host). v-model = icon name, e.g. `mdi:home`. */
export default defineComponent({
  name: 'SqIconPicker',
  components: { SqIcon, SqProgressCircular, SqSelect, SqShape, SqTextField, SqVirtualScroll },
  model: vModel,
  props: {
    modelValue: { type: String, default: undefined },
    /** Limit to icon sets, e.g. ['mdi', 'lucide', 'tabler']. */
    prefixes: { type: Array as PropType<string[]>, default: () => ['mdi', 'lucide', 'tabler', 'ph', 'solar'] },
    columns: { type: Number, default: 8 },
    height: { type: [Number, String], default: 280 },
    limit: { type: Number, default: 400 },
    placeholder: { type: String, default: 'Search icons…' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<string | undefined>(props, emit)
    const query = ref('home')
    const prefix = ref('all')
    const results = ref<string[]>([])
    const loading = ref(false)
    const error = ref('')
    const prefixItems = computed(() => [{ title: 'All sets', value: 'all' }, ...props.prefixes.map((p) => ({ title: p, value: p }))])
    let seq = 0
    const search = debounce(async () => {
      const q = (query.value ?? '').trim()
      const api = config.icons.api
      if (!q || !api) return (results.value = [])
      const my = ++seq
      loading.value = true
      error.value = ''
      try {
        const sets = prefix.value === 'all' ? props.prefixes.join(',') : prefix.value
        const res = await fetch(`${api}/search?query=${encodeURIComponent(q)}&limit=${props.limit}&prefixes=${encodeURIComponent(sets)}`)
        const json = (await res.json()) as { icons?: string[] }
        if (my === seq) results.value = json.icons ?? []
      } catch {
        if (my === seq) error.value = 'Icon search is unavailable (offline?)'
      } finally {
        if (my === seq) loading.value = false
      }
    }, 250)
    watch([query, prefix], () => search())
    onMounted(() => search())
    const rows = computed(() => {
      const out: string[][] = []
      for (let i = 0; i < results.value.length; i += props.columns) out.push(results.value.slice(i, i + props.columns))
      return out
    })
    return { model, query, prefix, prefixItems, results, rows, loading, error }
  },
})
</script>

<style>
.sq-icon-picker { display: flex; flex-direction: column; gap: var(--sq-space-2); padding: var(--sq-space-3); width: 100%; max-width: 480px; }
.sq-icon-picker__bar { display: flex; gap: var(--sq-space-2); }
.sq-icon-picker__prefix { max-width: 140px; }
.sq-icon-picker__state { display: flex; align-items: center; justify-content: center; min-height: 120px; color: var(--sq-muted); font-size: var(--sq-text-sm); }
.sq-icon-picker__row { display: flex; gap: 4px; height: 56px; padding: 4px 0; }
.sq-icon-picker__cell { --sq-r: var(--sq-radius-md); flex: 1; display: flex; align-items: center; justify-content: center; border: 0; background: none; color: var(--sq-on-surface); cursor: pointer; max-width: 56px; }
.sq-icon-picker__cell:hover { background: color-mix(in srgb, var(--sq-primary) 10%, transparent); color: var(--sq-primary); }
.sq-icon-picker__cell--active { background: var(--sq-primary) !important; color: var(--sq-on-primary) !important; }
.sq-icon-picker__selected { display: flex; align-items: center; gap: var(--sq-space-2); padding-top: var(--sq-space-2); border-top: 1px solid var(--sq-border); font-size: var(--sq-text-sm); }
</style>
