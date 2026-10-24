<template>
  <transition name="sq-window-x">
    <div v-show="isSelected" class="sq-window-item" role="tabpanel"><slot /></div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useGroupItem } from '../composables/group'

export default defineComponent({
  name: 'SqWindowItem',
  props: { value: { type: [String, Number], default: undefined } },
  setup(props) {
    return { isSelected: useGroupItem('sq-window', () => props.value).isSelected }
  },
})
</script>
