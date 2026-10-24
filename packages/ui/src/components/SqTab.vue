<template>
  <button
    type="button"
    class="sq-tab sq-focusable"
    :class="{ 'sq-tab--active': isSelected }"
    role="tab"
    :aria-selected="isSelected ? 'true' : 'false'"
    :tabindex="isSelected ? 0 : -1"
    :disabled="disabled"
    @click="toggleOn"
  >
    <SqIcon v-if="prependIcon" :icon="prependIcon" size="18px" />
    <span><slot>{{ text }}</slot></span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SqIcon from './SqIcon.vue'
import { useGroupItem } from '../composables/group'

export default defineComponent({
  name: 'SqTab',
  components: { SqIcon },
  props: {
    text: { type: String, default: undefined },
    value: { type: [String, Number], default: undefined },
    prependIcon: { type: String, default: undefined },
    disabled: Boolean,
  },
  setup(props) {
    const item = useGroupItem('sq-tabs', () => props.value)
    const toggleOn = () => !item.isSelected.value && item.toggle()
    return { isSelected: item.isSelected, toggleOn }
  },
})
</script>

<style>
.sq-tab { display: inline-flex; align-items: center; justify-content: center; gap: var(--sq-space-2); height: 38px; padding: 0 var(--sq-space-4); border: 0; background: none; color: var(--sq-muted); font: inherit; font-weight: var(--sq-weight-semibold); font-size: var(--sq-text-sm); white-space: nowrap; cursor: pointer; border-radius: var(--sq-radius-md); transition: color var(--sq-duration) var(--sq-ease); }
.sq-tab:hover { color: var(--sq-on-surface); }
.sq-tab--active { color: var(--sq-c); }
.sq-tabs--segmented .sq-tab--active { color: var(--sq-on-surface); }
.sq-tab:disabled { opacity: var(--sq-disabled-opacity); cursor: default; }
</style>
