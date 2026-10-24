<template>
  <SqPortal>
    <transition name="sq-fade">
      <div v-if="model" class="sq-overlay" :class="{ 'sq-overlay--contained': contained }" :style="{ zIndex: z, '--sq-scrim-opacity': opacity }" @click.self="!persistent && (model = false)">
        <slot />
      </div>
    </transition>
  </SqPortal>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import SqPortal from './SqPortal.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { nextZIndex } from '../composables/dom'

/** Full-screen scrim with centered content (loading states, custom modals). */
export default defineComponent({
  name: 'SqOverlay',
  components: { SqPortal },
  model: vModel,
  props: {
    modelValue: { type: Boolean, default: false },
    persistent: Boolean,
    contained: Boolean,
    opacity: { type: [Number, String], default: 0.45 },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<boolean>(props, emit)
    const z = ref(2000)
    watch(model, (v) => v && (z.value = nextZIndex()), { immediate: true })
    return { model, z }
  },
})
</script>

<style>
.sq-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--sq-overlay) calc(var(--sq-scrim-opacity) * 100%), transparent); }
.sq-overlay--contained { position: absolute; }
</style>
