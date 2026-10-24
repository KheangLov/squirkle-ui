<template>
  <div class="sq-speed-dial" :class="`sq-speed-dial--${direction}`" @mouseenter="openOnHover && (model = true)" @mouseleave="openOnHover && (model = false)">
    <transition-group tag="div" name="sq-scale" class="sq-speed-dial__actions">
      <div v-for="(a, i) in model ? actions : []" :key="a.icon + i" class="sq-speed-dial__action" :style="{ transitionDelay: i * 30 + 'ms' }">
        <span v-if="a.label" class="sq-speed-dial__label">{{ a.label }}</span>
        <SqBtn :icon="a.icon" :color="a.color ?? 'surface'" variant="elevated" :aria-label="a.label" @click="onAction(a)" />
      </div>
    </transition-group>
    <SqBtn :icon="model ? 'close' : icon" :color="color" size="large" variant="elevated" rounded="xl" class="sq-speed-dial__fab" :aria-expanded="!!model ? 'true' : 'false'" @click="model = !model" />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SqBtn from './SqBtn.vue'
import { useProxiedModel, vModel } from '../composables/model'

export interface SpeedDialAction { icon: string; label?: string; color?: string; value?: unknown }

export default defineComponent({
  name: 'SqSpeedDial',
  components: { SqBtn },
  model: vModel,
  props: {
    modelValue: { type: Boolean, default: false },
    icon: { type: String, default: 'plus' },
    color: { type: String, default: 'primary' },
    actions: { type: Array as PropType<SpeedDialAction[]>, default: () => [] },
    direction: { type: String as PropType<'up' | 'down' | 'left' | 'right'>, default: 'up' },
    openOnHover: Boolean,
  },
  emits: ['update:modelValue', 'action'],
  setup(props, { emit }) {
    const model = useProxiedModel<boolean>(props, emit)
    const onAction = (a: SpeedDialAction) => {
      emit('action', a)
      model.value = false
    }
    return { model, onAction }
  },
})
</script>

<style>
.sq-speed-dial { position: relative; display: inline-flex; flex-direction: column-reverse; align-items: center; gap: var(--sq-space-3); }
.sq-speed-dial--down { flex-direction: column; }
.sq-speed-dial--left { flex-direction: row-reverse; }
.sq-speed-dial--right { flex-direction: row; }
.sq-speed-dial__actions { display: flex; flex-direction: column-reverse; align-items: center; gap: var(--sq-space-2); }
.sq-speed-dial--down .sq-speed-dial__actions { flex-direction: column; }
.sq-speed-dial--left .sq-speed-dial__actions, .sq-speed-dial--right .sq-speed-dial__actions { flex-direction: row; }
.sq-speed-dial__action { position: relative; display: flex; align-items: center; }
.sq-speed-dial__label { position: absolute; right: calc(100% + 10px); white-space: nowrap; padding: 4px 10px; border-radius: var(--sq-radius-sm); background: var(--sq-surface-raised); box-shadow: var(--sq-elevation-2); font-size: var(--sq-text-xs); font-weight: var(--sq-weight-medium); }
</style>
