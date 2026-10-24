<template>
  <div class="sq-file-input">
    <div
      class="sq-file-input__drop sq-surface"
      :class="{ 'sq-file-input__drop--over': over, 'sq-disabled': disabled }"
      :style="{ '--sq-r': 'var(--sq-radius-lg)', '--sq-bd': over ? 'var(--sq-primary)' : 'var(--sq-border-strong)', '--sq-bw': '1.5px', '--sq-bg': over ? 'color-mix(in srgb, var(--sq-primary) 6%, var(--sq-surface))' : 'var(--sq-surface)' }"
      role="button"
      tabindex="0"
      @click="pick"
      @keydown.enter.prevent="pick"
      @dragover.prevent="over = true"
      @dragleave="over = false"
      @drop.prevent="onDrop"
    >
      <SqShape :watch-key="over" />
      <SqIcon icon="attach" size="large" class="sq-file-input__icon" />
      <div class="sq-file-input__text"><slot>{{ label }}</slot></div>
      <div v-if="hint" class="sq-file-input__hint">{{ hint }}</div>
      <input ref="input" class="sq-sr-only" type="file" :accept="accept" :multiple="multiple" :disabled="disabled" tabindex="-1" @change="onChange" />
    </div>
    <div v-if="files.length && showList" class="sq-file-input__list">
      <SqChip v-for="(f, i) in files" :key="f.name + i" closable size="small" prepend-icon="attach" @click:close="remove(i)">{{ f.name }} · {{ size(f.size) }}</SqChip>
    </div>
    <div v-if="error" class="sq-file-input__error">{{ error }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import SqShape from './SqShape.vue'
import SqIcon from './SqIcon.vue'
import SqChip from './SqChip.vue'
import { useProxiedModel, vModel } from '../composables/model'

export default defineComponent({
  name: 'SqFileInput',
  components: { SqShape, SqIcon, SqChip },
  model: vModel,
  props: {
    modelValue: { type: Array as () => File[], default: undefined },
    label: { type: String, default: 'Drop files here or click to browse' },
    hint: { type: String, default: undefined },
    accept: { type: String, default: undefined },
    multiple: Boolean,
    /** Max size per file in bytes. */
    maxSize: { type: Number, default: undefined },
    disabled: Boolean,
    showList: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'rejected'],
  setup(props, { emit }) {
    const model = useProxiedModel<File[]>(props, emit, 'modelValue', () => [])
    const input = ref<HTMLInputElement | null>(null)
    const over = ref(false)
    const error = ref('')
    const files = computed(() => model.value ?? [])
    const add = (list: FileList | null) => {
      if (!list) return
      const incoming = Array.from(list)
      const tooBig = props.maxSize ? incoming.filter((f) => f.size > props.maxSize!) : []
      error.value = tooBig.length ? `${tooBig.map((f) => f.name).join(', ')} exceeds ${size(props.maxSize!)}` : ''
      if (tooBig.length) emit('rejected', tooBig)
      const ok = incoming.filter((f) => !tooBig.includes(f))
      model.value = props.multiple ? [...files.value, ...ok] : ok.slice(0, 1)
    }
    const pick = () => !props.disabled && input.value?.click()
    const onChange = (e: Event) => { add((e.target as HTMLInputElement).files); (e.target as HTMLInputElement).value = '' }
    const onDrop = (e: DragEvent) => { over.value = false; if (!props.disabled) add(e.dataTransfer?.files ?? null) }
    const remove = (i: number) => (model.value = files.value.filter((_, k) => k !== i))
    const size = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`)
    return { input, over, error, files, pick, onChange, onDrop, remove, size }
  },
})
</script>

<style>
.sq-file-input__drop { display: flex; flex-direction: column; align-items: center; gap: var(--sq-space-1); padding: var(--sq-space-6); border-style: dashed; cursor: pointer; text-align: center; outline: none; }
.sq-file-input__drop:focus-visible { box-shadow: var(--sq-focus-ring); }
.sq-file-input__icon { color: var(--sq-primary); }
.sq-file-input__text { font-weight: var(--sq-weight-medium); }
.sq-file-input__hint { font-size: var(--sq-text-xs); color: var(--sq-muted); }
.sq-file-input__list { display: flex; flex-wrap: wrap; gap: var(--sq-space-2); margin-top: var(--sq-space-2); }
.sq-file-input__error { margin-top: var(--sq-space-1); font-size: var(--sq-text-xs); color: var(--sq-error); }
</style>
