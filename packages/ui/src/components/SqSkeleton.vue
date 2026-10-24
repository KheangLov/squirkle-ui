<template>
  <div class="sq-skeleton" :class="`sq-skeleton--${type}`" aria-busy="true" :aria-label="label">
    <div v-for="n in lines" :key="n" class="sq-skeleton__bone sq-squircle sq-skeleton-shimmer" :style="{ width: type === 'text' && n === lines && lines > 1 ? '60%' : undefined, height: toUnit(height) }"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { toUnit } from '@squirkle/core'
import { config } from '../config'

export default defineComponent({
  name: 'SqSkeleton',
  props: {
    type: { type: String as PropType<'text' | 'avatar' | 'card' | 'button' | 'image'>, default: 'text' },
    lines: { type: Number, default: 3 },
    height: { type: [Number, String], default: undefined },
  },
  setup: () => ({ toUnit, label: computed(() => config.locale.messages.loading) }),
})
</script>

<style>
.sq-skeleton { display: flex; flex-direction: column; gap: var(--sq-space-2); }
.sq-skeleton__bone { position: relative; --sq-r: var(--sq-radius-xs); height: 12px; }
.sq-skeleton--avatar .sq-skeleton__bone { --sq-r: var(--sq-radius-lg); width: 48px; height: 48px; }
.sq-skeleton--button .sq-skeleton__bone { --sq-r: var(--sq-radius-md); width: 110px; height: 38px; }
.sq-skeleton--card .sq-skeleton__bone, .sq-skeleton--image .sq-skeleton__bone { --sq-r: var(--sq-radius-xl); height: 160px; }
</style>
