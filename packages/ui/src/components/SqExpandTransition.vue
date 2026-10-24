<template>
  <transition
    name="sq-expand"
    @enter="onEnter"
    @after-enter="clear"
    @leave="onLeave"
    @after-leave="clear"
  ><slot /></transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/** Height auto ↔ 0 transition for collapsible content (works with v-if and v-show). */
export default defineComponent({
  name: 'SqExpandTransition',
  setup() {
    const onEnter = (el: Element) => {
      const e = el as HTMLElement
      e.style.height = '0px'
      void e.offsetHeight
      e.style.height = `${e.scrollHeight}px`
    }
    const onLeave = (el: Element) => {
      const e = el as HTMLElement
      e.style.height = `${e.scrollHeight}px`
      void e.offsetHeight
      e.style.height = '0px'
    }
    const clear = (el: Element) => ((el as HTMLElement).style.height = '')
    return { onEnter, onLeave, clear }
  },
})
</script>
