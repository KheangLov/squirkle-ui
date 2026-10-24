<template>
  <span class="sq-badge">
    <slot />
    <transition name="sq-scale">
      <span v-if="!hidden" class="sq-badge__badge" :class="{ 'sq-badge__badge--dot': dot, [`sq-badge__badge--${location.replace(' ', '-')}`]: true, 'sq-badge__badge--inline': inline }" :style="style" role="status">
        <template v-if="!dot"><SqIcon v-if="icon" :icon="icon" size="12px" /><span v-else>{{ display }}</span></template>
      </span>
    </transition>
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import SqIcon from './SqIcon.vue'
import { colorValue, onColorValue } from '../composables/style'

export default defineComponent({
  name: 'SqBadge',
  components: { SqIcon },
  props: {
    content: { type: [String, Number], default: undefined },
    max: { type: Number, default: undefined },
    color: { type: String, default: 'error' },
    dot: Boolean,
    icon: { type: String, default: undefined },
    hidden: Boolean,
    inline: Boolean,
    location: { type: String as PropType<'top end' | 'top start' | 'bottom end' | 'bottom start'>, default: 'top end' },
  },
  setup(props) {
    const display = computed(() => (props.max != null && Number(props.content) > props.max ? `${props.max}+` : props.content))
    const style = computed(() => ({ background: colorValue(props.color), color: onColorValue(props.color) }))
    return { display, style }
  },
})
</script>

<style>
.sq-badge { position: relative; display: inline-flex; vertical-align: middle; }
.sq-badge__badge { position: absolute; z-index: 1; display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--sq-radius-pill); font-size: var(--sq-text-2xs); font-weight: var(--sq-weight-bold); line-height: 1; box-shadow: 0 0 0 2px var(--sq-surface); white-space: nowrap; }
.sq-badge__badge--dot { min-width: 9px; width: 9px; height: 9px; padding: 0; }
.sq-badge__badge--top-end { top: 0; right: 0; transform: translate(45%, -45%); }
.sq-badge__badge--top-start { top: 0; left: 0; transform: translate(-45%, -45%); }
.sq-badge__badge--bottom-end { bottom: 0; right: 0; transform: translate(45%, 45%); }
.sq-badge__badge--bottom-start { bottom: 0; left: 0; transform: translate(-45%, 45%); }
.sq-badge__badge--inline { position: static; transform: none; margin-inline-start: var(--sq-space-1); }
</style>
