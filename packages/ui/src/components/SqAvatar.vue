<template>
  <div class="sq-avatar sq-surface" :class="`sq-avatar--${variant}`" :style="style">
    <SqShape :watch-key="`${size}${rounded}`" />
    <img v-if="image" :src="image" :alt="alt" class="sq-avatar__img" />
    <SqIcon v-else-if="icon" :icon="icon" />
    <slot v-else>{{ initials }}</slot>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { toUnit } from '@squirkle-ui/core'
import SqShape from './SqShape.vue'
import SqIcon from './SqIcon.vue'
import { radiusValue, roundedProp, variantVars, type Variant } from '../composables/style'

const SIZES: Record<string, number> = { 'x-small': 24, small: 32, default: 40, large: 56, 'x-large': 72 }

export default defineComponent({
  name: 'SqAvatar',
  components: { SqShape, SqIcon },
  props: {
    image: { type: String, default: undefined },
    alt: { type: String, default: '' },
    icon: { type: String, default: undefined },
    /** Name used to derive initials when no image/icon. */
    name: { type: String, default: undefined },
    size: { type: [String, Number], default: 'default' },
    color: { type: String, default: 'primary' },
    variant: { type: String as () => Variant, default: 'tonal' },
    rounded: { ...roundedProp, default: 'lg' },
  },
  setup(props) {
    const px = computed(() => (typeof props.size === 'number' ? props.size : SIZES[props.size] ?? Number(props.size)))
    const initials = computed(() => (props.name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join(''))
    const style = computed(() => ({
      ...variantVars(props.variant, props.color),
      '--sq-r': props.rounded === 'pill' ? 'var(--sq-radius-pill)' : `calc(${radiusValue(props.rounded)} * ${Math.max(0.6, px.value / 48)})`,
      width: toUnit(px.value),
      height: toUnit(px.value),
      fontSize: `${Math.round(px.value * 0.38)}px`,
    }))
    return { style, initials }
  },
})
</script>

<style>
.sq-avatar { display: inline-flex; align-items: center; justify-content: center; flex: none; color: var(--sq-fg); font-weight: var(--sq-weight-semibold); overflow: hidden; vertical-align: middle; }
.sq-avatar__img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
@supports not (corner-shape: squircle) {
  .sq-avatar[data-sq-shape] .sq-avatar__img { border-radius: calc(var(--sq-r) * 1.15); }
}
</style>
