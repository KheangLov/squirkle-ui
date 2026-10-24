<template>
  <div class="sq-chip-group" :class="{ 'sq-chip-group--column': column }" role="group"><slot /></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useProxiedModel, vModel } from '../composables/model'
import { provideGroup } from '../composables/group'

export default defineComponent({
  name: 'SqChipGroup',
  model: vModel,
  props: {
    modelValue: { type: [String, Number, Boolean, Object, Array], default: undefined },
    multiple: Boolean,
    mandatory: Boolean,
    max: { type: Number, default: undefined },
    column: Boolean,
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<unknown>(props, emit, 'modelValue', () => (props.multiple ? [] : undefined))
    provideGroup('sq-chip-group', model, props)
  },
})
</script>

<style>
.sq-chip-group { display: flex; gap: var(--sq-space-2); overflow-x: auto; padding: 2px; scrollbar-width: none; }
.sq-chip-group--column { flex-wrap: wrap; overflow: visible; }
</style>
