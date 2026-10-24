<template>
  <aside
    class="sq-navigation-drawer"
    :class="[`sq-navigation-drawer--${location}`, { 'sq-navigation-drawer--temporary': isTemporary, 'sq-navigation-drawer--open': isOpen, 'sq-navigation-drawer--rail': rail, 'sq-navigation-drawer--floating': floating }]"
    :style="style"
    :aria-hidden="isTemporary && !isOpen ? 'true' : undefined"
  >
    <transition name="sq-fade">
      <div v-if="isTemporary && isOpen && scrim" class="sq-navigation-drawer__scrim" @click="model = false"></div>
    </transition>
    <nav class="sq-navigation-drawer__panel" :class="{ 'sq-surface': floating || isTemporary }" @click="onPanelClick">
      <SqShape v-if="floating || isTemporary" :watch-key="rail" />
      <div v-if="has('prepend')" class="sq-navigation-drawer__prepend"><slot name="prepend" /></div>
      <div class="sq-navigation-drawer__content"><slot /></div>
      <div v-if="has('append')" class="sq-navigation-drawer__append"><slot name="append" /></div>
    </nav>
  </aside>
</template>

<script lang="ts">
import { computed, defineComponent, watch, type PropType } from 'vue'
import { toUnit } from '@squirkle-ui/core'
import SqShape from './SqShape.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { useDisplay } from '../composables/display'

export default defineComponent({
  name: 'SqNavigationDrawer',
  components: { SqShape },
  model: vModel,
  props: {
    modelValue: { type: Boolean, default: undefined },
    location: { type: String as PropType<'start' | 'end'>, default: 'start' },
    width: { type: [Number, String], default: 272 },
    railWidth: { type: [Number, String], default: 72 },
    rail: Boolean,
    /** Always overlay (never takes layout space). */
    temporary: Boolean,
    /** Never collapse to temporary on mobile. */
    permanent: Boolean,
    floating: Boolean,
    scrim: { type: Boolean, default: true },
    /** Close a temporary drawer when a link inside it is clicked. */
    closeOnNavigate: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const { mobile } = useDisplay()
    const isTemporary = computed(() => props.temporary || (!props.permanent && mobile.value))
    const model = useProxiedModel<boolean>(props, emit, 'modelValue', () => !isTemporary.value)
    watch(isTemporary, (t) => (model.value = !t))
    const isOpen = computed(() => (isTemporary.value ? !!model.value : model.value !== false))
    const style = computed(() => ({
      '--sq-drawer-width': toUnit(props.rail ? props.railWidth : props.width),
    }))
    const onPanelClick = (e: MouseEvent) => {
      if (isTemporary.value && props.closeOnNavigate && (e.target as HTMLElement).closest('a[href]')) model.value = false
    }
    return { model, isOpen, isTemporary, style, onPanelClick, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-navigation-drawer { grid-area: start; position: sticky; top: var(--sq-app-bar-height, 0px); height: calc(100vh - var(--sq-app-bar-height, 0px)); z-index: var(--sq-z-drawer); width: var(--sq-drawer-width); transition: width var(--sq-duration) var(--sq-ease), margin var(--sq-duration) var(--sq-ease); }
.sq-navigation-drawer--end { grid-area: end; }
.sq-navigation-drawer:not(.sq-navigation-drawer--temporary):not(.sq-navigation-drawer--open) { width: 0; overflow: hidden; }
.sq-navigation-drawer__panel {
  --sq-bg: var(--sq-surface); --sq-r: 0px;
  display: flex; flex-direction: column; height: 100%; width: var(--sq-drawer-width);
  background: var(--sq-bg); color: var(--sq-on-surface);
  border-inline-end: 1px solid var(--sq-border); overflow: hidden;
}
.sq-navigation-drawer--end .sq-navigation-drawer__panel { border-inline-end: 0; border-inline-start: 1px solid var(--sq-border); }
.sq-navigation-drawer--floating .sq-navigation-drawer__panel { --sq-r: var(--sq-radius-xl); --sq-bw: 1px; --sq-bd: var(--sq-border); margin: var(--sq-space-3); height: calc(100% - var(--sq-space-6)); width: calc(var(--sq-drawer-width) - var(--sq-space-6)); border: var(--sq-bw) solid var(--sq-bd); }
.sq-navigation-drawer__content { flex: 1; overflow-y: auto; padding: var(--sq-space-2); }
.sq-navigation-drawer__prepend, .sq-navigation-drawer__append { padding: var(--sq-space-3); }
.sq-navigation-drawer--temporary { position: fixed; top: 0; height: 100%; width: 0; inset-inline-start: 0; z-index: var(--sq-z-overlay); }
.sq-navigation-drawer--temporary.sq-navigation-drawer--end { inset-inline-start: auto; inset-inline-end: 0; }
.sq-navigation-drawer--temporary .sq-navigation-drawer__panel {
  position: fixed; top: var(--sq-space-2); bottom: var(--sq-space-2); inset-inline-start: var(--sq-space-2); height: auto;
  --sq-r: var(--sq-radius-xl); --sq-shadow: var(--sq-elevation-4); --sq-shadow-filter: var(--sq-elevation-4-filter); border: 0;
  transform: translateX(calc(-100% - 16px)); transition: transform var(--sq-duration-slow) var(--sq-ease);
}
.sq-navigation-drawer--temporary.sq-navigation-drawer--end .sq-navigation-drawer__panel { inset-inline-start: auto; inset-inline-end: var(--sq-space-2); transform: translateX(calc(100% + 16px)); }
.sq-navigation-drawer--temporary.sq-navigation-drawer--open .sq-navigation-drawer__panel { transform: none; }
.sq-navigation-drawer__scrim { position: fixed; inset: 0; background: color-mix(in srgb, var(--sq-overlay) 40%, transparent); }
</style>
