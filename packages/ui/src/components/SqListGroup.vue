<template>
  <div class="sq-list-group" :class="{ 'sq-list-group--open': model }">
    <SqListItem :title="title" :prepend-icon="prependIcon" link :aria-expanded="!!model ? 'true' : 'false'" @click="model = !model">
      <template #append><SqIcon icon="chevronDown" class="sq-list-group__chevron" /></template>
    </SqListItem>
    <SqExpandTransition>
      <div v-show="model" class="sq-list-group__items"><slot /></div>
    </SqExpandTransition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SqListItem from './SqListItem.vue'
import SqIcon from './SqIcon.vue'
import SqExpandTransition from './SqExpandTransition.vue'
import { useProxiedModel, vModel } from '../composables/model'

export default defineComponent({
  name: 'SqListGroup',
  components: { SqListItem, SqIcon, SqExpandTransition },
  model: vModel,
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: undefined },
    prependIcon: { type: String, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return { model: useProxiedModel<boolean>(props, emit) }
  },
})
</script>

<style>
.sq-list-group__chevron { transition: transform var(--sq-duration) var(--sq-ease); }
.sq-list-group--open > .sq-list-item .sq-list-group__chevron { transform: rotate(180deg); }
.sq-list-group__items { padding-inline-start: var(--sq-space-6); }
</style>
