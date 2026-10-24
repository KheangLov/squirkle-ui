<template>
  <label class="sq-switch" :class="{ 'sq-switch--on': checked, 'sq-disabled': disabled, 'sq-switch--inset': inset }" :style="{ '--sq-c': colorValue(color) }">
    <input class="sq-sr-only" type="checkbox" role="switch" :checked="checked" :disabled="disabled" :aria-checked="checked ? 'true' : 'false'" @change="toggle" />
    <span class="sq-switch__track sq-squircle" aria-hidden="true">
      <span class="sq-switch__thumb sq-squircle">
        <SqProgressCircular v-if="loading" indeterminate :size="12" :width="2" color="primary" />
      </span>
    </span>
    <span v-if="label || has('default')" class="sq-switch__label"><slot>{{ label }}</slot></span>
  </label>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SqProgressCircular from './SqProgressCircular.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { colorValue } from '../composables/style'

export default defineComponent({
  name: 'SqSwitch',
  components: { SqProgressCircular },
  model: vModel,
  props: {
    modelValue: { type: [Boolean, String, Number], default: false },
    trueValue: { type: [Boolean, String, Number], default: true },
    falseValue: { type: [Boolean, String, Number], default: false },
    label: { type: String, default: undefined },
    color: { type: String, default: 'primary' },
    inset: Boolean,
    loading: Boolean,
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const model = useProxiedModel<unknown>(props, emit)
    const checked = computed(() => model.value === props.trueValue)
    const toggle = () => (model.value = checked.value ? props.falseValue : props.trueValue)
    return { checked, toggle, colorValue, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-switch { display: inline-flex; align-items: center; gap: var(--sq-space-3); min-height: 32px; cursor: pointer; user-select: none; }
.sq-switch__track { --sq-r: var(--sq-radius-pill); position: relative; display: inline-block; width: 42px; height: 24px; flex: none; background: var(--sq-border-strong); transition: background var(--sq-duration) var(--sq-ease); }
.sq-switch__thumb { --sq-r: var(--sq-radius-pill); position: absolute; top: 3px; left: 3px; display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / 0.25); transition: transform var(--sq-duration) var(--sq-ease-spring), width var(--sq-duration-fast) var(--sq-ease); }
.sq-switch:active .sq-switch__thumb { width: 22px; }
.sq-switch--on .sq-switch__track { background: var(--sq-c); }
.sq-switch--on .sq-switch__thumb { transform: translateX(18px); }
.sq-switch--on:active .sq-switch__thumb { transform: translateX(14px); }
.sq-switch--inset .sq-switch__track { width: 52px; height: 32px; }
.sq-switch--inset .sq-switch__thumb { width: 26px; height: 26px; }
.sq-switch--inset.sq-switch--on .sq-switch__thumb { transform: translateX(20px); }
.sq-switch input:focus-visible + .sq-switch__track { box-shadow: var(--sq-focus-ring); }
</style>
