<template>
  <div class="sq-field" :class="classes" :style="style">
    <label v-if="label" class="sq-field__label" :for="id">{{ label }}<span v-if="required" class="sq-field__required" aria-hidden="true"> *</span></label>
    <div class="sq-field__row">
      <SqIcon v-if="prependIcon" :icon="prependIcon" class="sq-field__outer-icon" />
      <div class="sq-field__control sq-surface" @click="$emit('click:control', $event)">
        <SqShape :watch-key="`${variant}${density}`" />
        <span v-if="prependInnerIcon || has('prepend-inner')" class="sq-field__inner-icon"><slot name="prepend-inner"><SqIcon :icon="prependInnerIcon" /></slot></span>
        <span v-if="prefix" class="sq-field__affix">{{ prefix }}</span>
        <div class="sq-field__input"><slot /></div>
        <span v-if="suffix" class="sq-field__affix">{{ suffix }}</span>
        <SqProgressCircular v-if="loading" indeterminate :size="16" :width="2" class="sq-field__loader" />
        <button v-if="clearable && dirty && !disabled && !readonly" type="button" class="sq-field__clear" :aria-label="clearLabel" tabindex="-1" @click.stop="$emit('click:clear', $event)"><SqIcon icon="close" size="16px" /></button>
        <span v-if="appendInnerIcon || has('append-inner')" class="sq-field__inner-icon"><slot name="append-inner"><SqIcon :icon="appendInnerIcon" :clickable="appendInnerClickable" @click.stop="$emit('click:append-inner', $event)" /></slot></span>
      </div>
      <SqIcon v-if="appendIcon" :icon="appendIcon" class="sq-field__outer-icon" />
    </div>
    <div v-if="!hideDetails && (messages.length || hint || counter != null)" class="sq-field__details" :id="`${id}-messages`">
      <transition name="sq-fade" mode="out-in">
        <span :key="messages.length ? messages[0] : 'hint'" class="sq-field__message" :role="error ? 'alert' : undefined">{{ messages.length ? messages[0] : persistentHint || focused ? hint : '' }}</span>
      </transition>
      <span v-if="counter != null" class="sq-field__counter">{{ counter }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import SqShape from './SqShape.vue'
import SqIcon from './SqIcon.vue'
import SqProgressCircular from './SqProgressCircular.vue'
import { colorValue, radiusValue, roundedProp } from '../composables/style'
import { config } from '../config'
import type { FieldVariant } from '../composables/field'

/** Shared input shell (label, icons, clear button, messages) for every text-like control. */
export default defineComponent({
  name: 'SqField',
  components: { SqShape, SqIcon, SqProgressCircular },
  props: {
    id: { type: String, default: undefined },
    label: { type: String, default: undefined },
    hint: { type: String, default: undefined },
    persistentHint: Boolean,
    messages: { type: Array as PropType<string[]>, default: () => [] },
    error: Boolean,
    variant: { type: String as PropType<FieldVariant>, default: 'outlined' },
    density: { type: String as PropType<'default' | 'comfortable' | 'compact'>, default: 'default' },
    color: { type: String, default: 'primary' },
    rounded: roundedProp,
    prependIcon: { type: String, default: undefined },
    appendIcon: { type: String, default: undefined },
    prependInnerIcon: { type: String, default: undefined },
    appendInnerIcon: { type: String, default: undefined },
    appendInnerClickable: Boolean,
    prefix: { type: String, default: undefined },
    suffix: { type: String, default: undefined },
    clearable: Boolean,
    dirty: Boolean,
    focused: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    required: Boolean,
    hideDetails: Boolean,
    counter: { type: [String, Number], default: undefined },
    multiline: Boolean,
  },
  emits: ['click:control', 'click:clear', 'click:append-inner'],
  setup(props, { slots }) {
    const classes = computed(() => [
      `sq-field--${props.variant}`,
      `sq-field--density-${props.density}`,
      { 'sq-field--focused': props.focused, 'sq-field--error': props.error, 'sq-field--disabled': props.disabled, 'sq-field--readonly': props.readonly, 'sq-field--multiline': props.multiline },
    ])
    const style = computed(() => ({ '--sq-field-color': colorValue(props.color), '--sq-r': radiusValue(props.rounded, props.variant === 'solo' ? 'lg' : 'md') }))
    return { classes, style, has: (n: string) => !!slots[n], clearLabel: computed(() => config.locale.messages.clear) }
  },
})
</script>

<style>
.sq-field { --sq-field-h: var(--sq-control-md); display: flex; flex-direction: column; gap: 6px; min-width: 0; width: 100%; }
.sq-field--density-comfortable { --sq-field-h: 42px; }
.sq-field--density-compact { --sq-field-h: var(--sq-control-sm); }
.sq-field--density-default { --sq-field-h: 44px; }
.sq-field__label { font-size: var(--sq-text-sm); font-weight: var(--sq-weight-medium); color: var(--sq-on-surface-variant); }
.sq-field__required { color: var(--sq-error); }
.sq-field__row { display: flex; align-items: center; gap: var(--sq-space-2); }
.sq-field__outer-icon { color: var(--sq-muted); }
.sq-field__control {
  --sq-bg: var(--sq-surface); --sq-bd: var(--sq-border-strong); --sq-bw: 1px;
  flex: 1; min-width: 0; display: flex; align-items: center; gap: var(--sq-space-2);
  min-height: var(--sq-field-h); padding: 0 var(--sq-space-3); cursor: text; color: var(--sq-on-surface);
  transition: box-shadow var(--sq-duration) var(--sq-ease), background-color var(--sq-duration) var(--sq-ease);
}
.sq-field--multiline .sq-field__control { align-items: flex-start; padding-block: 10px; }
.sq-field__control:hover { --sq-bd: color-mix(in srgb, var(--sq-on-surface) 45%, transparent); }
.sq-field--focused .sq-field__control { --sq-bd: var(--sq-field-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--sq-field-color) 22%, transparent); }
.sq-field--focused .sq-field__control[data-sq-shape] { box-shadow: none !important; --sq-shadow-filter: drop-shadow(0 0 3px color-mix(in srgb, var(--sq-field-color) 45%, transparent)); }
.sq-field--error .sq-field__control { --sq-bd: var(--sq-error); --sq-field-color: var(--sq-error); }
.sq-field--filled .sq-field__control { --sq-bg: var(--sq-surface-variant); --sq-bd: transparent; }
.sq-field--filled.sq-field--focused .sq-field__control { --sq-bg: var(--sq-surface); --sq-bd: var(--sq-field-color); }
.sq-field--solo .sq-field__control { --sq-bd: transparent; --sq-bg: var(--sq-surface-raised); --sq-shadow: var(--sq-elevation-2); --sq-shadow-filter: var(--sq-elevation-2-filter); }
.sq-field--underlined .sq-field__control, .sq-field--plain .sq-field__control { --sq-r: 0px; --sq-bw: 0px; padding: 0; background: transparent; box-shadow: none !important; }
.sq-field--underlined .sq-field__control { border-bottom: 1px solid var(--sq-border-strong); }
.sq-field--underlined.sq-field--focused .sq-field__control { border-bottom: 2px solid var(--sq-field-color); }
.sq-field--disabled { opacity: var(--sq-disabled-opacity); pointer-events: none; }
.sq-field--readonly .sq-field__control { --sq-bg: var(--sq-surface-variant); }
.sq-field__input { flex: 1; min-width: 0; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; align-self: stretch; }
.sq-field__input input, .sq-field__input textarea, .sq-field__input select {
  flex: 1; min-width: 0; width: 100%; height: 100%; min-height: calc(var(--sq-field-h) - 2px); padding: 0; border: 0; outline: none; background: transparent;
  color: inherit; font: inherit; font-size: var(--sq-text-md);
}
.sq-field__input textarea { resize: vertical; min-height: 64px; line-height: var(--sq-leading); padding: 0; }
.sq-field__input input::placeholder, .sq-field__input textarea::placeholder { color: var(--sq-muted); opacity: 0.8; }
.sq-field__inner-icon { display: flex; color: var(--sq-muted); }
.sq-field--focused .sq-field__inner-icon { color: var(--sq-field-color); }
.sq-field__affix { color: var(--sq-muted); white-space: nowrap; }
.sq-field__clear { display: flex; padding: 2px; border: 0; background: color-mix(in srgb, var(--sq-on-surface) 8%, transparent); color: var(--sq-muted); border-radius: var(--sq-radius-pill); cursor: pointer; }
.sq-field__clear:hover { color: var(--sq-on-surface); }
.sq-field__details { display: flex; justify-content: space-between; gap: var(--sq-space-2); min-height: 16px; padding: 0 var(--sq-space-1); font-size: var(--sq-text-xs); color: var(--sq-muted); }
.sq-field--error .sq-field__message { color: var(--sq-error); }
.sq-field__counter { margin-inline-start: auto; font-variant-numeric: tabular-nums; }
</style>
