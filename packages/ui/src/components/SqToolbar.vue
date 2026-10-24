<template>
  <div class="sq-toolbar sq-surface" :class="{ 'sq-toolbar--dense': dense, 'sq-toolbar--floating': floating }" :style="style">
    <SqShape v-if="floating" />
    <div v-if="title" class="sq-toolbar__title">{{ title }}</div>
    <slot />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SqShape from './SqShape.vue'
import { colorValue, onColorValue } from '../composables/style'

export default defineComponent({
  name: 'SqToolbar',
  components: { SqShape },
  props: {
    title: { type: String, default: undefined },
    color: { type: String, default: undefined },
    dense: Boolean,
    floating: Boolean,
  },
  setup(props) {
    const style = computed(() => ({
      '--sq-bg': colorValue(props.color) ?? 'var(--sq-surface-variant)',
      color: props.color ? onColorValue(props.color) : 'var(--sq-on-surface)',
    }))
    return { style }
  },
})
</script>

<style>
.sq-toolbar { --sq-r: 0px; display: flex; align-items: center; gap: var(--sq-space-2); height: 56px; padding: 0 var(--sq-space-3); }
.sq-toolbar--dense { height: 44px; }
.sq-toolbar--floating { --sq-r: var(--sq-radius-lg); display: inline-flex; --sq-shadow: var(--sq-elevation-2); --sq-shadow-filter: var(--sq-elevation-2-filter); }
.sq-toolbar__title { font-size: var(--sq-text-lg); font-weight: var(--sq-weight-semibold); margin-inline-end: var(--sq-space-2); }
</style>
