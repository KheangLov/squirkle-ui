<template>
  <div class="sq-stepper" :class="{ 'sq-stepper--vertical': vertical }">
    <div class="sq-stepper__header" role="list">
      <div v-for="(s, i) in normalized" :key="i" class="sq-stepper__step" :class="{ 'sq-stepper__step--active': i + 1 === model, 'sq-stepper__step--done': i + 1 < model }" role="listitem" :aria-current="i + 1 === model ? 'step' : undefined">
        <button type="button" class="sq-stepper__marker sq-squircle sq-focusable" :disabled="!editable && i + 1 > model" @click="(editable || i + 1 < model) && (model = i + 1)">
          <SqIcon v-if="i + 1 < model" icon="check" size="16px" /><span v-else>{{ i + 1 }}</span>
        </button>
        <div class="sq-stepper__labels">
          <div class="sq-stepper__title">{{ s.title }}</div>
          <div v-if="s.subtitle" class="sq-stepper__subtitle">{{ s.subtitle }}</div>
        </div>
        <div v-if="i < normalized.length - 1" class="sq-stepper__line"></div>
      </div>
    </div>
    <div class="sq-stepper__body"><slot :step="model" :next="next" :prev="prev" :is-last="model === normalized.length" /></div>
    <div v-if="!hideActions" class="sq-stepper__actions">
      <SqBtn variant="text" color="surface" :disabled="model <= 1" @click="prev">{{ messages.previous }}</SqBtn>
      <SqBtn :disabled="model > normalized.length" @click="next">{{ model === normalized.length ? finishText : messages.next }}</SqBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import SqIcon from './SqIcon.vue'
import SqBtn from './SqBtn.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { config } from '../config'

export default defineComponent({
  name: 'SqStepper',
  components: { SqIcon, SqBtn },
  model: vModel,
  props: {
    modelValue: { type: Number, default: 1 },
    items: { type: Array as PropType<(string | { title: string; subtitle?: string })[]>, default: () => [] },
    vertical: Boolean,
    editable: Boolean,
    hideActions: Boolean,
    finishText: { type: String, default: 'Finish' },
  },
  emits: ['update:modelValue', 'finish'],
  setup(props, { emit }) {
    const model = useProxiedModel<number>(props, emit)
    const normalized = computed(() => props.items.map((s) => (typeof s === 'string' ? { title: s } : s)) as { title: string; subtitle?: string }[])
    const next = () => (model.value < normalized.value.length ? (model.value = model.value + 1) : emit('finish'))
    const prev = () => model.value > 1 && (model.value = model.value - 1)
    return { model, normalized, next, prev, messages: computed(() => config.locale.messages) }
  },
})
</script>

<style>
.sq-stepper__header { display: flex; gap: var(--sq-space-2); overflow-x: auto; padding-bottom: var(--sq-space-4); }
.sq-stepper__step { display: flex; align-items: center; gap: var(--sq-space-2); flex: 1; min-width: max-content; }
.sq-stepper__marker { --sq-r: var(--sq-radius-sm); display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: 0; flex: none; font: inherit; font-size: var(--sq-text-sm); font-weight: var(--sq-weight-bold); background: var(--sq-surface-variant); color: var(--sq-muted); cursor: pointer; }
.sq-stepper__marker:disabled { cursor: default; }
.sq-stepper__step--active .sq-stepper__marker, .sq-stepper__step--done .sq-stepper__marker { background: var(--sq-primary); color: var(--sq-on-primary); }
.sq-stepper__step--active .sq-stepper__marker { box-shadow: 0 0 0 4px color-mix(in srgb, var(--sq-primary) 20%, transparent); }
.sq-stepper__title { font-size: var(--sq-text-sm); font-weight: var(--sq-weight-semibold); }
.sq-stepper__subtitle { font-size: var(--sq-text-xs); color: var(--sq-muted); }
.sq-stepper__step:not(.sq-stepper__step--active):not(.sq-stepper__step--done) .sq-stepper__title { color: var(--sq-muted); }
.sq-stepper__line { flex: 1; height: 2px; min-width: 24px; background: var(--sq-border); border-radius: 2px; }
.sq-stepper__step--done .sq-stepper__line { background: var(--sq-primary); }
.sq-stepper__actions { display: flex; justify-content: space-between; margin-top: var(--sq-space-4); }
.sq-stepper--vertical .sq-stepper__header { flex-direction: column; }
.sq-stepper--vertical .sq-stepper__line { display: none; }
</style>
