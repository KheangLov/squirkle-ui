<template>
  <div ref="root" class="sq-select" :class="{ 'sq-select--open': menu, 'sq-select--multiple': multiple }">
    <SqField
      v-bind="fieldProps"
      :id="id"
      :messages="errors"
      :error="hasError"
      :focused="focused || menu"
      :dirty="hasValue"
      :disabled="isDisabled"
      :readonly="isReadonly"
      @click:control="onControlClick"
      @click:clear="clear"
    >
      <template #append-inner><SqIcon icon="chevronDown" class="sq-select__chevron" /></template>
      <template v-if="multiple && chips">
        <SqChip v-for="s in selectedItems" :key="String(s.value)" size="small" :closable="closableChips" @click:close="toggleItem(s)">{{ s.title }}</SqChip>
      </template>
      <span v-else-if="multiple && !searching && selectedItems.length" class="sq-select__selection">{{ selectedItems.map((s) => s.title).join(', ') }}</span>
      <input
        :id="id"
        ref="input"
        class="sq-select__input"
        :class="{ 'sq-select__input--hidden': !searchable && !combobox }"
        :value="inputValue"
        :placeholder="hasValue && (multiple || !searchable) ? '' : placeholder"
        :readonly="(!searchable && !combobox) || isReadonly"
        :disabled="isDisabled"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="menu ? 'true' : 'false'"
        :aria-controls="`${id}-listbox`"
        :aria-activedescendant="highlight >= 0 ? `${id}-opt-${highlight}` : undefined"
        autocomplete="off"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlurInput"
        @keydown="onKeydown"
      />
      <span v-if="!multiple && !searching && selectedItems.length && !searchable && !combobox" class="sq-select__selection sq-select__selection--single">{{ selectedItems[0].title }}</span>
      <span v-else-if="placeholder && !hasValue && !searchable && !combobox && (!label || focused || menu)" class="sq-select__selection sq-select__selection--single sq-select__placeholder">{{ placeholder }}</span>
    </SqField>
    <SqPortal>
      <transition name="sq-scale">
        <div v-if="menu" :id="`${id}-listbox`" ref="content" class="sq-select__menu sq-menu__content sq-surface" :style="[contentStyle, { '--sq-r': 'var(--sq-radius-lg)' }]" role="listbox" :aria-multiselectable="multiple ? 'true' : undefined" @mousedown.prevent>
          <SqShape />
          <div v-if="loading && !filtered.length" class="sq-select__empty"><SqProgressCircular indeterminate :size="20" :width="3" /></div>
          <div v-else-if="!filtered.length" class="sq-select__empty"><slot name="no-data">{{ combobox && search ? `↵ ${search}` : messages.noResults }}</slot></div>
          <SqVirtualScroll v-else ref="list" :items="filtered" :item-height="itemHeight" :height="listHeight" :overscan="8" :infinite="infinite" :loading="loading" :has-more="hasMore" @load-more="$emit('load-more', search)">
            <template #default="{ item, index }">
              <div
                :id="`${id}-opt-${index}`"
                class="sq-select__option"
                :class="{ 'sq-select__option--selected': isSelected(item), 'sq-select__option--highlight': index === highlight, 'sq-disabled': item.disabled }"
                role="option"
                :aria-selected="isSelected(item) ? 'true' : 'false'"
                @click="toggleItem(item)"
                @mouseenter="highlight = index"
              >
                <span v-if="multiple" class="sq-select__check sq-squircle"><SqIcon v-if="isSelected(item)" icon="check" size="14px" /></span>
                <slot name="item" :item="item.raw" :selected="isSelected(item)">
                  <span class="sq-select__option-title">{{ item.title }}</span>
                  <span v-if="item.subtitle" class="sq-select__option-subtitle">{{ item.subtitle }}</span>
                </slot>
                <SqIcon v-if="!multiple && isSelected(item)" icon="check" size="18px" class="sq-select__tick" />
              </div>
            </template>
          </SqVirtualScroll>
        </div>
      </transition>
    </SqPortal>
  </div>
</template>

<script lang="ts">
import { useUid } from '../composables/id'
import { computed, defineComponent, nextTick, ref, watch, type PropType } from 'vue'
import { getByPath } from '@squirkle-ui/core'
import SqField from './SqField.vue'
import SqIcon from './SqIcon.vue'
import SqChip from './SqChip.vue'
import SqPortal from './SqPortal.vue'
import SqShape from './SqShape.vue'
import SqVirtualScroll from './SqVirtualScroll.vue'
import SqProgressCircular from './SqProgressCircular.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { useValidation, validationProps } from '../composables/validation'
import { useActivatorOverlay } from '../composables/overlay'
import { fieldShellProps, pickShellProps } from '../composables/field'
import { config } from '../config'

export interface SelectItem { title: string; value: unknown; subtitle?: string; disabled?: boolean; raw: unknown }

/**
 * Select / autocomplete (`searchable`) / combobox (`combobox`, free text). The option list is always virtualized,
 * so 100k+ items stay smooth. `infinite` + `@load-more` supports server-side paging.
 */
export default defineComponent({
  name: 'SqSelect',
  components: { SqField, SqIcon, SqChip, SqPortal, SqShape, SqVirtualScroll, SqProgressCircular },
  model: vModel,
  props: {
    modelValue: { type: [String, Number, Boolean, Object, Array], default: undefined },
    items: { type: Array as PropType<unknown[]>, default: () => [] },
    itemTitle: { type: [String, Function] as PropType<string | ((i: unknown) => string)>, default: 'title' },
    itemValue: { type: [String, Function] as PropType<string | ((i: unknown) => unknown)>, default: 'value' },
    itemSubtitle: { type: String, default: 'subtitle' },
    multiple: Boolean,
    chips: Boolean,
    closableChips: Boolean,
    searchable: Boolean,
    combobox: Boolean,
    returnObject: Boolean,
    hideSelected: Boolean,
    /** Custom filter; return true to keep the item. */
    filter: { type: Function as PropType<(item: SelectItem, query: string) => boolean>, default: undefined },
    /** Skip client-side filtering (server-side search via `update:search`). */
    noFilter: Boolean,
    itemHeight: { type: Number, default: 40 },
    menuHeight: { type: Number, default: 320 },
    infinite: Boolean,
    hasMore: Boolean,
    ...fieldShellProps,
    ...validationProps,
  },
  emits: ['update:modelValue', 'update:search', 'update:menu', 'load-more'],
  setup(props, { emit }) {
    const model = useProxiedModel<unknown>(props, emit, 'modelValue', () => (props.multiple ? [] : undefined))
    const v = useValidation(props, model, () => (props.multiple ? [] : undefined))
    const autoId = useUid('sq-select')
    const id = computed(() => props.id ?? autoId)
    const root = ref<HTMLElement | null>(null)
    const input = ref<HTMLInputElement | null>(null)
    const list = ref<{ scrollToIndex: (i: number, a?: string) => void } | null>(null)
    const focused = ref(false)
    const search = ref('')
    const searching = ref(false)
    const highlight = ref(-1)

    const read = (item: unknown, key: string | ((i: unknown) => unknown)) =>
      typeof key === 'function' ? key(item) : item && typeof item === 'object' ? getByPath(item, key) : item
    const normalize = (item: unknown): SelectItem => ({
      title: String(read(item, props.itemTitle as string) ?? ''),
      value: props.returnObject ? item : read(item, props.itemValue as string),
      subtitle: item && typeof item === 'object' ? (getByPath(item, props.itemSubtitle) as string) : undefined,
      disabled: !!(item && typeof item === 'object' && (item as { disabled?: boolean }).disabled),
      raw: item,
    })
    const all = computed(() => props.items.map(normalize))
    const byValue = computed(() => {
      const m = new Map<unknown, SelectItem>()
      for (const it of all.value) m.set(it.value, it)
      return m
    })
    const selectedValues = computed<unknown[]>(() => (props.multiple ? ((model.value as unknown[]) ?? []) : model.value == null || model.value === '' ? [] : [model.value]))
    const selectedSet = computed(() => new Set(selectedValues.value))
    const selectedItems = computed(() => selectedValues.value.map((val) => byValue.value.get(val) ?? normalize(val)))
    const hasValue = computed(() => selectedValues.value.length > 0)
    const isSelected = (it: SelectItem) => selectedSet.value.has(it.value)

    const filtered = computed(() => {
      let out = all.value
      if (props.hideSelected) out = out.filter((i) => !isSelected(i))
      const q = searching.value ? search.value.trim().toLowerCase() : ''
      if (!q || props.noFilter) return out
      return out.filter((i) => (props.filter ? props.filter(i, q) : i.title.toLowerCase().includes(q)))
    })
    const listHeight = computed(() => Math.min(Math.max(filtered.value.length, 1) * props.itemHeight + 8, props.menuHeight))

    const overlay = useActivatorOverlay(
      {
        modelValue: undefined,
        location: 'bottom start',
        offset: 4,
        matchWidth: true,
        openOnClick: false,
        get disabled() { return v.isDisabled.value || v.isReadonly.value },
        get activator() { return root.value?.querySelector<HTMLElement>('.sq-field__control') ?? undefined },
      },
      (e: string, val: unknown) => e === 'update:modelValue' && emit('update:menu', val),
      root,
    )
    const menu = overlay.model

    const inputValue = computed(() => {
      if (searching.value) return search.value
      if (!props.multiple && (props.searchable || props.combobox) && selectedItems.value[0]) return selectedItems.value[0].title
      return ''
    })

    watch(search, (q) => emit('update:search', q))
    watch(menu, (open) => {
      if (!open) {
        searching.value = false
        search.value = ''
        highlight.value = -1
      } else {
        const idx = filtered.value.findIndex(isSelected)
        highlight.value = idx
        if (idx > 0) nextTick(() => list.value?.scrollToIndex(idx, 'center'))
      }
    })

    const select = (val: unknown) => {
      if (props.multiple) {
        const cur = selectedValues.value
        model.value = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]
      } else {
        model.value = val
        menu.value = false
      }
    }
    const toggleItem = (it: SelectItem) => {
      if (it.disabled) return
      select(it.value)
      if (props.multiple && searching.value) { search.value = ''; searching.value = false }
      input.value?.focus()
    }
    const clear = () => {
      model.value = props.multiple ? [] : undefined
      search.value = ''
      input.value?.focus()
    }
    const onControlClick = () => {
      if (v.isDisabled.value || v.isReadonly.value) return
      input.value?.focus()
      menu.value = props.searchable || props.combobox ? true : !menu.value
    }
    const onInput = (e: Event) => {
      search.value = (e.target as HTMLInputElement).value
      searching.value = true
      highlight.value = 0
      menu.value = true
    }
    const onFocus = () => (focused.value = true)
    const onBlurInput = () => {
      focused.value = false
      if (props.combobox && searching.value && search.value.trim() && !props.multiple) model.value = search.value.trim()
      v.onBlur()
    }
    const move = (d: number) => {
      const n = filtered.value.length
      if (!n) return
      highlight.value = (highlight.value + d + n) % n
      list.value?.scrollToIndex(highlight.value)
    }
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); menu.value ? move(1) : (menu.value = true) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
      else if (e.key === 'Enter') {
        e.preventDefault()
        if (!menu.value) return (menu.value = true)
        const it = filtered.value[highlight.value]
        if (it) toggleItem(it)
        else if (props.combobox && search.value.trim()) { select(search.value.trim()); search.value = '' }
      } else if (e.key === 'Escape') menu.value = false
      else if (e.key === 'Tab') menu.value = false
      else if (e.key === 'Backspace' && props.multiple && !search.value && selectedValues.value.length) model.value = selectedValues.value.slice(0, -1)
      else if (e.key === ' ' && !props.searchable && !props.combobox) { e.preventDefault(); menu.value = !menu.value }
    }

    return {
      ...v, ...overlay, menu, id, root, input, list, focused, search, searching, highlight, filtered, listHeight, selectedItems, hasValue, inputValue,
      isSelected, toggleItem, clear, onControlClick, onInput, onFocus, onBlurInput, onKeydown,
      fieldProps: computed(() => pickShellProps(props)),
      messages: computed(() => config.locale.messages),
    }
  },
})
</script>

<style>
.sq-select .sq-field__control { cursor: pointer; }
.sq-select__chevron { transition: transform var(--sq-duration) var(--sq-ease); }
.sq-select--open .sq-select__chevron { transform: rotate(180deg); }
.sq-select__input { flex: 1 1 60px !important; min-width: 40px !important; }
.sq-select__input--hidden { position: absolute; opacity: 0; width: 1px !important; min-width: 0 !important; pointer-events: none; }
.sq-select__selection { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
.sq-select__selection--single { order: -1; }
.sq-select__placeholder { color: var(--sq-muted); opacity: 0.8; }
.sq-select__menu { padding: 4px; }
.sq-select__menu .sq-virtual-scroll { contain: content; }
.sq-select__option { display: flex; align-items: center; gap: var(--sq-space-2); height: 100%; padding: 0 var(--sq-space-3); border-radius: var(--sq-radius-sm); cursor: pointer; font-size: var(--sq-text-md); }
.sq-select__option--highlight { background: color-mix(in srgb, var(--sq-on-surface) 6%, transparent); }
.sq-select__option--selected { color: var(--sq-primary); font-weight: var(--sq-weight-medium); }
.sq-select__option-title { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sq-select__option-subtitle { font-size: var(--sq-text-xs); color: var(--sq-muted); }
.sq-select__check { --sq-r: 5px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; flex: none; border: 1.5px solid var(--sq-border-strong); color: #fff; }
.sq-select__option--selected .sq-select__check { background: var(--sq-primary); border-color: var(--sq-primary); }
.sq-select__empty { display: flex; justify-content: center; padding: var(--sq-space-4); color: var(--sq-muted); font-size: var(--sq-text-sm); }
</style>
