<template>
  <div class="sq-expansion-panels" :class="`sq-expansion-panels--${variant}`"><slot /></div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useProxiedModel, vModel } from '../composables/model'
import { provideGroup } from '../composables/group'

export default defineComponent({
  name: 'SqExpansionPanels',
  model: vModel,
  props: {
    modelValue: { type: [String, Number, Array], default: undefined },
    multiple: Boolean,
    variant: { type: String as PropType<'default' | 'separated' | 'inset'>, default: 'default' },
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<unknown>(props, emit, 'modelValue', () => (props.multiple ? [] : undefined))
    provideGroup('sq-expansion', model, props)
  },
})
</script>

<style>
.sq-expansion-panels { display: flex; flex-direction: column; }
.sq-expansion-panels--default { border: 1px solid var(--sq-border); border-radius: var(--sq-radius-xl); overflow: hidden; background: var(--sq-surface); }
.sq-expansion-panels--default > .sq-expansion-panel + .sq-expansion-panel { border-top: 1px solid var(--sq-border); }
.sq-expansion-panels--separated, .sq-expansion-panels--inset { gap: var(--sq-space-2); }
.sq-expansion-panels--inset > .sq-expansion-panel:not(.sq-expansion-panel--open) { margin: 0 var(--sq-space-4); }
</style>
