<template>
  <div class="sq-grid-filter" @click.stop>
    <template v-if="kind === 'set'">
      <SqTextField v-model="search" :placeholder="messages.search" density="compact" prepend-inner-icon="search" hide-details clearable />
      <label class="sq-grid-filter__all">
        <SqCheckbox :model-value="allChecked" :indeterminate="someChecked" :label="messages.selectAll" @update:modelValue="toggleAll" />
      </label>
      <SqVirtualScroll :items="shownValues" :item-height="32" :height="Math.min(shownValues.length * 32, 224) || 32">
        <template #default="{ item }">
          <SqCheckbox :model-value="isChecked(item)" :label="label(item)" @update:modelValue="toggleValue(item)" />
        </template>
      </SqVirtualScroll>
    </template>
    <template v-else>
      <SqSelect :model-value="draft.op" :items="ops" density="compact" hide-details @update:modelValue="set('op', $event)" />
      <SqTextField
        v-if="needsValue"
        :model-value="draftValue"
        :type="kind === 'number' ? 'number' : kind === 'date' ? 'date' : 'text'"
        :placeholder="kind === 'text' ? messages.search : 'Value'"
        density="compact"
        hide-details
        clearable
        @update:modelValue="set('value', $event)"
      />
      <SqTextField
        v-if="draft.op === 'between'"
        :model-value="draftValueTo"
        :type="kind === 'number' ? 'number' : 'date'"
        placeholder="To"
        density="compact"
        hide-details
        @update:modelValue="set('valueTo', $event)"
      />
    </template>
    <div class="sq-grid-filter__actions">
      <SqBtn size="small" variant="text" color="surface" @click="$emit('update:modelValue', undefined)">{{ messages.clear }}</SqBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue'
import { SqBtn, SqCheckbox, SqSelect, SqTextField, SqVirtualScroll, config } from '@squirkle-ui/ui'
import type { CellValue, FilterCondition, FilterKind } from './types'

const TEXT_OPS = [
  { title: 'Contains', value: 'contains' }, { title: 'Does not contain', value: 'notContains' }, { title: 'Equals', value: 'equals' },
  { title: 'Not equal', value: 'notEqual' }, { title: 'Starts with', value: 'startsWith' }, { title: 'Ends with', value: 'endsWith' },
  { title: 'Blank', value: 'blank' }, { title: 'Not blank', value: 'notBlank' },
]
const NUM_OPS = [
  { title: 'Equals', value: 'equals' }, { title: 'Not equal', value: 'notEqual' }, { title: 'Greater than', value: 'gt' }, { title: '≥', value: 'gte' },
  { title: 'Less than', value: 'lt' }, { title: '≤', value: 'lte' }, { title: 'Between', value: 'between' }, { title: 'Blank', value: 'blank' }, { title: 'Not blank', value: 'notBlank' },
]

/** Filter editor shown in the column menu (internal to SqDataGrid). */
export default defineComponent({
  name: 'SqGridFilter',
  components: { SqBtn, SqCheckbox, SqSelect, SqTextField, SqVirtualScroll },
  props: {
    kind: { type: String as PropType<FilterKind>, required: true },
    modelValue: { type: Object as PropType<FilterCondition>, default: undefined },
    /** Distinct values for the set filter. */
    values: { type: Array as PropType<CellValue[]>, default: () => [] },
    formatter: { type: Function as PropType<(v: CellValue) => string>, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const search = ref('')
    const ops = computed(() => (props.kind === 'text' ? TEXT_OPS : NUM_OPS))
    const draft = computed<FilterCondition>(() => props.modelValue ?? { kind: props.kind, op: props.kind === 'text' ? 'contains' : 'equals' })
    const draftValue = computed(() => draft.value.value as string | number | undefined)
    const draftValueTo = computed(() => draft.value.valueTo as string | number | undefined)
    const needsValue = computed(() => draft.value.op !== 'blank' && draft.value.op !== 'notBlank')
    const set = (key: 'op' | 'value' | 'valueTo', v: unknown) => emit('update:modelValue', { ...draft.value, kind: props.kind, [key]: v })

    const label = (v: CellValue) => (v == null || v === '' ? '(Blanks)' : props.formatter ? props.formatter(v) : String(v))
    const shownValues = computed(() => {
      const q = search.value.trim().toLowerCase()
      return q ? props.values.filter((v) => label(v).toLowerCase().includes(q)) : props.values
    })
    const checkedSet = computed(() => new Set((props.modelValue?.values ?? props.values).map(String)))
    const isChecked = (v: CellValue) => checkedSet.value.has(String(v))
    const allChecked = computed(() => !props.modelValue?.values || props.modelValue.values.length === props.values.length)
    const someChecked = computed(() => !!props.modelValue?.values && props.modelValue.values.length > 0 && !allChecked.value)
    const toggleValue = (v: CellValue) => {
      const cur = props.modelValue?.values ?? props.values
      const next = isChecked(v) ? cur.filter((x) => String(x) !== String(v)) : [...cur, v]
      emit('update:modelValue', next.length === props.values.length ? undefined : { kind: 'set', values: next })
    }
    const toggleAll = () => emit('update:modelValue', allChecked.value ? { kind: 'set', values: [] } : undefined)
    return { search, ops, draft, draftValue, draftValueTo, needsValue, set, label, shownValues, isChecked, allChecked, someChecked, toggleValue, toggleAll, messages: computed(() => config.locale.messages) }
  },
})
</script>

<style>
.sq-grid-filter { display: flex; flex-direction: column; gap: var(--sq-space-2); width: 240px; padding: var(--sq-space-2); }
.sq-grid-filter__all { border-bottom: 1px solid var(--sq-border); padding-bottom: 2px; }
.sq-grid-filter__actions { display: flex; justify-content: flex-end; }
.sq-grid-filter .sq-checkbox { min-height: 32px; font-size: var(--sq-text-sm); width: 100%; }
</style>
