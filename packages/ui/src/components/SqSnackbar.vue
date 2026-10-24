<template>
  <SqPortal>
    <transition name="sq-slide-y">
      <div v-if="model" class="sq-snackbar" :class="`sq-snackbar--${location.replace(' ', '-')}`" role="status" aria-live="polite" @mouseenter="pause" @mouseleave="resume">
        <div class="sq-snackbar__panel sq-surface" :style="style">
          <SqShape />
          <SqIcon v-if="icon" :icon="icon" />
          <div class="sq-snackbar__text"><slot>{{ text }}</slot></div>
          <div class="sq-snackbar__actions"><slot name="actions" :close="() => (model = false)" /></div>
          <div v-if="timeout > 0 && showTimer" class="sq-snackbar__timer" :style="{ animationDuration: timeout + 'ms', animationPlayState: paused ? 'paused' : 'running' }"></div>
        </div>
      </div>
    </transition>
  </SqPortal>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { isBrowser } from '@squirkle/core'
import SqPortal from './SqPortal.vue'
import SqShape from './SqShape.vue'
import SqIcon from './SqIcon.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { colorValue, onColorValue } from '../composables/style'

export default defineComponent({
  name: 'SqSnackbar',
  components: { SqPortal, SqShape, SqIcon },
  model: vModel,
  props: {
    modelValue: { type: Boolean, default: false },
    text: { type: String, default: undefined },
    icon: { type: String, default: undefined },
    color: { type: String, default: undefined },
    timeout: { type: Number, default: 4000 },
    showTimer: Boolean,
    location: { type: String as PropType<'bottom' | 'top' | 'bottom start' | 'bottom end' | 'top start' | 'top end'>, default: 'bottom' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<boolean>(props, emit)
    const paused = ref(false)
    let timer: ReturnType<typeof setTimeout> | undefined
    let remaining = props.timeout
    let startedAt = 0
    const start = () => {
      clearTimeout(timer)
      if (props.timeout <= 0 || !isBrowser) return
      startedAt = Date.now()
      timer = setTimeout(() => (model.value = false), remaining)
    }
    watch(model, (v) => {
      remaining = props.timeout
      v ? start() : clearTimeout(timer)
    }, { immediate: true })
    const pause = () => { paused.value = true; clearTimeout(timer); remaining -= Date.now() - startedAt }
    const resume = () => { paused.value = false; if (model.value) start() }
    onBeforeUnmount(() => clearTimeout(timer))
    const style = computed(() => ({
      '--sq-bg': colorValue(props.color) ?? 'color-mix(in srgb, var(--sq-on-surface) 94%, var(--sq-surface))',
      color: props.color ? onColorValue(props.color) : 'var(--sq-surface)',
    }))
    return { model, style, paused, pause, resume }
  },
})
</script>

<style>
.sq-snackbar { position: fixed; z-index: var(--sq-z-snackbar); left: 50%; bottom: var(--sq-space-6); transform: translateX(-50%); width: max-content; max-width: calc(100vw - 32px); }
.sq-snackbar--top { top: var(--sq-space-6); bottom: auto; }
.sq-snackbar--bottom-start, .sq-snackbar--top-start { left: var(--sq-space-6); transform: none; }
.sq-snackbar--bottom-end, .sq-snackbar--top-end { left: auto; right: var(--sq-space-6); transform: none; }
.sq-snackbar--top-start, .sq-snackbar--top-end { top: var(--sq-space-6); bottom: auto; }
.sq-snackbar__panel { --sq-r: var(--sq-radius-lg); --sq-shadow: var(--sq-elevation-4); --sq-shadow-filter: var(--sq-elevation-4-filter); display: flex; align-items: center; gap: var(--sq-space-3); min-width: 280px; min-height: 48px; padding: var(--sq-space-2) var(--sq-space-2) var(--sq-space-2) var(--sq-space-4); overflow: hidden; }
.sq-snackbar__text { flex: 1; font-size: var(--sq-text-sm); }
.sq-snackbar__actions { display: flex; gap: var(--sq-space-1); }
.sq-snackbar__timer { position: absolute; left: 0; bottom: 0; height: 3px; width: 100%; background: currentColor; opacity: 0.35; transform-origin: left; animation: sq-snackbar-timer linear forwards; }
@keyframes sq-snackbar-timer { from { transform: scaleX(1); } to { transform: scaleX(0); } }
</style>
