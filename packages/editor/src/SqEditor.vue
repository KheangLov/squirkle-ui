<template>
  <div class="sq-editor" :class="{ 'sq-editor--focused': focused, 'sq-editor--disabled': disabled, 'sq-editor--readonly': readonly, 'sq-editor--error': error, 'sq-editor--empty': empty }" :style="rootStyle">
    <label v-if="label" class="sq-editor__label" :for="id">{{ label }}</label>
    <div class="sq-editor__control sq-surface">
      <SqShape />
      <div v-if="groups.length && !readonly" class="sq-editor__toolbar" role="toolbar" :aria-label="label ? `${label} formatting` : 'Formatting'">
        <div v-for="(group, gi) in groups" :key="gi" class="sq-editor__group">
          <button
            v-for="tool in group"
            :key="tool"
            type="button"
            class="sq-editor__tool sq-squircle"
            :class="{ 'sq-editor__tool--active': isActive(tool), 'sq-editor__tool--text': !TOOLS[tool].icon }"
            :title="toolLabel(tool)"
            :aria-label="toolLabel(tool)"
            :aria-pressed="pressed(tool)"
            :disabled="disabled || !canRun(tool)"
            @mousedown.prevent
            @click="onTool(tool, $event)"
          >
            <SqIcon v-if="TOOLS[tool].icon" :icon="TOOLS[tool].icon" size="18px" />
            <span v-else :class="TOOLS[tool].textClass">{{ TOOLS[tool].text }}</span>
          </button>
        </div>
      </div>
      <SqMenu v-model="linkMenu" :activator="linkAnchor" :close-on-content-click="false" :open-on-click="false" location="bottom start">
        <form ref="linkForm" class="sq-editor__link" @submit.prevent="applyLink">
          <SqTextField v-model="linkHref" density="compact" placeholder="https://" hide-details :aria-label="toolLabel('link')" />
          <SqBtn type="submit" size="small">{{ labels.apply ?? 'Apply' }}</SqBtn>
          <SqBtn v-if="isActive('link')" size="small" variant="text" color="surface" @click="removeLink">{{ labels.remove ?? 'Remove' }}</SqBtn>
        </form>
      </SqMenu>
      <div :id="id" ref="content" class="sq-editor__content" :style="contentStyle"></div>
    </div>
    <div v-if="hint" class="sq-editor__hint">{{ hint }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import { Editor, type AnyExtension, type JSONContent } from '@tiptap/core'
import StarterKit, { type StarterKitOptions } from '@tiptap/starter-kit'
import { SqBtn, SqIcon, SqMenu, SqShape, SqTextField, colorValue, radiusValue, useUid, vModel } from '@squirkle-ui/ui'
import { DEFAULT_TOOLBAR, TOOLS, ch, type EditorTool } from './tools'

type Content = string | JSONContent | null | undefined

/**
 * Rich-text editor on Tiptap (`@tiptap/core` + StarterKit), mounted on a plain element so one source
 * runs on Vue 2.7 and Vue 3. The Editor is created in `onMounted` only (SSR-safe) and kept out of
 * reactive state; toolbar state re-reads it through a transaction counter.
 * Pasted / v-model HTML is parsed against the editor schema, so tags and attributes outside it are dropped.
 */
export default defineComponent({
  name: 'SqEditor',
  components: { SqBtn, SqIcon, SqMenu, SqShape, SqTextField },
  model: vModel,
  props: {
    /** HTML string (`output="html"`) or Tiptap JSON (`output="json"`). */
    modelValue: { type: [String, Object] as PropType<Content>, default: '' },
    output: { type: String as PropType<'html' | 'json'>, default: 'html' },
    label: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    hint: { type: String, default: undefined },
    disabled: Boolean,
    readonly: Boolean,
    error: Boolean,
    autofocus: Boolean,
    /** `true` = default groups, `false` = none, or tool groups, e.g. `[['bold', 'italic'], ['link']]`. */
    toolbar: { type: [Boolean, Array] as PropType<boolean | EditorTool[][]>, default: true },
    /** Override tool labels (and `apply` / `remove` in the link popover). */
    labels: { type: Object as PropType<Partial<Record<EditorTool | 'apply' | 'remove', string>>>, default: () => ({}) },
    minHeight: { type: [Number, String], default: 160 },
    maxHeight: { type: [Number, String], default: undefined },
    color: { type: String, default: 'primary' },
    rounded: { type: [String, Number], default: 'md' },
    /** Options for StarterKit (e.g. `{ heading: { levels: [2, 3] } }`). */
    starterKit: { type: Object as PropType<Partial<StarterKitOptions>>, default: undefined },
    /** Extra Tiptap extensions. */
    extensions: { type: Array as PropType<AnyExtension[]>, default: () => [] },
  },
  emits: ['update:modelValue', 'focus', 'blur', 'ready'],
  setup(props, { emit }) {
    const id = useUid('sq-editor')
    const content = ref<HTMLElement | null>(null)
    const focused = ref(false)
    const empty = ref(true)
    const tick = ref(0)
    let editor: Editor | null = null

    const serialize = (e: Editor) => (props.output === 'json' ? e.getJSON() : e.getHTML())
    const same = (a: Content, b: Content) => (typeof a === 'string' || typeof b === 'string' ? (a ?? '') === (b ?? '') : JSON.stringify(a) === JSON.stringify(b))

    const groups = computed<EditorTool[][]>(() => (props.toolbar === true ? DEFAULT_TOOLBAR : props.toolbar === false ? [] : props.toolbar))
    const toolLabel = (t: EditorTool) => props.labels[t] ?? TOOLS[t].label
    // Reading `tick` makes these re-evaluate after every editor transaction.
    const isActive = (t: EditorTool) => tick.value >= 0 && !!editor && !!TOOLS[t].active?.(editor)
    const pressed = (t: EditorTool) => (TOOLS[t].toggle ? isActive(t) : undefined)
    const canRun = (t: EditorTool) => {
      const can = TOOLS[t].can
      return tick.value >= 0 && !!editor && (can ? can(editor) : true)
    }

    // link popover
    const linkMenu = ref(false)
    const linkHref = ref('')
    const linkAnchor = ref<HTMLElement | undefined>(undefined)
    const linkForm = ref<HTMLElement | null>(null)
    watch(linkMenu, (open) => open && nextTick(() => linkForm.value?.querySelector('input')?.focus()))
    const onTool = (t: EditorTool, e: MouseEvent) => {
      if (!editor) return
      if (t === 'link') {
        linkHref.value = (editor.getAttributes('link').href as string | undefined) ?? ''
        linkAnchor.value = e.currentTarget as HTMLElement
        linkMenu.value = true
        return
      }
      TOOLS[t].run(editor)
    }
    const applyLink = () => {
      if (!editor) return
      const raw = linkHref.value.trim()
      // Bare domains become https links; schemes, paths and anchors are kept as typed.
      const href = !raw || /^[a-z][a-z\d+.-]*:/i.test(raw) || /^[/#?]/.test(raw) ? raw : `https://${raw}`
      // setLink refuses URLs the Link extension does not allow (e.g. `javascript:`).
      if (href) ch(editor).extendMarkRange('link').setLink({ href }).run()
      else ch(editor).extendMarkRange('link').unsetLink().run()
      linkMenu.value = false
    }
    const removeLink = () => {
      if (editor) ch(editor).extendMarkRange('link').unsetLink().run()
      linkMenu.value = false
    }

    onMounted(() => {
      if (!content.value) return
      editor = new Editor({
        element: content.value,
        content: props.modelValue || '',
        editable: !props.disabled && !props.readonly,
        autofocus: props.autofocus,
        // trailingNode off: it appends an empty paragraph on load, which would rewrite v-model before any edit.
        extensions: [StarterKit.configure({ link: { openOnClick: false, autolink: true, defaultProtocol: 'https' }, trailingNode: false, ...props.starterKit }), ...props.extensions],
        editorProps: { attributes: { class: 'sq-editor__prose', role: 'textbox', 'aria-multiline': 'true', ...(props.label ? {} : { 'aria-label': props.placeholder ?? 'Rich text' }) } },
        onTransaction: () => { tick.value++ },
        onUpdate: ({ editor: e }) => {
          empty.value = e.isEmpty
          emit('update:modelValue', serialize(e))
        },
        onFocus: ({ event }) => { focused.value = true; emit('focus', event) },
        onBlur: ({ event }) => { focused.value = false; emit('blur', event) },
      })
      empty.value = editor.isEmpty
      emit('ready', editor)
    })
    onBeforeUnmount(() => { editor?.destroy(); editor = null })

    watch(() => props.modelValue, (v) => {
      if (!editor || same(v, serialize(editor))) return
      editor.commands.setContent(v || '', { emitUpdate: false })
      empty.value = editor.isEmpty
    })
    watch(() => [props.disabled, props.readonly], () => editor?.setEditable(!props.disabled && !props.readonly))

    const size = (v: number | string | undefined) => (v == null ? undefined : typeof v === 'number' ? `${v}px` : v)
    const rootStyle = computed(() => ({
      '--sq-field-color': colorValue(props.color),
      '--sq-r': radiusValue(props.rounded as string),
      '--sq-editor-placeholder': JSON.stringify(props.placeholder ?? ''),
    }))
    const contentStyle = computed(() => ({ minHeight: size(props.minHeight), maxHeight: size(props.maxHeight) }))
    /** The Tiptap Editor instance (null before mount / on the server). */
    const getEditor = () => editor

    return { TOOLS, id, content, focused, empty, groups, toolLabel, isActive, pressed, canRun, onTool, linkMenu, linkHref, linkAnchor, linkForm, applyLink, removeLink, rootStyle, contentStyle, getEditor }
  },
})
</script>

<style>
.sq-editor { display: flex; flex-direction: column; gap: 6px; min-width: 0; width: 100%; }
.sq-editor__label { font-size: var(--sq-text-sm); font-weight: var(--sq-weight-medium); color: var(--sq-on-surface-variant); }
.sq-editor__control { --sq-bg: var(--sq-surface); --sq-bd: var(--sq-border-strong); --sq-bw: 1px; display: flex; flex-direction: column; min-width: 0; color: var(--sq-on-surface); transition: box-shadow var(--sq-duration) var(--sq-ease); }
.sq-editor__control:hover { --sq-bd: color-mix(in srgb, var(--sq-on-surface) 45%, transparent); }
.sq-editor--focused .sq-editor__control { --sq-bd: var(--sq-field-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--sq-field-color) 22%, transparent); }
.sq-editor--focused .sq-editor__control[data-sq-shape] { box-shadow: none !important; --sq-shadow-filter: drop-shadow(0 0 3px color-mix(in srgb, var(--sq-field-color) 45%, transparent)); }
.sq-editor--error .sq-editor__control { --sq-bd: var(--sq-error); --sq-field-color: var(--sq-error); }
.sq-editor--disabled { opacity: var(--sq-disabled-opacity); pointer-events: none; }
.sq-editor--readonly .sq-editor__control { --sq-bg: var(--sq-surface-variant); }
.sq-editor__toolbar { position: relative; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: var(--sq-space-1); padding: var(--sq-space-1) var(--sq-space-2); border-bottom: 1px solid var(--sq-border); }
.sq-editor__group { display: flex; align-items: center; gap: 2px; }
.sq-editor__group + .sq-editor__group { padding-inline-start: var(--sq-space-1); border-inline-start: 1px solid var(--sq-border); }
.sq-editor__tool { --sq-r: var(--sq-radius-xs); display: inline-flex; align-items: center; justify-content: center; min-width: var(--sq-control-sm); height: var(--sq-control-sm); padding: 0 6px; border: 0; background: transparent; color: var(--sq-on-surface-variant); font: inherit; font-size: var(--sq-text-sm); font-weight: var(--sq-weight-semibold); cursor: pointer; transition: background-color var(--sq-duration-fast) var(--sq-ease), color var(--sq-duration-fast) var(--sq-ease); }
.sq-editor__tool:hover:not(:disabled) { background: color-mix(in srgb, var(--sq-on-surface) 8%, transparent); color: var(--sq-on-surface); }
.sq-editor__tool:focus-visible { outline: none; box-shadow: var(--sq-focus-ring); }
.sq-editor__tool--active { background: color-mix(in srgb, var(--sq-field-color) 14%, transparent); color: var(--sq-field-color); }
.sq-editor__tool:disabled { opacity: var(--sq-disabled-opacity); cursor: default; }
.sq-editor__mono { font-family: var(--sq-font-mono); font-size: var(--sq-text-xs); }
.sq-editor__link { display: flex; align-items: center; gap: var(--sq-space-2); width: 340px; max-width: calc(100vw - 32px); padding: var(--sq-space-2); }
.sq-editor__content { position: relative; display: flex; flex-direction: column; overflow-y: auto; cursor: text; }
.sq-editor__prose { flex: 1; padding: var(--sq-space-3); outline: none; font-size: var(--sq-text-md); line-height: var(--sq-leading); word-wrap: break-word; white-space: pre-wrap; }
.sq-editor__prose > :first-child { margin-top: 0; }
.sq-editor__prose > :last-child { margin-bottom: 0; }
.sq-editor__prose p { margin: 0 0 0.6em; }
.sq-editor__prose h1, .sq-editor__prose h2, .sq-editor__prose h3 { margin: 0.9em 0 0.4em; line-height: 1.25; font-weight: var(--sq-weight-semibold); letter-spacing: -0.01em; }
.sq-editor__prose h1 { font-size: var(--sq-text-2xl); }
.sq-editor__prose h2 { font-size: var(--sq-text-xl); }
.sq-editor__prose h3 { font-size: var(--sq-text-lg); }
.sq-editor__prose ul, .sq-editor__prose ol { margin: 0 0 0.6em; padding-inline-start: 1.4em; }
.sq-editor__prose li > p { margin: 0.15em 0; }
.sq-editor__prose blockquote { margin: 0 0 0.6em; padding-inline-start: var(--sq-space-3); border-inline-start: 3px solid var(--sq-border-strong); color: var(--sq-on-surface-variant); }
.sq-editor__prose code { padding: 0.1em 0.35em; border-radius: var(--sq-radius-xs); background: var(--sq-surface-variant); font-family: var(--sq-font-mono); font-size: 0.9em; }
.sq-editor__prose pre { margin: 0 0 0.6em; padding: var(--sq-space-3); border-radius: var(--sq-radius-md); background: var(--sq-surface-variant); font-family: var(--sq-font-mono); font-size: var(--sq-text-sm); overflow-x: auto; white-space: pre; }
.sq-editor__prose pre code { padding: 0; background: none; font-size: inherit; }
.sq-editor__prose hr { margin: 1em 0; border: 0; border-top: 1px solid var(--sq-border); }
.sq-editor__prose hr.ProseMirror-selectednode { border-top-color: var(--sq-field-color); }
.sq-editor__prose a { color: var(--sq-primary); text-decoration: underline; text-underline-offset: 2px; }
.sq-editor--empty .sq-editor__prose > p:first-child::before { content: var(--sq-editor-placeholder); float: left; height: 0; color: var(--sq-muted); opacity: 0.8; pointer-events: none; }
.sq-editor__hint { font-size: var(--sq-text-xs); color: var(--sq-muted); }
.sq-editor--error .sq-editor__hint { color: var(--sq-error); }
</style>
