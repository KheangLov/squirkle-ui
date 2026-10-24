<template>
  <SqBtnGroup class="sq-btn-toggle" :rounded="rounded" :divided="divided"><slot /></SqBtnGroup>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SqBtnGroup from './SqBtnGroup.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { provideGroup } from '../composables/group'
import { roundedProp } from '../composables/style'

/** Segmented control: SqBtn children with `value` become toggles (v-model = value or array when multiple). */
export default defineComponent({
  name: 'SqBtnToggle',
  components: { SqBtnGroup },
  model: vModel,
  props: {
    modelValue: { type: [String, Number, Boolean, Object, Array], default: undefined },
    multiple: Boolean,
    mandatory: Boolean,
    disabled: Boolean,
    divided: Boolean,
    rounded: { ...roundedProp, default: 'md' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<unknown>(props, emit, 'modelValue', () => (props.multiple ? [] : undefined))
    provideGroup('sq-btn-toggle', model, props)
  },
})
</script>

<style>
.sq-btn-toggle > .sq-btn:not(.sq-btn--active) { --sq-bg: transparent !important; --sq-fg: var(--sq-on-surface-variant) !important; --sq-bd: transparent !important; }
.sq-btn-toggle > .sq-btn--active { --sq-shadow: var(--sq-elevation-1); --sq-shadow-filter: var(--sq-elevation-1-filter); }
</style>
