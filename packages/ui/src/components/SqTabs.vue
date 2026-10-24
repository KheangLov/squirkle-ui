<template>
  <div class="sq-tabs" :class="[`sq-tabs--${variant}`, { 'sq-tabs--grow': grow, 'sq-tabs--vertical': vertical }]" :style="{ '--sq-c': colorValue(color) }">
    <div ref="bar" class="sq-tabs__bar" role="tablist" :aria-orientation="vertical ? 'vertical' : 'horizontal'" @keydown="onKeydown">
      <div class="sq-tabs__indicator sq-squircle" :style="indicatorStyle"></div>
      <SqTab v-for="(item, i) in normalized" :key="item.value ?? i" :value="item.value ?? i" :prepend-icon="item.icon" :disabled="item.disabled">{{ item.title }}</SqTab>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, watch, type PropType } from 'vue'
import SqTab from './SqTab.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { provideGroup } from '../composables/group'
import { colorValue } from '../composables/style'
import { useResizeObserver } from '../composables/dom'

export interface TabItem { title: string; value?: string | number; icon?: string; disabled?: boolean }

/** Tabs with a sliding squircle indicator. Pair with SqWindow using the same v-model. */
export default defineComponent({
  name: 'SqTabs',
  components: { SqTab },
  model: vModel,
  props: {
    modelValue: { type: [String, Number], default: undefined },
    items: { type: Array as PropType<(TabItem | string)[]>, default: () => [] },
    variant: { type: String as PropType<'pill' | 'underline' | 'segmented'>, default: 'pill' },
    color: { type: String, default: 'primary' },
    grow: Boolean,
    vertical: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<unknown>(props, emit)
    provideGroup('sq-tabs', model, { mandatory: true })
    const bar = ref<HTMLElement | null>(null)
    const rect = ref({ x: 0, y: 0, w: 0, h: 0 })
    const normalized = computed(() => props.items.map((it) => (typeof it === 'string' ? { title: it, value: it } : it)) as TabItem[])
    const measure = () => {
      const el = bar.value?.querySelector<HTMLElement>('.sq-tab--active')
      if (!el) return
      rect.value = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }
      el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    }
    watch(model, () => nextTick(measure))
    onMounted(() => nextTick(measure))
    useResizeObserver(bar, measure)
    const indicatorStyle = computed(() => {
      const r = rect.value
      if (props.variant === 'underline')
        return props.vertical ? { transform: `translateY(${r.y}px)`, height: `${r.h}px` } : { transform: `translateX(${r.x}px)`, width: `${r.w}px` }
      return { transform: `translate(${r.x}px, ${r.y}px)`, width: `${r.w}px`, height: `${r.h}px` }
    })
    const onKeydown = (e: KeyboardEvent) => {
      const keys = props.vertical ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
      if (!keys.includes(e.key) || !bar.value) return
      const tabs = Array.from(bar.value.querySelectorAll<HTMLElement>('.sq-tab:not([disabled])'))
      const i = tabs.indexOf(document.activeElement as HTMLElement)
      const next = tabs[(i + (e.key === keys[1] ? 1 : -1) + tabs.length) % tabs.length]
      next?.focus()
      next?.click()
      e.preventDefault()
    }
    return { bar, normalized, indicatorStyle, onKeydown, colorValue }
  },
})
</script>

<style>
.sq-tabs { max-width: 100%; }
.sq-tabs__bar { position: relative; display: flex; gap: 2px; overflow-x: auto; scrollbar-width: none; isolation: isolate; }
.sq-tabs--vertical .sq-tabs__bar { flex-direction: column; overflow: visible; }
.sq-tabs--grow .sq-tab { flex: 1; }
.sq-tabs__indicator { position: absolute; left: 0; top: 0; z-index: -1; pointer-events: none; transition: transform var(--sq-duration-slow) var(--sq-ease-spring), width var(--sq-duration-slow) var(--sq-ease), height var(--sq-duration) var(--sq-ease); }
.sq-tabs--pill .sq-tabs__indicator { --sq-r: var(--sq-radius-md); background: color-mix(in srgb, var(--sq-c) 13%, transparent); }
.sq-tabs--segmented .sq-tabs__bar { padding: 3px; background: var(--sq-surface-variant); border-radius: calc(var(--sq-radius-md) + 3px); display: inline-flex; }
.sq-tabs--segmented .sq-tabs__indicator { --sq-r: var(--sq-radius-md); background: var(--sq-surface-raised); box-shadow: var(--sq-elevation-1); }
.sq-tabs--underline .sq-tabs__bar { border-bottom: 1px solid var(--sq-border); }
.sq-tabs--underline .sq-tabs__indicator { top: auto; bottom: 0; height: 3px; --sq-r: 3px; background: var(--sq-c); }
.sq-tabs--underline.sq-tabs--vertical .sq-tabs__bar { border-bottom: 0; border-inline-start: 1px solid var(--sq-border); }
.sq-tabs--underline.sq-tabs--vertical .sq-tabs__indicator { bottom: auto; width: 3px; }
</style>
