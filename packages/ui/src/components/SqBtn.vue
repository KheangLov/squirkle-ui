<template>
  <component
    :is="tag"
    class="sq-btn sq-surface sq-interactive sq-focusable"
    :class="classes"
    :style="style"
    :href="href"
    :to="to"
    :type="tag === 'button' ? type : undefined"
    :disabled="tag === 'button' ? isDisabled : undefined"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :aria-pressed="toggleable ? String(isActive) : undefined"
    @click="onClick"
  >
    <SqShape :watch-key="`${rounded}${size}${variant}`" />
    <span class="sq-btn__content" :class="{ 'sq-btn__content--hidden': loading }">
      <SqIcon v-if="prependIcon" class="sq-btn__prepend" :icon="prependIcon" />
      <SqIcon v-if="iconName" :icon="iconName" />
      <slot v-else>{{ text }}</slot>
      <SqIcon v-if="appendIcon" class="sq-btn__append" :icon="appendIcon" />
    </span>
    <span v-if="loading" class="sq-btn__loader"><slot name="loader"><SqProgressCircular indeterminate color="currentColor" :size="18" :width="3" /></slot></span>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, inject, type PropType } from 'vue'
import SqShape from './SqShape.vue'
import SqIcon from './SqIcon.vue'
import SqProgressCircular from './SqProgressCircular.vue'
import { colorProp, elevationVars, radiusValue, roundedProp, sizeProp, variantProp, variantVars } from '../composables/style'
import { useGroupItem, type GroupContext } from '../composables/group'

export default defineComponent({
  name: 'SqBtn',
  components: { SqShape, SqIcon, SqProgressCircular },
  props: {
    text: { type: String, default: undefined },
    variant: variantProp('flat'),
    color: { ...colorProp, default: 'primary' },
    size: sizeProp,
    rounded: roundedProp,
    /** Icon-only button: pass an icon name (or `true` and use the default slot). */
    icon: { type: [String, Boolean], default: undefined },
    prependIcon: { type: String, default: undefined },
    appendIcon: { type: String, default: undefined },
    block: Boolean,
    loading: Boolean,
    disabled: Boolean,
    active: { type: Boolean, default: undefined },
    elevation: { type: [Number, String], default: undefined },
    href: { type: String, default: undefined },
    to: { type: [String, Object], default: undefined },
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
    /** Value inside SqBtnToggle / SqBtnGroup selection. */
    value: { type: [String, Number, Boolean, Object], default: undefined },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const groupItem = inject<GroupContext | null>('sq-btn-toggle', null) ? useGroupItem('sq-btn-toggle', () => props.value) : null
    const toggleable = !!groupItem
    const isActive = computed(() => props.active ?? groupItem?.isSelected.value ?? false)
    const isDisabled = computed(() => props.disabled || !!groupItem?.group?.disabled.value)
    const tag = computed(() => (props.to ? 'router-link' : props.href ? 'a' : 'button'))
    const iconName = computed(() => (typeof props.icon === 'string' ? props.icon : undefined))
    const style = computed(() => ({
      ...variantVars(props.variant, props.color),
      '--sq-r': radiusValue(props.rounded),
      ...elevationVars(props.elevation ?? (props.variant === 'elevated' ? 2 : undefined)),
    }))
    const classes = computed(() => [
      `sq-btn--${props.variant}`,
      `sq-btn--size-${props.size}`,
      {
        'sq-btn--icon': props.icon !== undefined && props.icon !== false,
        'sq-btn--block': props.block,
        'sq-btn--loading': props.loading,
        'sq-btn--active': isActive.value,
        'sq-disabled': isDisabled.value,
      },
    ])
    const onClick = (e: MouseEvent) => {
      if (isDisabled.value || props.loading) return
      groupItem?.toggle()
      emit('click', e)
    }
    return { tag, style, classes, iconName, isActive, isDisabled, toggleable, onClick }
  },
})
</script>

<style>
.sq-btn {
  --sq-h: var(--sq-control-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--sq-h);
  min-width: var(--sq-h);
  padding: 0 calc(var(--sq-h) * 0.42);
  color: var(--sq-fg);
  font: inherit;
  font-size: var(--sq-text-md);
  font-weight: var(--sq-weight-semibold);
  letter-spacing: 0.005em;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  vertical-align: middle;
  outline: none;
  flex: none;
  transition: transform var(--sq-duration-fast) var(--sq-ease), background-color var(--sq-duration) var(--sq-ease);
}
.sq-btn:active { transform: scale(0.97); }
.sq-btn--size-x-small { --sq-h: var(--sq-control-xs); font-size: var(--sq-text-xs); --sq-r: var(--sq-radius-xs); }
.sq-btn--size-small { --sq-h: var(--sq-control-sm); font-size: var(--sq-text-sm); }
.sq-btn--size-large { --sq-h: var(--sq-control-lg); font-size: var(--sq-text-lg); }
.sq-btn--size-x-large { --sq-h: var(--sq-control-xl); font-size: var(--sq-text-xl); }
.sq-btn--icon { padding: 0; width: var(--sq-h); }
.sq-btn--block { display: flex; width: 100%; }
.sq-btn--text, .sq-btn--plain { --sq-bw: 0px; }
.sq-btn--plain:hover { --sq-state: 0%; opacity: 0.8; }
.sq-btn--active.sq-btn--text, .sq-btn--active.sq-btn--outlined, .sq-btn--active.sq-btn--plain { --sq-state: var(--sq-selected-opacity); }
.sq-btn--active.sq-btn--tonal { --sq-bg: color-mix(in srgb, var(--sq-c) 26%, transparent); }
.sq-btn__content { display: inline-flex; align-items: center; justify-content: center; gap: var(--sq-space-2); min-width: 0; }
.sq-btn__content--hidden { visibility: hidden; }
.sq-btn__prepend { margin-inline-start: calc(var(--sq-space-1) * -1); }
.sq-btn__append { margin-inline-end: calc(var(--sq-space-1) * -1); }
.sq-btn__loader { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
</style>
