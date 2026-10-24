<template>
  <transition name="sq-fade">
    <div v-if="model" class="sq-alert sq-surface" :class="[`sq-alert--${variant}`, { 'sq-alert--prominent': prominent }]" :style="style" role="alert">
      <SqShape :watch-key="variant" />
      <div v-if="iconName !== false" class="sq-alert__icon"><SqIcon :icon="iconName" :size="prominent ? 'x-large' : 'large'" /></div>
      <div class="sq-alert__body">
        <div v-if="title || has('title')" class="sq-alert__title"><slot name="title">{{ title }}</slot></div>
        <div class="sq-alert__text"><slot>{{ text }}</slot></div>
      </div>
      <div v-if="has('append')" class="sq-alert__append"><slot name="append" /></div>
      <SqBtn v-if="closable" icon="close" variant="text" size="small" color="currentColor" :aria-label="closeLabel" @click="model = false" />
    </div>
  </transition>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import SqShape from './SqShape.vue'
import SqIcon from './SqIcon.vue'
import SqBtn from './SqBtn.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { variantVars, type Variant } from '../composables/style'
import { config } from '../config'

export default defineComponent({
  name: 'SqAlert',
  components: { SqShape, SqIcon, SqBtn },
  model: vModel,
  props: {
    modelValue: { type: Boolean, default: true },
    type: { type: String as PropType<'info' | 'success' | 'warning' | 'error'>, default: undefined },
    title: { type: String, default: undefined },
    text: { type: String, default: undefined },
    color: { type: String, default: undefined },
    variant: { type: String as PropType<Variant>, default: 'tonal' },
    icon: { type: [String, Boolean], default: undefined },
    closable: Boolean,
    prominent: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const model = useProxiedModel<boolean>(props, emit)
    const iconName = computed(() => (props.icon === false ? false : typeof props.icon === 'string' ? props.icon : props.type ?? 'info'))
    const style = computed(() => ({ ...variantVars(props.variant, props.color ?? props.type ?? 'info'), '--sq-r': 'var(--sq-radius-lg)' }))
    return { model, iconName, style, has: (n: string) => !!slots[n], closeLabel: computed(() => config.locale.messages.close) }
  },
})
</script>

<style>
.sq-alert { display: flex; align-items: flex-start; gap: var(--sq-space-3); padding: var(--sq-space-3) var(--sq-space-4); color: var(--sq-fg); }
.sq-alert--tonal .sq-alert__text { color: var(--sq-on-surface); }
.sq-alert--prominent { align-items: center; padding: var(--sq-space-4) var(--sq-space-5); }
.sq-alert__icon { display: flex; padding-top: 1px; }
.sq-alert__body { flex: 1; min-width: 0; }
.sq-alert__title { font-weight: var(--sq-weight-semibold); margin-bottom: 2px; }
.sq-alert__text { font-size: var(--sq-text-sm); }
.sq-alert__append { align-self: center; }
</style>
