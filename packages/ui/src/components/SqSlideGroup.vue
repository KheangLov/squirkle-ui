<template>
  <div class="sq-slide-group">
    <SqBtn v-if="showArrows" class="sq-slide-group__arrow" icon="chevronLeft" variant="text" color="surface" size="small" :disabled="atStart" :aria-label="messages.previous" @click="scroll(-1)" />
    <div ref="track" class="sq-slide-group__track" @scroll.passive="update"><slot /></div>
    <SqBtn v-if="showArrows" class="sq-slide-group__arrow" icon="chevronRight" variant="text" color="surface" size="small" :disabled="atEnd" :aria-label="messages.next" @click="scroll(1)" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import SqBtn from './SqBtn.vue'
import { useResizeObserver } from '../composables/dom'
import { config } from '../config'

/** Horizontal scroller with arrow buttons for chips, cards, tabs. */
export default defineComponent({
  name: 'SqSlideGroup',
  components: { SqBtn },
  props: { showArrows: { type: Boolean, default: true } },
  setup() {
    const track = ref<HTMLElement | null>(null)
    const atStart = ref(true)
    const atEnd = ref(false)
    const update = () => {
      const t = track.value
      if (!t) return
      atStart.value = t.scrollLeft <= 1
      atEnd.value = t.scrollLeft + t.clientWidth >= t.scrollWidth - 1
    }
    const scroll = (dir: number) => track.value?.scrollBy({ left: dir * track.value.clientWidth * 0.8, behavior: 'smooth' })
    onMounted(update)
    useResizeObserver(track, update)
    return { track, atStart, atEnd, update, scroll, messages: computed(() => config.locale.messages) }
  },
})
</script>

<style>
.sq-slide-group { display: flex; align-items: center; gap: var(--sq-space-1); min-width: 0; }
.sq-slide-group__track { display: flex; gap: var(--sq-space-2); overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; flex: 1; padding: 2px; }
.sq-slide-group__track::-webkit-scrollbar { display: none; }
.sq-slide-group__track > * { scroll-snap-align: start; flex: none; }
</style>
