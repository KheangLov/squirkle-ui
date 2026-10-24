<template>
  <div class="sq-portal">
    <div ref="layer" class="sq-portal__layer" :class="scopeClass"><slot /></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, type PropType, type Ref } from 'vue'

/**
 * Vue 2/3-compatible replacement for <Teleport>: moves its layer element to `target` after mount.
 * The layer is the root's only child and is never re-inserted by Vue, so patching stays valid.
 */
export default defineComponent({
  name: 'SqPortal',
  props: {
    target: { type: null as unknown as PropType<string | HTMLElement>, default: 'body' },
    disabled: Boolean,
  },
  setup(props) {
    const layer = ref<HTMLElement | null>(null)
    const scopedTheme = inject<Ref<string> | null>('sq-theme-scope', null)
    const scopeClass = computed(() => (scopedTheme?.value ? `sq-theme--${scopedTheme.value}` : undefined))
    let moved = false
    onMounted(() => {
      if (props.disabled || !layer.value) return
      const target = typeof props.target === 'string' ? document.querySelector(props.target) : props.target
      if (target) {
        target.appendChild(layer.value)
        moved = true
      }
    })
    onBeforeUnmount(() => {
      if (moved) layer.value?.remove()
    })
    return { layer, scopeClass }
  },
})
</script>
