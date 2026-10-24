<template>
  <div class="sq-lazy" :style="{ minHeight: !visible ? toUnit(minHeight) : undefined }">
    <transition :name="transition"><div v-if="visible" class="sq-lazy__content"><slot /></div></transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue'
import { toUnit } from '@squirkle/core'

/** Renders its content only once it scrolls into view. */
export default defineComponent({
  name: 'SqLazy',
  props: {
    minHeight: { type: [Number, String], default: 100 },
    rootMargin: { type: String, default: '100px' },
    transition: { type: String, default: 'sq-fade' },
  },
  setup(props) {
    const visible = ref(false)
    const inst = getCurrentInstance()
    let io: IntersectionObserver | undefined
    onMounted(() => {
      if (typeof IntersectionObserver === 'undefined') return (visible.value = true)
      io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          visible.value = true
          io?.disconnect()
        }
      }, { rootMargin: props.rootMargin })
      io.observe(inst!.proxy!.$el as Element)
    })
    onBeforeUnmount(() => io?.disconnect())
    return { visible, toUnit }
  },
})
</script>
