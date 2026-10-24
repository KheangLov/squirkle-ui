<template>
  <component
    :is="tag"
    class="sq-card sq-surface"
    :class="{ 'sq-card--hover': hover || !!href || !!to || link, 'sq-interactive': hover || !!href || !!to || link, 'sq-card--flat': variant === 'flat', 'sq-disabled': disabled }"
    :style="style"
    :href="href"
    :to="to"
    :tabindex="link ? 0 : undefined"
    @click="$emit('click', $event)"
  >
    <SqShape :watch-key="`${rounded}${variant}`" />
    <div v-if="loading" class="sq-card__loader"><SqProgressLinear indeterminate :height="3" /></div>
    <div v-if="image" class="sq-card__image" :style="{ backgroundImage: `url(${image})` }"></div>
    <div v-if="title || subtitle || has('title') || prependIcon || has('prepend') || has('append')" class="sq-card__header">
      <div v-if="prependIcon || has('prepend')" class="sq-card__prepend"><slot name="prepend"><SqIcon :icon="prependIcon" size="large" /></slot></div>
      <div class="sq-card__heading">
        <div v-if="title || has('title')" class="sq-card-title"><slot name="title">{{ title }}</slot></div>
        <div v-if="subtitle || has('subtitle')" class="sq-card-subtitle"><slot name="subtitle">{{ subtitle }}</slot></div>
      </div>
      <div v-if="has('append')" class="sq-card__append"><slot name="append" /></div>
    </div>
    <div v-if="text" class="sq-card-text">{{ text }}</div>
    <slot />
    <div v-if="has('actions')" class="sq-card-actions"><slot name="actions" /></div>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import SqShape from './SqShape.vue'
import SqIcon from './SqIcon.vue'
import SqProgressLinear from './SqProgressLinear.vue'
import { colorValue, elevationVars, radiusValue, roundedProp } from '../composables/style'

export default defineComponent({
  name: 'SqCard',
  components: { SqShape, SqIcon, SqProgressLinear },
  props: {
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined },
    text: { type: String, default: undefined },
    image: { type: String, default: undefined },
    prependIcon: { type: String, default: undefined },
    variant: { type: String as PropType<'elevated' | 'outlined' | 'flat' | 'tonal'>, default: 'elevated' },
    color: { type: String, default: undefined },
    elevation: { type: [Number, String], default: undefined },
    rounded: { ...roundedProp, default: 'lg' },
    hover: Boolean,
    link: Boolean,
    loading: Boolean,
    disabled: Boolean,
    href: { type: String, default: undefined },
    to: { type: [String, Object], default: undefined },
  },
  emits: ['click'],
  setup(props, { slots }) {
    const tag = computed(() => (props.to ? 'router-link' : props.href ? 'a' : 'div'))
    const style = computed(() => {
      const c = colorValue(props.color)
      const base: Record<string, string | undefined> = { '--sq-r': radiusValue(props.rounded) }
      if (props.variant === 'outlined') Object.assign(base, { '--sq-bg': c ? `color-mix(in srgb, ${c} 6%, var(--sq-surface))` : 'var(--sq-surface)', '--sq-bd': c ?? 'var(--sq-border)', '--sq-bw': '1px' })
      else if (props.variant === 'tonal') Object.assign(base, { '--sq-bg': `color-mix(in srgb, ${c ?? 'var(--sq-primary)'} 12%, var(--sq-surface))` })
      else if (props.variant === 'flat') Object.assign(base, { '--sq-bg': c ?? 'var(--sq-surface)' })
      else Object.assign(base, { '--sq-bg': c ?? 'var(--sq-surface-raised)', '--sq-bd': 'var(--sq-border)', '--sq-bw': '1px', ...elevationVars(props.elevation ?? 1) })
      if (props.elevation != null && props.variant !== 'elevated') Object.assign(base, elevationVars(props.elevation))
      return base
    })
    return { tag, style, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-card { --sq-fg: var(--sq-on-surface); display: flex; flex-direction: column; color: var(--sq-on-surface); text-decoration: none; overflow: visible; }
.sq-card--hover { transition: transform var(--sq-duration) var(--sq-ease-spring); }
.sq-card--hover:hover { transform: translateY(-2px); --sq-state: 3%; }
.sq-card__image { aspect-ratio: 16 / 9; background-size: cover; background-position: center; border-radius: inherit; border-end-start-radius: 0; border-end-end-radius: 0; margin: calc(var(--sq-bw, 0px) * -1) calc(var(--sq-bw, 0px) * -1) 0; }
.sq-card__loader { position: absolute; top: 0; left: var(--sq-space-4); right: var(--sq-space-4); }
.sq-card__header { display: flex; align-items: center; gap: var(--sq-space-3); padding: var(--sq-space-4) var(--sq-space-5) var(--sq-space-2); }
.sq-card__heading { flex: 1; min-width: 0; }
.sq-card__prepend { color: var(--sq-primary); display: flex; }
.sq-card-title { font-size: var(--sq-text-lg); font-weight: var(--sq-weight-semibold); line-height: 1.35; letter-spacing: -0.01em; }
.sq-card-subtitle { font-size: var(--sq-text-sm); color: var(--sq-muted); margin-top: 2px; }
.sq-card-text { padding: var(--sq-space-2) var(--sq-space-5) var(--sq-space-4); color: var(--sq-on-surface-variant); font-size: var(--sq-text-md); }
.sq-card-actions { display: flex; align-items: center; gap: var(--sq-space-2); padding: var(--sq-space-2) var(--sq-space-4) var(--sq-space-4); margin-top: auto; }
</style>
