<template>
  <div class="sq-treeview" role="tree" :aria-multiselectable="selectable ? 'true' : undefined">
    <div
      v-for="row in rows"
      :key="String(row.value)"
      class="sq-treeview__node sq-squircle"
      :class="{ 'sq-treeview__node--active': activatable && activeModel === row.value }"
      :style="{ paddingInlineStart: row.depth * indent + 8 + 'px' }"
      role="treeitem"
      :aria-level="row.depth + 1"
      :aria-expanded="row.hasChildren ? (isOpen(row.value) ? 'true' : 'false') : undefined"
      tabindex="0"
      @click="onRowClick(row)"
      @keydown.enter.prevent="onRowClick(row)"
      @keydown.right.prevent="row.hasChildren && !isOpen(row.value) && toggleOpen(row.value)"
      @keydown.left.prevent="row.hasChildren && isOpen(row.value) && toggleOpen(row.value)"
    >
      <button v-if="row.hasChildren" type="button" class="sq-treeview__toggle" :class="{ 'sq-treeview__toggle--open': isOpen(row.value) }" tabindex="-1" :aria-label="isOpen(row.value) ? 'Collapse' : 'Expand'" @click.stop="toggleOpen(row.value)"><SqIcon icon="chevronRight" size="18px" /></button>
      <span v-else class="sq-treeview__toggle-spacer"></span>
      <span v-if="selectable" class="sq-treeview__check sq-squircle" :class="{ 'sq-treeview__check--on': selState(row) === 'all', 'sq-treeview__check--some': selState(row) === 'some' }" @click.stop="toggleSelect(row)">
        <SqIcon v-if="selState(row) === 'all'" icon="check" size="14px" /><SqIcon v-else-if="selState(row) === 'some'" icon="minus" size="14px" />
      </span>
      <SqIcon v-if="row.icon" :icon="row.icon" size="18px" class="sq-treeview__icon" />
      <span class="sq-treeview__title"><slot name="title" :item="row.raw">{{ row.title }}</slot></span>
      <span v-if="has('append')" class="sq-treeview__append"><slot name="append" :item="row.raw" /></span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { getByPath } from '@squirkle/core'
import SqIcon from './SqIcon.vue'
import { useProxiedModel, vModel } from '../composables/model'

interface Row { value: unknown; title: string; icon?: string; depth: number; hasChildren: boolean; raw: Record<string, unknown>; leaves: unknown[] }

/**
 * Tree rendered as a flat list of visible rows (cheap for large trees).
 * v-model = selected leaf values (with `selectable`), v-model:opened, v-model:activated.
 */
export default defineComponent({
  name: 'SqTreeview',
  components: { SqIcon },
  model: vModel,
  props: {
    modelValue: { type: Array as PropType<unknown[]>, default: undefined },
    opened: { type: Array as PropType<unknown[]>, default: undefined },
    activated: { type: [String, Number], default: undefined },
    items: { type: Array as PropType<Record<string, unknown>[]>, default: () => [] },
    itemTitle: { type: String, default: 'title' },
    itemValue: { type: String, default: 'value' },
    itemChildren: { type: String, default: 'children' },
    selectable: Boolean,
    activatable: Boolean,
    openAll: Boolean,
    /** Filter text; matching nodes and their ancestors stay visible and open. */
    search: { type: String, default: '' },
    indent: { type: Number, default: 20 },
  },
  emits: ['update:modelValue', 'update:opened', 'update:activated', 'click:item'],
  setup(props, { emit, slots }) {
    const selected = useProxiedModel<unknown[]>(props, emit, 'modelValue', () => [])
    const openedModel = useProxiedModel<unknown[]>(props, emit, 'opened', () => [])
    const activeModel = useProxiedModel<unknown>(props, emit, 'activated')
    const children = (n: Record<string, unknown>) => (getByPath(n, props.itemChildren) as Record<string, unknown>[] | undefined) ?? []
    const valueOf = (n: Record<string, unknown>) => getByPath(n, props.itemValue) ?? getByPath(n, props.itemTitle)

    const leavesCache = computed(() => {
      const map = new Map<unknown, unknown[]>()
      const walk = (n: Record<string, unknown>): unknown[] => {
        const kids = children(n)
        const leaves = kids.length ? kids.flatMap(walk) : [valueOf(n)]
        map.set(valueOf(n), leaves)
        return leaves
      }
      props.items.forEach(walk)
      return map
    })
    const matches = computed(() => {
      const q = props.search.trim().toLowerCase()
      if (!q) return null
      const keep = new Set<unknown>()
      const walk = (n: Record<string, unknown>): boolean => {
        const self = String(getByPath(n, props.itemTitle) ?? '').toLowerCase().includes(q)
        const kid = children(n).map(walk).some(Boolean)
        if (self || kid) keep.add(valueOf(n))
        return self || kid
      }
      props.items.forEach(walk)
      return keep
    })
    const openSet = computed(() => new Set(openedModel.value))
    const isOpen = (v: unknown) => props.openAll || !!matches.value || openSet.value.has(v)
    const rows = computed<Row[]>(() => {
      const out: Row[] = []
      const walk = (nodes: Record<string, unknown>[], depth: number) => {
        for (const n of nodes) {
          const value = valueOf(n)
          if (matches.value && !matches.value.has(value)) continue
          const kids = children(n)
          out.push({ value, title: String(getByPath(n, props.itemTitle) ?? ''), icon: n.icon as string | undefined, depth, hasChildren: kids.length > 0, raw: n, leaves: leavesCache.value.get(value) ?? [] })
          if (kids.length && isOpen(value)) walk(kids, depth + 1)
        }
      }
      walk(props.items, 0)
      return out
    })
    const selSet = computed(() => new Set(selected.value))
    const selState = (row: Row) => {
      const n = row.leaves.filter((l) => selSet.value.has(l)).length
      return n === 0 ? 'none' : n === row.leaves.length ? 'all' : 'some'
    }
    const toggleOpen = (v: unknown) => (openedModel.value = openSet.value.has(v) ? openedModel.value.filter((x) => x !== v) : [...openedModel.value, v])
    const toggleSelect = (row: Row) => {
      const all = selState(row) === 'all'
      const set = new Set(selected.value)
      row.leaves.forEach((l) => (all ? set.delete(l) : set.add(l)))
      selected.value = Array.from(set)
    }
    const onRowClick = (row: Row) => {
      emit('click:item', row.raw)
      if (props.activatable) activeModel.value = row.value
      else if (props.selectable && !row.hasChildren) toggleSelect(row)
      else if (row.hasChildren) toggleOpen(row.value)
    }
    return { rows, activeModel, isOpen, toggleOpen, toggleSelect, selState, onRowClick, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-treeview { display: flex; flex-direction: column; gap: 1px; font-size: var(--sq-text-md); }
.sq-treeview__node { --sq-r: var(--sq-radius-sm); display: flex; align-items: center; gap: 6px; min-height: 34px; padding-inline-end: var(--sq-space-2); cursor: pointer; outline: none; }
.sq-treeview__node:hover { background: color-mix(in srgb, var(--sq-on-surface) 5%, transparent); }
.sq-treeview__node:focus-visible { box-shadow: var(--sq-focus-ring); }
.sq-treeview__node--active { background: color-mix(in srgb, var(--sq-primary) 12%, transparent) !important; color: var(--sq-primary); font-weight: var(--sq-weight-medium); }
.sq-treeview__toggle { display: flex; padding: 0; border: 0; background: none; color: var(--sq-muted); cursor: pointer; border-radius: var(--sq-radius-xs); transition: transform var(--sq-duration) var(--sq-ease); }
.sq-treeview__toggle--open { transform: rotate(90deg); }
.sq-treeview__toggle-spacer { width: 18px; flex: none; }
.sq-treeview__check { --sq-r: 5px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; flex: none; border: 1.5px solid var(--sq-border-strong); color: #fff; }
.sq-treeview__check--on, .sq-treeview__check--some { background: var(--sq-primary); border-color: var(--sq-primary); }
.sq-treeview__icon { color: var(--sq-muted); }
.sq-treeview__title { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
