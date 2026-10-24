<template>
  <div class="sq-btn-group sq-surface" :class="{ 'sq-btn-group--divided': divided }" :style="style" role="group">
    <SqShape />
    <slot />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SqShape from './SqShape.vue'
import { radiusValue, roundedProp } from '../composables/style'

/** Segmented container: children SqBtn are joined inside one squircle. */
export default defineComponent({
  name: 'SqBtnGroup',
  components: { SqShape },
  props: {
    rounded: { ...roundedProp, default: 'md' },
    divided: Boolean,
    color: { type: String, default: undefined },
  },
  setup(props) {
    const style = computed(() => ({ '--sq-r': radiusValue(props.rounded), '--sq-bg': 'var(--sq-surface-variant)', '--sq-group-color': props.color }))
    return { style }
  },
})
</script>

<style>
.sq-btn-group { display: inline-flex; align-items: center; padding: 3px; gap: 2px; }
.sq-btn-group > .sq-btn { --sq-r: calc(var(--sq-radius-md) - 3px); height: calc(var(--sq-control-md) - 6px); }
.sq-btn-group--divided > .sq-btn + .sq-btn::before { content: ''; position: absolute; left: -2px; top: 25%; bottom: 25%; width: 1px; background: var(--sq-border); }
</style>
