<template>
  <div class="sq-rating" :class="{ 'sq-rating--readonly': readonly, 'sq-disabled': disabled }" role="radiogroup" :aria-label="label" @mouseleave="hover = -1">
    <button
      v-for="i in length"
      :key="i"
      type="button"
      class="sq-rating__item sq-focusable"
      role="radio"
      :aria-checked="model === i ? 'true' : 'false'"
      :aria-label="`${i} / ${length}`"
      :tabindex="readonly ? -1 : 0"
      :style="{ color: i <= display ? colorValue(color) : undefined }"
      @mouseenter="!readonly && (hover = i)"
      @click="select(i)"
      @keydown.left.prevent="select(Math.max(1, (model || 1) - 1))"
      @keydown.right.prevent="select(Math.min(length, (model || 0) + 1))"
    >
      <SqIcon :icon="i <= display ? fullIcon : emptyIcon" :size="size" />
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import SqIcon from './SqIcon.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { colorValue } from '../composables/style'

export default defineComponent({
  name: 'SqRating',
  components: { SqIcon },
  model: vModel,
  props: {
    modelValue: { type: Number, default: 0 },
    length: { type: Number, default: 5 },
    color: { type: String, default: 'warning' },
    fullIcon: { type: String, default: 'star' },
    emptyIcon: { type: String, default: 'starOutline' },
    size: { type: [String, Number], default: 'large' },
    readonly: Boolean,
    disabled: Boolean,
    clearable: Boolean,
    label: { type: String, default: 'Rating' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<number>(props, emit)
    const hover = ref(-1)
    const display = computed(() => (hover.value > 0 ? hover.value : model.value))
    const select = (i: number) => {
      if (props.readonly || props.disabled) return
      model.value = props.clearable && model.value === i ? 0 : i
    }
    return { model, hover, display, select, colorValue }
  },
})
</script>

<style>
.sq-rating { display: inline-flex; gap: 2px; }
.sq-rating__item { display: inline-flex; padding: 2px; border: 0; background: none; color: var(--sq-border-strong); cursor: pointer; border-radius: var(--sq-radius-xs); transition: transform var(--sq-duration-fast) var(--sq-ease-spring); }
.sq-rating__item:hover { transform: scale(1.15); }
.sq-rating--readonly .sq-rating__item { cursor: default; transform: none; }
</style>
