<template>
  <component
    :is="clickable ? 'button' : 'span'"
    :type="clickable ? 'button' : undefined"
    class="sq-chip sq-surface"
    :class="[`sq-chip--size-${size}`, { 'sq-interactive sq-focusable': clickable, 'sq-chip--selected': isSelected, 'sq-disabled': disabled }]"
    :style="style"
    :aria-pressed="groupItem ? String(isSelected) : undefined"
    @click="onClick"
  >
    <SqShape :watch-key="`${size}${variant}`" />
    <SqIcon v-if="isSelected && filter" icon="check" size="16px" />
    <SqIcon v-else-if="prependIcon" :icon="prependIcon" size="16px" />
    <SqAvatar v-if="avatar" :image="avatar" size="x-small" rounded="pill" class="sq-chip__avatar" />
    <span class="sq-chip__text"><slot>{{ text }}</slot></span>
    <SqIcon v-if="appendIcon" :icon="appendIcon" size="16px" />
    <span v-if="closable" class="sq-chip__close" role="button" :aria-label="closeLabel" tabindex="0" @click.stop="$emit('click:close', $event)" @keydown.enter.stop="$emit('click:close', $event)">
      <SqIcon icon="close" size="14px" />
    </span>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import SqShape from './SqShape.vue'
import SqIcon from './SqIcon.vue'
import SqAvatar from './SqAvatar.vue'
import { radiusValue, roundedProp, variantVars, type Variant } from '../composables/style'
import { useGroupItem, type GroupContext } from '../composables/group'
import { config } from '../config'

export default defineComponent({
  name: 'SqChip',
  components: { SqShape, SqIcon, SqAvatar },
  props: {
    text: { type: String, default: undefined },
    color: { type: String, default: undefined },
    variant: { type: String as () => Variant, default: 'tonal' },
    size: { type: String as () => 'x-small' | 'small' | 'default' | 'large', default: 'default' },
    rounded: { ...roundedProp, default: 'sm' },
    prependIcon: { type: String, default: undefined },
    appendIcon: { type: String, default: undefined },
    avatar: { type: String, default: undefined },
    closable: Boolean,
    /** Show a check mark when selected inside SqChipGroup. */
    filter: Boolean,
    link: Boolean,
    disabled: Boolean,
    value: { type: [String, Number, Boolean, Object], default: undefined },
  },
  emits: ['click', 'click:close'],
  setup(props, { emit }) {
    const groupItem = inject<GroupContext | null>('sq-chip-group', null) ? useGroupItem('sq-chip-group', () => props.value) : null
    const isSelected = computed(() => !!groupItem?.isSelected.value)
    const clickable = computed(() => props.link || !!groupItem)
    const style = computed(() => ({
      ...variantVars(isSelected.value && props.variant !== 'flat' ? 'flat' : props.variant, props.color ?? (isSelected.value ? 'primary' : undefined)),
      '--sq-r': radiusValue(props.rounded),
    }))
    const onClick = (e: MouseEvent) => {
      if (props.disabled) return
      groupItem?.toggle()
      emit('click', e)
    }
    return { style, isSelected, clickable, groupItem, onClick, closeLabel: computed(() => config.locale.messages.close) }
  },
})
</script>

<style>
.sq-chip { --sq-h: 30px; display: inline-flex; align-items: center; gap: 6px; height: var(--sq-h); padding: 0 12px; color: var(--sq-fg); font: inherit; font-size: var(--sq-text-sm); font-weight: var(--sq-weight-medium); white-space: nowrap; vertical-align: middle; max-width: 100%; }
.sq-chip--size-x-small { --sq-h: 20px; padding: 0 7px; font-size: var(--sq-text-2xs); --sq-r: var(--sq-radius-xs); }
.sq-chip--size-small { --sq-h: 24px; padding: 0 9px; font-size: var(--sq-text-xs); }
.sq-chip--size-large { --sq-h: 38px; padding: 0 16px; font-size: var(--sq-text-md); }
.sq-chip__text { overflow: hidden; text-overflow: ellipsis; }
.sq-chip__avatar { margin-inline-start: -6px; }
.sq-chip__close { display: inline-flex; margin-inline-end: -4px; border-radius: var(--sq-radius-pill); opacity: 0.7; cursor: pointer; }
.sq-chip__close:hover { opacity: 1; background: color-mix(in srgb, currentColor 14%, transparent); }
</style>
