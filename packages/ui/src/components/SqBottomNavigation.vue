<template>
  <nav class="sq-bottom-navigation sq-surface" :class="{ 'sq-bottom-navigation--floating': floating }" :style="{ '--sq-bn-color': colorValue(color) }">
    <SqShape v-if="floating" />
    <button
      v-for="(item, i) in items"
      :key="item.value ?? i"
      type="button"
      class="sq-bottom-navigation__item sq-focusable"
      :class="{ 'sq-bottom-navigation__item--active': (item.value ?? i) === model }"
      :aria-current="(item.value ?? i) === model ? 'page' : undefined"
      @click="model = item.value ?? i"
    >
      <span class="sq-bottom-navigation__icon sq-squircle"><SqIcon :icon="item.icon" /></span>
      <span class="sq-bottom-navigation__label">{{ item.title }}</span>
    </button>
  </nav>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SqShape from './SqShape.vue'
import SqIcon from './SqIcon.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { colorValue } from '../composables/style'

export interface BottomNavItem { title: string; icon: string; value?: string | number }

export default defineComponent({
  name: 'SqBottomNavigation',
  components: { SqShape, SqIcon },
  model: vModel,
  props: {
    modelValue: { type: [String, Number], default: undefined },
    items: { type: Array as PropType<BottomNavItem[]>, default: () => [] },
    color: { type: String, default: 'primary' },
    floating: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return { model: useProxiedModel(props, emit, 'modelValue', () => 0 as string | number), colorValue }
  },
})
</script>

<style>
.sq-bottom-navigation { --sq-bg: var(--sq-surface); --sq-r: 0px; display: flex; justify-content: space-around; padding: var(--sq-space-1) var(--sq-space-2) calc(var(--sq-space-1) + env(safe-area-inset-bottom)); border-top: 1px solid var(--sq-border); }
.sq-bottom-navigation--floating { --sq-r: var(--sq-radius-2xl); --sq-shadow: var(--sq-elevation-3); --sq-shadow-filter: var(--sq-elevation-3-filter); border-top: 0; margin: var(--sq-space-3); }
.sq-bottom-navigation__item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: var(--sq-space-1); background: none; border: 0; color: var(--sq-muted); font: inherit; font-size: var(--sq-text-2xs); font-weight: var(--sq-weight-medium); cursor: pointer; border-radius: var(--sq-radius-md); }
.sq-bottom-navigation__icon { --sq-r: var(--sq-radius-pill); display: flex; align-items: center; justify-content: center; width: 56px; height: 30px; transition: background var(--sq-duration) var(--sq-ease); }
.sq-bottom-navigation__item--active { color: var(--sq-bn-color); }
.sq-bottom-navigation__item--active .sq-bottom-navigation__icon { background: color-mix(in srgb, var(--sq-bn-color) 16%, transparent); }
</style>
