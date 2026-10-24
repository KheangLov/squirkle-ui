<template>
  <span class="sq-dialog-host">
    <span v-if="has('activator')" class="sq-dialog__activator" @click="model = true"><slot name="activator" :open="() => (model = true)" /></span>
    <SqPortal>
      <transition name="sq-fade">
        <div v-if="model" class="sq-dialog" :class="[`sq-dialog--${position}`, { 'sq-dialog--fullscreen': fullscreen }]" :style="{ zIndex: z }" @keydown="onKeydown">
          <div class="sq-dialog__scrim" @click="onScrimClick"></div>
          <transition :name="position === 'bottom' ? 'sq-slide-y' : 'sq-scale'" appear>
            <div
              ref="panel"
              class="sq-dialog__panel sq-surface"
              :class="{ 'sq-dialog__panel--shake': shaking }"
              :style="panelStyle"
              role="dialog"
              aria-modal="true"
              :aria-label="title"
              tabindex="-1"
            >
              <SqShape :watch-key="fullscreen" />
              <div v-if="position === 'bottom'" class="sq-dialog__handle"></div>
              <div v-if="title || has('title') || closable" class="sq-dialog__header">
                <div class="sq-dialog__title"><slot name="title">{{ title }}</slot></div>
                <SqBtn v-if="closable" icon="close" variant="text" color="surface" size="small" :aria-label="closeLabel" @click="model = false" />
              </div>
              <div class="sq-dialog__body" :class="{ 'sq-dialog__body--scroll': scrollable }"><slot :close="() => (model = false)" /></div>
              <div v-if="has('actions')" class="sq-dialog__actions"><slot name="actions" :close="() => (model = false)" /></div>
            </div>
          </transition>
        </div>
      </transition>
    </SqPortal>
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { isBrowser, toUnit } from '@squirkle/core'
import SqPortal from './SqPortal.vue'
import SqShape from './SqShape.vue'
import SqBtn from './SqBtn.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { focusableIn, lockScroll, nextZIndex, unlockScroll } from '../composables/dom'
import { config } from '../config'

export default defineComponent({
  name: 'SqDialog',
  components: { SqPortal, SqShape, SqBtn },
  model: vModel,
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: undefined },
    width: { type: [Number, String], default: 520 },
    maxWidth: { type: [Number, String], default: undefined },
    /** Clicking the scrim / pressing Esc does not close (dialog shakes instead). */
    persistent: Boolean,
    fullscreen: Boolean,
    scrollable: { type: Boolean, default: true },
    closable: Boolean,
    position: { type: String as PropType<'center' | 'top' | 'bottom'>, default: 'center' },
  },
  emits: ['update:modelValue', 'after-leave'],
  setup(props, { emit, slots }) {
    const model = useProxiedModel<boolean>(props, emit)
    const panel = ref<HTMLElement | null>(null)
    const z = ref(2000)
    const shaking = ref(false)
    let lastFocus: HTMLElement | null = null
    let locked = false

    watch(model, async (v) => {
      if (!isBrowser) return
      if (v) {
        z.value = nextZIndex()
        lastFocus = document.activeElement as HTMLElement
        if (!locked) { lockScroll(); locked = true }
        await nextTick()
        const f = panel.value ? focusableIn(panel.value) : []
        ;(f.find((el) => !el.closest('.sq-dialog__header')) ?? panel.value)?.focus({ preventScroll: true })
      } else {
        if (locked) { unlockScroll(); locked = false }
        lastFocus?.focus?.({ preventScroll: true })
      }
    }, { immediate: true })
    onBeforeUnmount(() => locked && unlockScroll())

    const shake = () => {
      shaking.value = true
      setTimeout(() => (shaking.value = false), 300)
    }
    const onScrimClick = () => (props.persistent ? shake() : (model.value = false))
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        props.persistent ? shake() : (model.value = false)
      }
      if (e.key === 'Tab' && panel.value) {
        const f = focusableIn(panel.value)
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    const panelStyle = computed(() => ({
      width: props.fullscreen ? undefined : toUnit(props.width),
      maxWidth: props.fullscreen ? undefined : toUnit(props.maxWidth),
    }))
    return { model, panel, z, shaking, onScrimClick, onKeydown, panelStyle, has: (n: string) => !!slots[n], closeLabel: computed(() => config.locale.messages.close) }
  },
})
</script>

<style>
.sq-dialog-host, .sq-dialog__activator { display: contents; }
.sq-dialog { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: var(--sq-space-4); }
.sq-dialog--top { align-items: flex-start; padding-top: 10vh; }
.sq-dialog--bottom { align-items: flex-end; padding: 0; }
.sq-dialog__scrim { position: absolute; inset: 0; background: color-mix(in srgb, var(--sq-overlay) 45%, transparent); backdrop-filter: blur(2px); }
.sq-dialog__panel {
  --sq-bg: var(--sq-surface-raised); --sq-r: var(--sq-radius-2xl);
  --sq-shadow: var(--sq-elevation-4); --sq-shadow-filter: var(--sq-elevation-4-filter);
  position: relative; display: flex; flex-direction: column; max-width: calc(100vw - 32px); max-height: calc(100vh - 32px);
  color: var(--sq-on-surface); outline: none;
}
.sq-dialog--bottom .sq-dialog__panel { width: 100% !important; max-width: 720px; max-height: 88vh; border-end-start-radius: 0; border-end-end-radius: 0; padding-bottom: env(safe-area-inset-bottom); }
.sq-dialog--fullscreen { padding: 0; }
.sq-dialog--fullscreen .sq-dialog__panel { width: 100vw; height: 100vh; max-width: none; max-height: none; --sq-r: 0px; }
.sq-dialog__panel--shake { animation: sq-dialog-shake 0.3s var(--sq-ease); }
.sq-dialog__handle { width: 40px; height: 5px; border-radius: var(--sq-radius-pill); background: var(--sq-border-strong); margin: var(--sq-space-2) auto 0; }
.sq-dialog__header { display: flex; align-items: center; gap: var(--sq-space-2); padding: var(--sq-space-5) var(--sq-space-6) var(--sq-space-2); }
.sq-dialog__title { flex: 1; font-size: var(--sq-text-xl); font-weight: var(--sq-weight-semibold); letter-spacing: -0.01em; }
.sq-dialog__body { padding: var(--sq-space-2) var(--sq-space-6) var(--sq-space-4); color: var(--sq-on-surface-variant); }
.sq-dialog__body--scroll { overflow-y: auto; }
.sq-dialog__actions { display: flex; justify-content: flex-end; gap: var(--sq-space-2); padding: var(--sq-space-2) var(--sq-space-6) var(--sq-space-5); }
@keyframes sq-dialog-shake { 25% { transform: scale(1.02); } 75% { transform: scale(0.99); } }
</style>
