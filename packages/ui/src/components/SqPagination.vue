<template>
  <nav class="sq-pagination" aria-label="Pagination">
    <SqBtn icon="chevronLeft" :variant="variant === 'flat' ? 'tonal' : 'text'" :size="size" :disabled="model <= 1 || disabled" :aria-label="messages.previous" @click="model = model - 1" />
    <SqBtn
      v-for="(p, i) in pages"
      :key="i"
      :variant="p === model ? 'flat' : 'text'"
      :color="p === model ? color : 'surface'"
      :size="size"
      :disabled="disabled || p === '…'"
      :aria-current="p === model ? 'page' : undefined"
      class="sq-pagination__page"
      @click="typeof p === 'number' && (model = p)"
    >{{ p }}</SqBtn>
    <SqBtn icon="chevronRight" :variant="variant === 'flat' ? 'tonal' : 'text'" :size="size" :disabled="model >= length || disabled" :aria-label="messages.next" @click="model = model + 1" />
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import SqBtn from './SqBtn.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { config } from '../config'
import type { Size } from '../composables/style'

export default defineComponent({
  name: 'SqPagination',
  components: { SqBtn },
  model: vModel,
  props: {
    modelValue: { type: Number, default: 1 },
    length: { type: Number, default: 1 },
    totalVisible: { type: Number, default: 7 },
    color: { type: String, default: 'primary' },
    size: { type: String as PropType<Size>, default: 'small' },
    variant: { type: String, default: 'text' },
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<number>(props, emit)
    const pages = computed<(number | '…')[]>(() => {
      const n = props.length
      const max = Math.max(5, props.totalVisible)
      if (n <= max) return Array.from({ length: n }, (_, i) => i + 1)
      const cur = model.value
      const side = Math.floor((max - 3) / 2)
      let start = Math.max(2, cur - side)
      let end = Math.min(n - 1, cur + side)
      if (cur - side <= 2) end = max - 2
      if (cur + side >= n - 1) start = n - max + 3
      const out: (number | '…')[] = [1]
      if (start > 2) out.push('…')
      for (let i = start; i <= end; i++) out.push(i)
      if (end < n - 1) out.push('…')
      out.push(n)
      return out
    })
    return { model, pages, messages: computed(() => config.locale.messages) }
  },
})
</script>

<style>
.sq-pagination { display: flex; align-items: center; gap: 2px; flex-wrap: wrap; }
.sq-pagination__page { font-variant-numeric: tabular-nums; }
</style>
