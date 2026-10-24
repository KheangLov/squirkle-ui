<template>
  <div class="sq-img" :class="{ 'sq-img--loaded': loaded, 'sq-surface': rounded !== false }" :style="style">
    <SqShape v-if="rounded !== false" :watch-key="rounded" />
    <div class="sq-img__clip">
      <img v-if="inView" :src="src" :srcset="srcset" :alt="alt" :loading="eager ? 'eager' : 'lazy'" class="sq-img__img" :style="{ objectFit: cover ? 'cover' : 'contain' }" @load="loaded = true" @error="error = true" />
      <div v-if="!loaded && !error" class="sq-img__placeholder"><slot name="placeholder"><div class="sq-skeleton-shimmer"></div></slot></div>
      <div v-if="error" class="sq-img__placeholder"><slot name="error"><SqIcon icon="error" /></slot></div>
      <div v-if="has('default')" class="sq-img__content"><slot /></div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, getCurrentInstance, ref } from 'vue'
import { toUnit } from '@squirkle/core'
import SqShape from './SqShape.vue'
import SqIcon from './SqIcon.vue'
import { radiusValue, roundedProp } from '../composables/style'

/** Lazy image with squircle clipping, aspect ratio and placeholder. */
export default defineComponent({
  name: 'SqImg',
  components: { SqShape, SqIcon },
  props: {
    src: { type: String, required: true },
    srcset: { type: String, default: undefined },
    alt: { type: String, default: '' },
    aspectRatio: { type: [Number, String], default: undefined },
    width: { type: [Number, String], default: undefined },
    height: { type: [Number, String], default: undefined },
    cover: { type: Boolean, default: true },
    rounded: { ...roundedProp, default: 'lg' },
    eager: Boolean,
  },
  setup(props, { slots }) {
    const loaded = ref(false)
    const error = ref(false)
    const inView = ref(props.eager)
    const inst = getCurrentInstance()
    let io: IntersectionObserver | undefined
    onMounted(() => {
      if (inView.value) return
      if (typeof IntersectionObserver === 'undefined') return (inView.value = true)
      io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          inView.value = true
          io?.disconnect()
        }
      }, { rootMargin: '200px' })
      io.observe(inst!.proxy!.$el as Element)
    })
    onBeforeUnmount(() => io?.disconnect())
    const style = computed(() => ({
      '--sq-r': props.rounded === false ? '0px' : radiusValue(props.rounded),
      '--sq-bg': 'var(--sq-surface-variant)',
      aspectRatio: props.aspectRatio ? String(props.aspectRatio) : undefined,
      width: toUnit(props.width),
      height: toUnit(props.height),
    }))
    return { loaded, error, inView, style, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-img { position: relative; display: block; overflow: hidden; }
.sq-img__clip { position: relative; width: 100%; height: 100%; min-height: inherit; border-radius: inherit; overflow: hidden; }
.sq-img__img { display: block; width: 100%; height: 100%; opacity: 0; transition: opacity var(--sq-duration-slow) var(--sq-ease); }
.sq-img--loaded .sq-img__img { opacity: 1; }
.sq-img__placeholder, .sq-img__content { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--sq-muted); }
.sq-skeleton-shimmer { position: absolute; inset: 0; overflow: hidden; background: var(--sq-surface-variant); }
.sq-skeleton-shimmer::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--sq-surface) 60%, transparent), transparent); animation: sq-shimmer 1.4s infinite; }
</style>
