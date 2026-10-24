<template>
  <div class="sq-window" :class="{ 'sq-window--reverse': reverse }">
    <div class="sq-window__container"><slot /></div>
    <template v-if="showArrows">
      <SqBtn class="sq-window__prev" icon="chevronLeft" variant="elevated" color="surface" size="small" :aria-label="messages.previous" @click="step(-1)" />
      <SqBtn class="sq-window__next" icon="chevronRight" variant="elevated" color="surface" size="small" :aria-label="messages.next" @click="step(1)" />
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, provide, ref, watch } from 'vue'
import SqBtn from './SqBtn.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { provideGroup } from '../composables/group'
import { config } from '../config'

/** Animated view switcher (tab content, wizards). Children: SqWindowItem. */
export default defineComponent({
  name: 'SqWindow',
  components: { SqBtn },
  model: vModel,
  props: {
    modelValue: { type: [String, Number], default: undefined },
    showArrows: Boolean,
    continuous: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<unknown>(props, emit)
    const group = provideGroup('sq-window', model, { mandatory: true })
    const reverse = ref(false)
    watch(model, (v, old) => (reverse.value = group.items.indexOf(v) < group.items.indexOf(old)))
    provide('sq-window-reverse', reverse)
    const step = (d: number) => {
      const n = group.items.length
      let i = group.items.indexOf(model.value) + d
      if (props.continuous) i = (i + n) % n
      if (i >= 0 && i < n) model.value = group.items[i]
    }
    return { reverse, step, messages: computed(() => config.locale.messages) }
  },
})
</script>

<style>
.sq-window { position: relative; overflow: hidden; }
.sq-window__container { display: grid; }
.sq-window__container > * { grid-area: 1 / 1; }
.sq-window__prev, .sq-window__next { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; }
.sq-window__prev { left: var(--sq-space-2); }
.sq-window__next { right: var(--sq-space-2); }
.sq-window-x-enter-active, .sq-window-x-leave-active { transition: transform var(--sq-duration-slow) var(--sq-ease), opacity var(--sq-duration-slow) var(--sq-ease); }
.sq-window-x-enter, .sq-window-x-enter-from { transform: translateX(40px); opacity: 0; }
.sq-window-x-leave-to { transform: translateX(-40px); opacity: 0; }
.sq-window--reverse .sq-window-x-enter, .sq-window--reverse .sq-window-x-enter-from { transform: translateX(-40px); }
.sq-window--reverse .sq-window-x-leave-to { transform: translateX(40px); }
</style>
