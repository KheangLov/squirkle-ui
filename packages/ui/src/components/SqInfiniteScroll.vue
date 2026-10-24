<template>
  <div ref="root" class="sq-infinite-scroll" :style="{ height: height ? toUnit(height) : undefined, overflowY: height ? 'auto' : undefined }">
    <slot />
    <div ref="sentinel" class="sq-infinite-scroll__sentinel" aria-hidden="true"></div>
    <div v-if="loading" class="sq-infinite-scroll__status">
      <slot name="loading"><SqProgressCircular indeterminate :size="22" :width="3" /></slot>
    </div>
    <div v-else-if="!hasMore" class="sq-infinite-scroll__status"><slot name="end" /></div>
    <div v-else-if="manual" class="sq-infinite-scroll__status">
      <slot name="load-more" :load="load"><SqBtn variant="tonal" size="small" @click="load">Load more</SqBtn></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { toUnit } from '@squirkle-ui/core'
import SqProgressCircular from './SqProgressCircular.vue'
import SqBtn from './SqBtn.vue'

/** Non-virtual infinite list: emits `load` when the end sentinel becomes visible. For big data prefer SqVirtualScroll. */
export default defineComponent({
  name: 'SqInfiniteScroll',
  components: { SqProgressCircular, SqBtn },
  props: {
    loading: Boolean,
    hasMore: { type: Boolean, default: true },
    height: { type: [Number, String], default: undefined },
    /** Distance in px before the end at which loading starts. */
    margin: { type: Number, default: 200 },
    /** Show a "Load more" button instead of auto-loading. */
    manual: Boolean,
  },
  emits: ['load'],
  setup(props, { emit }) {
    const root = ref<HTMLElement | null>(null)
    const sentinel = ref<HTMLElement | null>(null)
    let io: IntersectionObserver | undefined
    let visible = false
    const load = () => {
      if (!props.loading && props.hasMore) emit('load')
    }
    onMounted(() => {
      if (typeof IntersectionObserver === 'undefined' || !sentinel.value) return
      io = new IntersectionObserver(
        ([e]) => {
          visible = e.isIntersecting
          if (visible && !props.manual) load()
        },
        { root: props.height ? root.value : null, rootMargin: `0px 0px ${props.margin}px 0px` },
      )
      io.observe(sentinel.value)
    })
    // Keep loading while the sentinel is still visible after a page arrives.
    watch(() => props.loading, (l) => !l && visible && !props.manual && setTimeout(load, 0))
    onBeforeUnmount(() => io?.disconnect())
    return { root, sentinel, load, toUnit }
  },
})
</script>

<style>
.sq-infinite-scroll__sentinel { height: 1px; }
.sq-infinite-scroll__status { display: flex; justify-content: center; padding: var(--sq-space-4); color: var(--sq-muted); }
</style>
