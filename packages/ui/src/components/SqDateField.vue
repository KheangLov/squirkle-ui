<template>
  <SqMenu v-model="menu" :close-on-content-click="false" location="bottom start">
    <template #activator>
      <SqTextField
        :model-value="display"
        v-bind="$attrs"
        :label="label"
        :placeholder="placeholder"
        :clearable="clearable"
        :disabled="disabled"
        :rules="rules"
        prepend-inner-icon="calendar"
        readonly
        @click:clear="model = range ? [] : undefined"
      />
    </template>
    <SqDatePicker v-model="model" flat :range="range" :min="min" :max="max" :first-day-of-week="firstDayOfWeek" @update:modelValue="onPick" />
  </SqMenu>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue'
import { formatDate } from '@squirkle/core'
import SqMenu from './SqMenu.vue'
import SqTextField from './SqTextField.vue'
import SqDatePicker from './SqDatePicker.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { config } from '../config'
import type { ValidationRule } from '../composables/validation'

/** Text field + date picker popup. */
export default defineComponent({
  name: 'SqDateField',
  components: { SqMenu, SqTextField, SqDatePicker },
  inheritAttrs: false,
  model: vModel,
  props: {
    modelValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    label: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    range: Boolean,
    clearable: Boolean,
    disabled: Boolean,
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    firstDayOfWeek: { type: Number, default: 0 },
    rules: { type: Array as PropType<ValidationRule[]>, default: () => [] },
    format: { type: Object as PropType<Intl.DateTimeFormatOptions>, default: () => ({ dateStyle: 'medium' }) },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<string | string[] | undefined>(props, emit)
    const menu = ref(false)
    const display = computed(() => {
      const v = model.value
      const list = Array.isArray(v) ? v : v ? [v] : []
      return list.map((d) => formatDate(d, config.locale.code, props.format)).join(' – ')
    })
    const onPick = (v: string | string[]) => {
      if (!props.range || (Array.isArray(v) && v.length === 2)) menu.value = false
    }
    return { model, menu, display, onPick }
  },
})
</script>
