<template>
  <div class="sq-expansion-panel" :class="{ 'sq-expansion-panel--open': isSelected, 'sq-surface': separate, 'sq-disabled': disabled }" :style="separate ? surfaceStyle : undefined">
    <SqShape v-if="separate" :watch-key="isSelected" />
    <button type="button" class="sq-expansion-panel__header sq-focusable" :aria-expanded="isSelected ? 'true' : 'false'" @click="toggle">
      <SqIcon v-if="icon" :icon="icon" class="sq-expansion-panel__icon" />
      <span class="sq-expansion-panel__title"><slot name="title">{{ title }}</slot></span>
      <SqIcon icon="chevronDown" class="sq-expansion-panel__chevron" />
    </button>
    <SqExpandTransition>
      <div v-show="isSelected" class="sq-expansion-panel__content"><div class="sq-expansion-panel__inner"><slot>{{ text }}</slot></div></div>
    </SqExpandTransition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import SqIcon from './SqIcon.vue'
import SqShape from './SqShape.vue'
import SqExpandTransition from './SqExpandTransition.vue'
import { useGroupItem, type GroupContext } from '../composables/group'

export default defineComponent({
  name: 'SqExpansionPanel',
  components: { SqIcon, SqShape, SqExpandTransition },
  props: {
    title: { type: String, default: undefined },
    text: { type: String, default: undefined },
    icon: { type: String, default: undefined },
    value: { type: [String, Number], default: undefined },
    disabled: Boolean,
  },
  setup(props) {
    const parent = inject<GroupContext | null>('sq-expansion', null)
    const item = useGroupItem('sq-expansion', () => props.value)
    const separate = computed(() => parent?.props.variant === 'separated' || parent?.props.variant === 'inset')
    const toggle = () => !props.disabled && item.toggle()
    const surfaceStyle = { '--sq-r': 'var(--sq-radius-lg)', '--sq-bg': 'var(--sq-surface)', '--sq-bd': 'var(--sq-border)', '--sq-bw': '1px' }
    return { isSelected: item.isSelected, toggle, separate, surfaceStyle }
  },
})
</script>

<style>
.sq-expansion-panel { transition: margin var(--sq-duration) var(--sq-ease); }
.sq-expansion-panel__header { display: flex; align-items: center; gap: var(--sq-space-3); width: 100%; min-height: 54px; padding: var(--sq-space-3) var(--sq-space-5); border: 0; background: none; color: inherit; font: inherit; font-weight: var(--sq-weight-semibold); text-align: start; cursor: pointer; border-radius: inherit; }
.sq-expansion-panel__header:hover { background: color-mix(in srgb, var(--sq-on-surface) 4%, transparent); }
.sq-expansion-panel__title { flex: 1; }
.sq-expansion-panel__icon { color: var(--sq-primary); }
.sq-expansion-panel__chevron { color: var(--sq-muted); transition: transform var(--sq-duration) var(--sq-ease); }
.sq-expansion-panel--open .sq-expansion-panel__chevron { transform: rotate(180deg); }
.sq-expansion-panel__inner { padding: 0 var(--sq-space-5) var(--sq-space-4); color: var(--sq-on-surface-variant); }
</style>
