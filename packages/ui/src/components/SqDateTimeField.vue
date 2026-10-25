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
        @click:clear="model = undefined"
      />
    </template>
    <div class="sq-datetime-field__menu">
      <SqDateTimePicker v-model="model" flat :min="min" :max="max" :first-day-of-week="firstDayOfWeek" :format="timeFormat" :use-seconds="useSeconds" :minute-step="minuteStep" />
      <div class="sq-datetime-field__actions">
        <SqBtn variant="tonal" size="small" @click="menu = false">{{ messages.close }}</SqBtn>
      </div>
    </div>
  </SqMenu>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue'
import { formatDate } from '@squirkle-ui/core'
import SqBtn from './SqBtn.vue'
import SqMenu from './SqMenu.vue'
import SqTextField from './SqTextField.vue'
import SqDateTimePicker from './SqDateTimePicker.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { config } from '../config'
import type { ValidationRule } from '../composables/validation'

/** Text field + date & time picker popup. v-model: local `YYYY-MM-DDTHH:mm`. */
export default defineComponent({
  name: 'SqDateTimeField',
  components: { SqBtn, SqMenu, SqTextField, SqDateTimePicker },
  inheritAttrs: false,
  model: vModel,
  props: {
    modelValue: { type: String, default: undefined },
    label: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    clearable: Boolean,
    disabled: Boolean,
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    firstDayOfWeek: { type: Number, default: 0 },
    timeFormat: { type: String as PropType<'24hr' | 'ampm'>, default: '24hr' },
    useSeconds: Boolean,
    minuteStep: { type: Number, default: 5 },
    rules: { type: Array as PropType<ValidationRule[]>, default: () => [] },
    format: { type: Object as PropType<Intl.DateTimeFormatOptions>, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<string | undefined>(props, emit)
    const menu = ref(false)
    const display = computed(() => {
      if (!model.value) return ''
      const opts = props.format ?? { dateStyle: 'medium', timeStyle: props.useSeconds ? 'medium' : 'short', hour12: props.timeFormat === 'ampm' }
      return formatDate(model.value, config.locale.code, opts)
    })
    return { model, menu, display, messages: config.locale.messages }
  },
})
</script>

<style>
.sq-datetime-field__menu { display: flex; flex-direction: column; gap: var(--sq-space-3); padding: var(--sq-space-3); }
.sq-datetime-field__actions { display: flex; justify-content: flex-end; }
</style>
