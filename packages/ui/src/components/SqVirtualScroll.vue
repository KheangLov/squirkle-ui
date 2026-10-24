<template>
  <div ref="root" class="sq-virtual-scroll" :style="rootStyle" role="list" :aria-busy="loading ? 'true' : undefined">
    <div class="sq-virtual-scroll__spacer" :style="{ height: totalSize + 'px' }">
      <div
        v-for="v in virtualItems"
        :key="keyOf(v.index)"
        class="sq-virtual-scroll__item"
        role="listitem"
        :data-index="v.index"
        :style="{ transform: `translateY(${v.start}px)`, height: itemHeight ? itemHeight + 'px' : undefined }"
      >
        <slot :item="items[v.index]" :index="v.index" />
      </div>
    </div>
    <div v-if="!items.length && !loading" class="sq-virtual-scroll__empty"><slot name="empty">{{ messages.noData }}</slot></div>
    <div v-if="loading" class="sq-virtual-scroll__loader">
      <slot name="loading"><SqProgressCircular indeterminate :size="22" :width="3" /><span>{{ messages.loading }}</span></slot>
    </div>
    <div v-else-if="infinite && !hasMore && items.length" class="sq-virtual-scroll__end"><slot name="end" /></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, onUpdated, ref, watch, type PropType } from 'vue'
import { getByPath, toUnit } from '@squirkle-ui/core'
import { useVirtual } from '../composables/virtual'
import { config } from '../config'
import SqProgressCircular from './SqProgressCircular.vue'

/**
 * Renders only visible rows of `items`. Fixed `itemHeight` = O(1) layout; omit it for measured, variable heights.
 * `infinite` emits `load-more` when the user scrolls within `threshold` items of the end.
 */
export default defineComponent({
  name: 'SqVirtualScroll',
  components: { SqProgressCircular },
  props: {
    items: { type: Array as PropType<unknown[]>, default: () => [] },
    itemHeight: { type: Number, default: undefined },
    estimatedItemHeight: { type: Number, default: 48 },
    height: { type: [Number, String], default: 400 },
    overscan: { type: Number, default: 6 },
    /** Property path or function producing a stable key per item. Defaults to the index. */
    itemKey: { type: [String, Function] as PropType<string | ((item: unknown, index: number) => string | number)>, default: undefined },
    infinite: Boolean,
    loading: Boolean,
    hasMore: { type: Boolean, default: true },
    /** Emit load-more when this many items or fewer remain below the viewport. */
    threshold: { type: Number, default: 10 },
  },
  emits: ['load-more', 'range-change'],
  setup(props, { emit }) {
    const root = ref<HTMLElement | null>(null)
    const virtual = useVirtual(root, {
      count: () => props.items.length,
      itemSize: () => props.itemHeight,
      estimateSize: () => props.estimatedItemHeight,
      overscan: () => props.overscan,
    })

    const keyOf = (i: number) => {
      const item = props.items[i]
      if (typeof props.itemKey === 'function') return props.itemKey(item, i)
      if (props.itemKey) return getByPath(item, props.itemKey) as string | number
      return i
    }

    watch(virtual.range, (r) => {
      emit('range-change', r)
      if (props.infinite && !props.loading && props.hasMore && r.end >= props.items.length - 1 - props.threshold) emit('load-more')
    })
    // Fire once when the initial page is shorter than the viewport.
    watch(() => [props.items.length, props.loading], () => {
      const r = virtual.range.value
      if (props.infinite && !props.loading && props.hasMore && r.end >= props.items.length - 1 - props.threshold) emit('load-more')
    })

    let ro: ResizeObserver | undefined
    const observed = new WeakSet<Element>()
    const observeItems = () => {
      if (props.itemHeight || !root.value || !ro) return
      root.value.querySelectorAll('.sq-virtual-scroll__item').forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el)
          ro!.observe(el)
        }
      })
    }
    onMounted(() => {
      if (typeof ResizeObserver !== 'undefined')
        ro = new ResizeObserver((entries) => {
          for (const e of entries) {
            const idx = Number((e.target as HTMLElement).dataset.index)
            virtual.measure(idx, (e.target as HTMLElement).offsetHeight)
          }
        })
      observeItems()
      if (props.infinite && !props.items.length && !props.loading && props.hasMore) emit('load-more')
    })
    onUpdated(observeItems)
    onBeforeUnmount(() => ro?.disconnect())

    const rootStyle = computed(() => ({ height: toUnit(props.height) }))
    return {
      root,
      rootStyle,
      keyOf,
      virtualItems: virtual.items,
      totalSize: virtual.totalSize,
      scrollToIndex: virtual.scrollToIndex,
      messages: computed(() => config.locale.messages),
    }
  },
})
</script>

<style>
.sq-virtual-scroll { position: relative; overflow: auto; overscroll-behavior: contain; contain: strict; will-change: scroll-position; }
.sq-virtual-scroll__spacer { position: relative; width: 100%; }
.sq-virtual-scroll__item { position: absolute; top: 0; left: 0; width: 100%; }
.sq-virtual-scroll__loader, .sq-virtual-scroll__empty, .sq-virtual-scroll__end {
  display: flex; align-items: center; justify-content: center; gap: var(--sq-space-2);
  padding: var(--sq-space-4); color: var(--sq-muted); font-size: var(--sq-text-sm);
}
.sq-virtual-scroll__empty { position: absolute; inset: 0; }
</style>
