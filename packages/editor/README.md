# @squirkle-ui/editor

Rich-text editor for [Squirkle UI](https://www.npmjs.com/package/squirkle-ui), built on [Tiptap](https://tiptap.dev) (`@tiptap/core` + StarterKit). One source for Vue 3 and Vue 2.7, SSR-safe (the editor is created on mount).

## Install
```bash
npm i @squirkle-ui/editor @squirkle-ui/ui
pnpm add @squirkle-ui/editor @squirkle-ui/ui
```
Or get every component and add-on with [`squirkle-ui`](https://www.npmjs.com/package/squirkle-ui) and import from `squirkle-ui/editor`.

Peer dependencies: `vue`, `@squirkle-ui/ui`. Set up `@squirkle-ui/ui` first (`app.use(createSquirkle())` and `@squirkle-ui/ui/styles.css`).

## Usage
```ts
import { SqEditor } from '@squirkle-ui/editor'        // Vue 3
// import { SqEditor } from '@squirkle-ui/editor/vue2' // Vue 2.7
import '@squirkle-ui/editor/styles.css'
```
```vue
<template>
  <SqEditor v-model="html" label="Notes" placeholder="Write something…" />
  <!-- JSON output and a custom toolbar -->
  <SqEditor v-model="doc" output="json" :toolbar="[['bold', 'italic'], ['bulletList'], ['link']]" />
</template>
```
Key props: `modelValue` (HTML string, or Tiptap JSON with `output="json"`), `label`, `placeholder`, `hint`, `disabled`, `readonly`, `error`, `toolbar` (`true` · `false` · tool groups), `labels`, `minHeight`, `maxHeight`, `starterKit` (StarterKit options), `extensions` (extra Tiptap extensions). Events: `update:modelValue`, `focus`, `blur`, `ready` (the Tiptap `Editor`). `getEditor()` on the component ref returns the instance.

Toolbar tools: `bold`, `italic`, `underline`, `strike`, `code`, `h1`–`h3`, `bulletList`, `orderedList`, `blockquote`, `codeBlock`, `hr`, `link`, `undo`, `redo`.

**Content safety:** HTML from `v-model` or paste is parsed against the editor schema, so unknown tags and attributes (scripts, event handlers) are dropped, and the Link extension refuses `javascript:` URLs. If you render the saved HTML elsewhere, still sanitize it on the server.

**Nuxt 2:** the module adds Tiptap / ProseMirror to `build.transpile` when the `editor` add-on is enabled (webpack 4 cannot parse their ES2020 syntax).

## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
