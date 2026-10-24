<template>
  <component :is="tag" class="sq-sheet sq-surface" :style="style">
    <SqShape :watch-key="rounded" />
    <slot />
  </component>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { toUnit } from '@squirkle-ui/core'
import SqShape from './SqShape.vue'
import { colorValue, elevationVars, onColorValue, radiusValue, roundedProp } from '../composables/style'

/** Generic squircle surface. */
export default defineComponent({
  name: 'SqSheet',
  components: { SqShape },
  props: {
    tag: { type: String, default: 'div' },
    color: { type: String, default: undefined },
    border: Boolean,
    elevation: { type: [Number, String], default: undefined },
    rounded: { ...roundedProp, default: 'lg' },
    width: { type: [Number, String], default: undefined },
    height: { type: [Number, String], default: undefined },
  },
  setup(props) {
    const style = computed(() => ({
      '--sq-bg': colorValue(props.color) ?? 'var(--sq-surface)',
      '--sq-r': radiusValue(props.rounded),
      '--sq-bw': props.border ? '1px' : undefined,
      '--sq-bd': props.border ? 'var(--sq-border)' : undefined,
      color: props.color ? onColorValue(props.color) : 'var(--sq-on-surface)',
      width: toUnit(props.width),
      height: toUnit(props.height),
      ...elevationVars(props.elevation),
    }))
    return { style }
  },
})
</script>
