<template>
  <div class="sq-list" :class="{ 'sq-list--nav': nav, 'sq-list--dense': density === 'compact', 'sq-list--bordered': bordered }" role="listbox" :aria-multiselectable="selectable && multiple ? 'true' : undefined">
    <SqVirtualScroll v-if="virtual" :items="items" :item-height="itemHeight" :height="height" :item-key="itemValue">
      <template #default="{ item, index }">
        <slot name="item" :item="item" :index="index">
          <SqListItem v-bind="itemProps(item)" />
        </slot>
      </template>
    </SqVirtualScroll>
    <template v-else>
      <div v-for="(item, index) in items" :key="keyOf(item, index)" class="sq-list__row">
        <slot name="item" :item="item" :index="index">
          <SqListSubheader v-if="isObj(item) && item.type === 'subheader'">{{ item.title }}</SqListSubheader>
          <SqDivider v-else-if="isObj(item) && item.type === 'divider'" />
          <SqListItem v-else v-bind="itemProps(item)" />
        </slot>
      </div>
      <slot />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { getByPath } from '@squirkle-ui/core'
import SqListItem from './SqListItem.vue'
import SqListSubheader from './SqListSubheader.vue'
import SqDivider from './SqDivider.vue'
import SqVirtualScroll from './SqVirtualScroll.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { provideGroup } from '../composables/group'

type ListItemBinding = { title?: string | number; value?: string | number | boolean | Record<string, unknown>; [key: string]: unknown }

/**
 * List with optional selection (v-model = selected value(s)) and `virtual` mode for very large item sets.
 * Items: { title, subtitle, prependIcon, prependAvatar, appendIcon, value, disabled } or { type: 'subheader' | 'divider' }.
 */
export default defineComponent({
  name: 'SqList',
  components: { SqListItem, SqListSubheader, SqDivider, SqVirtualScroll },
  model: vModel,
  props: {
    modelValue: { type: [String, Number, Boolean, Object, Array], default: undefined },
    items: { type: Array as PropType<unknown[]>, default: () => [] },
    itemTitle: { type: String, default: 'title' },
    itemValue: { type: String, default: 'value' },
    selectable: Boolean,
    multiple: Boolean,
    mandatory: Boolean,
    nav: Boolean,
    bordered: Boolean,
    density: { type: String as PropType<'default' | 'compact'>, default: 'default' },
    virtual: Boolean,
    height: { type: [Number, String], default: 400 },
    itemHeight: { type: Number, default: 48 },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<unknown>(props, emit, 'modelValue', () => (props.multiple ? [] : undefined))
    provideGroup('sq-list', model, { get multiple() { return props.multiple }, get mandatory() { return props.mandatory }, get selectable() { return props.selectable } })
    const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object'
    const keyOf = (item: unknown, i: number) => (isObj(item) ? (getByPath(item, props.itemValue) as string) ?? i : (item as string))
    const itemProps = (item: unknown): ListItemBinding =>
      isObj(item)
        ? { ...item, title: getByPath(item, props.itemTitle) as string, value: getByPath(item, props.itemValue) as ListItemBinding['value'] }
        : { title: String(item), value: item as ListItemBinding['value'] }
    return { model, isObj, keyOf, itemProps }
  },
})
</script>

<style>
.sq-list { display: flex; flex-direction: column; padding: var(--sq-space-1) 0; }
.sq-list--nav { padding: var(--sq-space-1); gap: 2px; }
.sq-list--bordered { border: 1px solid var(--sq-border); border-radius: var(--sq-radius-lg); }
.sq-list__row { display: contents; }
</style>
