<template>
  <div class="doc-page" style="max-width:1280px">
    <h1>Playground</h1>
    <p class="lead">Pick any component — its knobs are generated from its real prop definitions.</p>
    <SqRow>
      <SqCol cols="12" md="4">
        <SqCard variant="outlined" title="Knobs">
          <div class="sq-pa-4 sq-d-flex sq-flex-column sq-gap-3">
            <SqAutocomplete v-model="name" label="Component" :items="names" />
            <SqTextField v-if="acceptsSlot" v-model="slotText" label="Default slot" density="compact" />
            <template v-for="k in knobs" :key="k.name">
              <SqSwitch v-if="k.kind === 'bool'" v-model="values[k.name]" :label="k.name" />
              <SqSelect v-else-if="k.kind === 'enum'" v-model="values[k.name]" :label="k.name" :items="k.options" clearable density="compact" />
              <SqNumberInput v-else-if="k.kind === 'number'" v-model="values[k.name]" :label="k.name" density="compact" />
              <SqTextField v-else v-model="values[k.name]" :label="k.name" density="compact" clearable />
            </template>
            <SqBtn variant="text" color="surface" prepend-icon="refresh" @click="reset">Reset</SqBtn>
          </div>
        </SqCard>
      </SqCol>
      <SqCol cols="12" md="8">
        <SqCard variant="outlined" title="Preview">
          <div class="sq-pa-6" style="min-height:220px;display:flex;align-items:center;justify-content:center;flex-wrap:wrap">
            <Preview :key="name" />
          </div>
          <CodeBlock :code="code" lang="vue" />
        </SqCard>
      </SqCol>
    </SqRow>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, ref, watch, type Component } from 'vue'
import { useRoute } from 'vue-router'
import * as ui from '@squirkle-ui/ui'
import CodeBlock from '../components/CodeBlock.vue'

const route = useRoute()
const lib = ui as unknown as Record<string, Component>
const skip = ['SqPortal', 'SqShape', 'SqExpandTransition', 'SqApp', 'SqMain', 'SqField', 'SqThemeProvider']
const names = (ui.componentNames as readonly string[]).filter((n) => !skip.includes(n))
const name = ref(typeof route.query.c === 'string' && names.includes(route.query.c) ? route.query.c : 'SqBtn')
const ENUMS: Record<string, string[]> = {
  color: ['primary', 'secondary', 'accent', 'success', 'info', 'warning', 'error', 'surface'],
  variant: ['flat', 'elevated', 'tonal', 'outlined', 'text', 'plain', 'filled', 'solo', 'underlined', 'separated', 'pill', 'segmented', 'underline'],
  size: ['x-small', 'small', 'default', 'large', 'x-large'],
  rounded: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'pill'],
  density: ['default', 'comfortable', 'compact'],
  location: ['top', 'bottom', 'left', 'right', 'bottom start', 'bottom end'],
  type: ['info', 'success', 'warning', 'error'],
}
const SLOT = ['SqBtn', 'SqChip', 'SqAlert', 'SqKbd', 'SqBadge', 'SqCard', 'SqSheet', 'SqBanner', 'SqTooltip', 'SqEmptyState', 'SqTimelineItem', 'SqListItem', 'SqDivider']
const values = reactive<Record<string, unknown>>({})
const slotText = ref('Click me')
const acceptsSlot = computed(() => SLOT.includes(name.value))
type Knob = { name: string; kind: 'bool' | 'enum' | 'number' | 'text'; options?: string[]; def: unknown }
const knobs = computed<Knob[]>(() => {
  const props = (lib[name.value] as { props?: Record<string, { type?: unknown; default?: unknown }> }).props ?? {}
  return Object.entries(props)
    .filter(([k, d]) => k !== 'modelValue' && ![Array, Object, Function].includes((Array.isArray(d.type) ? d.type[0] : d.type) as never) && !/^(item|on|rules|error)/.test(k))
    .map(([k, d]) => {
      const t = Array.isArray(d.type) ? d.type : [d.type]
      const def = typeof d.default === 'function' ? undefined : d.default
      if (t.includes(Boolean) && t.length === 1) return { name: k, kind: 'bool', def: def ?? false }
      if (ENUMS[k]) return { name: k, kind: 'enum', options: ENUMS[k], def }
      if (t.includes(Number) && !t.includes(String)) return { name: k, kind: 'number', def }
      return { name: k, kind: 'text', def }
    })
    .slice(0, 22) as Knob[]
})
const reset = () => {
  for (const k of Object.keys(values)) delete values[k]
  for (const k of knobs.value) values[k.name] = k.def
  if (name.value === 'SqTextField' || name.value === 'SqSelect') values.label = 'Label'
  if (name.value === 'SqSelect' || name.value === 'SqAutocomplete') values.items = undefined
}
watch(name, reset, { immediate: true })
const model = ref<unknown>(undefined)
const bound = computed(() => {
  const out: Record<string, unknown> = {}
  for (const k of knobs.value) if (values[k.name] !== k.def && values[k.name] !== undefined && values[k.name] !== '') out[k.name] = values[k.name]
  return out
})
const Preview = defineComponent({
  setup: () => () => {
    const extra: Record<string, unknown> = {}
    if (['SqSelect', 'SqAutocomplete', 'SqCombobox'].includes(name.value)) extra.items = ['Apple', 'Banana', 'Cherry', 'Mango']
    if (['SqTabs'].includes(name.value)) extra.items = ['One', 'Two', 'Three']
    if (['SqBreadcrumbs'].includes(name.value)) extra.items = [{ title: 'Home' }, { title: 'Docs' }, { title: 'Here' }]
    if (['SqStepper'].includes(name.value)) extra.items = ['Cart', 'Shipping', 'Pay']
    if (['SqList'].includes(name.value)) extra.items = ['Inbox', 'Sent', 'Trash']
    if (['SqPagination'].includes(name.value)) extra.length = 12
    return h(lib[name.value], { ...extra, ...bound.value, modelValue: model.value, 'onUpdate:modelValue': (v: unknown) => (model.value = v) }, acceptsSlot.value ? { default: () => slotText.value, activator: () => h(lib.SqBtn, null, () => 'Hover me') } : undefined)
  },
})
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const code = computed(() => {
  const attrs = Object.entries(bound.value).map(([k, v]) => (v === true ? kebab(k) : typeof v === 'string' ? `${kebab(k)}="${v}"` : `:${kebab(k)}="${JSON.stringify(v)}"`))
  const open = `<${name.value}${attrs.length ? ' ' + attrs.join(' ') : ''}`
  return acceptsSlot.value ? `${open}>${slotText.value}</${name.value}>` : `${open} />`
})
</script>
