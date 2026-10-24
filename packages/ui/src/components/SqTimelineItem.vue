<template>
  <div class="sq-timeline-item" role="listitem">
    <div class="sq-timeline-item__opposite"><slot name="opposite" /></div>
    <div class="sq-timeline-item__dot sq-squircle" :class="{ 'sq-timeline-item__dot--small': small }" :style="{ '--sq-c': colorValue(color) }">
      <SqIcon v-if="icon" :icon="icon" size="16px" />
    </div>
    <div class="sq-timeline-item__body">
      <div v-if="title" class="sq-timeline-item__title">{{ title }}</div>
      <div v-if="time" class="sq-timeline-item__time">{{ time }}</div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SqIcon from './SqIcon.vue'
import { colorValue } from '../composables/style'

export default defineComponent({
  name: 'SqTimelineItem',
  components: { SqIcon },
  props: {
    title: { type: String, default: undefined },
    time: { type: String, default: undefined },
    icon: { type: String, default: undefined },
    color: { type: String, default: 'primary' },
    small: Boolean,
  },
  setup: () => ({ colorValue }),
})
</script>

<style>
.sq-timeline-item { position: relative; display: grid; grid-template-columns: 0 32px 1fr; gap: var(--sq-space-3); padding-bottom: var(--sq-space-5); }
.sq-timeline-item__opposite { display: none; }
.sq-timeline--alternate .sq-timeline-item { grid-template-columns: 1fr 32px 1fr; }
.sq-timeline--alternate .sq-timeline-item__opposite { display: block; text-align: end; color: var(--sq-muted); font-size: var(--sq-text-sm); padding-top: 4px; }
.sq-timeline--alternate .sq-timeline-item:nth-child(even) .sq-timeline-item__body { grid-column: 1; grid-row: 1; text-align: end; }
.sq-timeline--alternate .sq-timeline-item:nth-child(even) .sq-timeline-item__opposite { grid-column: 3; text-align: start; }
.sq-timeline-item__dot { --sq-r: var(--sq-radius-sm); position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: var(--sq-c); color: #fff; box-shadow: 0 0 0 4px var(--sq-background); }
.sq-timeline-item__dot--small { width: 14px; height: 14px; margin: 9px; --sq-r: var(--sq-radius-xs); }
.sq-timeline-item__title { font-weight: var(--sq-weight-semibold); padding-top: 4px; }
.sq-timeline-item__time { font-size: var(--sq-text-xs); color: var(--sq-muted); margin-bottom: var(--sq-space-1); }
.sq-timeline--dense .sq-timeline-item { padding-bottom: var(--sq-space-3); }
</style>
