<template>
  <component
    :is="tag"
    class="sq-list-item sq-squircle"
    :class="{ 'sq-list-item--link sq-focusable': isLink, 'sq-list-item--active': isActive, 'sq-disabled': disabled, 'sq-list-item--two-line': !!subtitle }"
    :style="{ '--sq-c': colorValue(color) }"
    :href="href"
    :to="to"
    :type="tag === 'button' ? 'button' : undefined"
    :role="selectable ? 'option' : undefined"
    :aria-selected="selectable ? String(isActive) : undefined"
    @click="onClick"
  >
    <span v-if="prependAvatar || prependIcon || has('prepend')" class="sq-list-item__prepend">
      <slot name="prepend">
        <SqAvatar v-if="prependAvatar" :image="prependAvatar" size="small" />
        <SqIcon v-else :icon="prependIcon" />
      </slot>
    </span>
    <span class="sq-list-item__content">
      <span v-if="title || has('title')" class="sq-list-item__title"><slot name="title">{{ title }}</slot></span>
      <span v-if="subtitle" class="sq-list-item__subtitle">{{ subtitle }}</span>
      <slot />
    </span>
    <span v-if="appendIcon || has('append')" class="sq-list-item__append"><slot name="append"><SqIcon :icon="appendIcon" /></slot></span>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import SqIcon from './SqIcon.vue'
import SqAvatar from './SqAvatar.vue'
import { colorValue } from '../composables/style'
import type { GroupContext } from '../composables/group'

export default defineComponent({
  name: 'SqListItem',
  components: { SqIcon, SqAvatar },
  props: {
    title: { type: [String, Number], default: undefined },
    subtitle: { type: String, default: undefined },
    prependIcon: { type: String, default: undefined },
    prependAvatar: { type: String, default: undefined },
    appendIcon: { type: String, default: undefined },
    value: { type: [String, Number, Boolean, Object], default: undefined },
    active: { type: Boolean, default: undefined },
    color: { type: String, default: 'primary' },
    link: Boolean,
    disabled: Boolean,
    href: { type: String, default: undefined },
    to: { type: [String, Object], default: undefined },
  },
  emits: ['click'],
  setup(props, { emit, slots }) {
    const group = inject<GroupContext | null>('sq-list', null)
    const selectable = computed(() => !!group?.props.selectable && props.value !== undefined)
    const isActive = computed(() => props.active ?? (selectable.value ? group!.isSelected(props.value) : false))
    const isLink = computed(() => props.link || !!props.href || !!props.to || selectable.value)
    const tag = computed(() => (props.to ? 'router-link' : props.href ? 'a' : isLink.value ? 'button' : 'div'))
    const onClick = (e: MouseEvent) => {
      if (props.disabled) return
      if (selectable.value) group!.toggle(props.value)
      emit('click', e)
    }
    return { tag, isActive, isLink, selectable, onClick, colorValue, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-list-item {
  --sq-r: var(--sq-radius-md);
  display: flex; align-items: center; gap: var(--sq-space-3); width: 100%; min-height: 44px;
  padding: var(--sq-space-2) var(--sq-space-4); border: 0; background: transparent; color: inherit;
  font: inherit; text-align: start; text-decoration: none;
}
.sq-list--nav .sq-list-item { padding: var(--sq-space-2) var(--sq-space-3); }
.sq-list--dense .sq-list-item { min-height: 34px; padding-block: 4px; }
.sq-list-item--two-line { min-height: 60px; }
.sq-list-item--link { cursor: pointer; transition: background var(--sq-duration-fast) var(--sq-ease); }
.sq-list-item--link:hover { background: color-mix(in srgb, var(--sq-on-surface) 6%, transparent); }
.sq-list-item--active { background: color-mix(in srgb, var(--sq-c) 12%, transparent) !important; color: var(--sq-c); }
.sq-list-item--active .sq-list-item__title { font-weight: var(--sq-weight-semibold); }
.sq-list-item__prepend, .sq-list-item__append { display: flex; align-items: center; flex: none; color: var(--sq-on-surface-variant); }
.sq-list-item--active .sq-list-item__prepend { color: inherit; }
.sq-list-item__append { margin-inline-start: auto; }
.sq-list-item__content { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.sq-list-item__title { font-size: var(--sq-text-md); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sq-list-item__subtitle { font-size: var(--sq-text-xs); color: var(--sq-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
