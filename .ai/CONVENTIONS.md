# CONVENTIONS
Purpose: how code is written here, with one real example path per rule.
Read when: writing or reviewing any component, composable or package code.

## Vue 2/3 compatibility (hard rules — see also `.ai/CODE_REVIEW.md`)
- `<script lang="ts">` + `defineComponent({ props, emits, setup })`, templates (no `<script setup>` in packages). Ex: `packages/ui/src/components/SqChip.vue`.
- Single root element; no `<template v-for>`; no `v-if`+`v-for` on one element; no Teleport/Suspense/fragments.
- `v-model` components: `model: vModel` + `useProxiedModel`. Ex: `packages/ui/src/components/SqSwitch.vue`.
- Second models: prop + `update:x` emit (`v-model:x` in Vue 3, `:x.sync` in Vue 2). Ex: `selected` in `packages/datagrid/src/SqDataGrid.vue`.
- Listen with the exact emitted name: `@update:modelValue`. Ex: `packages/datagrid/src/GridFilter.vue`.
- Slots via `setup(_, { slots })` + `has(name)` helper, never `$slots`/`$scopedSlots`. Ex: `packages/ui/src/components/SqCard.vue`.
- ARIA booleans as strings (`x ? 'true' : 'false'`) — Vue 2 drops `false` attributes.
- Plain JS in templates (no `as`, `!`); no template bindings named like Object.prototype members (`valueOf`).
- DOM-element props use `type: null as unknown as PropType<…>`. Ex: `activator` in `SqMenu.vue`.
- Transition CSS lists both `-enter` and `-enter-from`. Ex: `packages/ui/src/styles/base.css`.
- Extending a component: spread the SFC object and override props. Ex: `packages/ui/src/components/SqAutocomplete.vue`.

## SSR safety
- No timers, `document`/`window` access or network calls in `setup()` or immediate watchers — use `onMounted` or guard with `isBrowser`. Ex: clock in `packages/calendar/src/SqCalendar.vue`.
- Ids via `useUid(prefix)`, never `nextId` in components. Ex: `packages/ui/src/components/SqTextField.vue`.
- Text-like fields accept an `id` prop that goes to the native input (label `for` links to it).

## Naming & files
- Components `Sq<Name>.vue` in `packages/<pkg>/src/components/` (ui) or `src/` (add-ons); names are the exported names. After adding one run `node scripts/gen-index.mjs` (ui) or add it to the add-on's `index.ts` + `componentNames`.
- BEM-ish classes `sq-<component>__<element>--<modifier>`; CSS vars `--sq-*`.
- Composables `packages/ui/src/composables/<area>.ts`, exported from `packages/ui/src/index.ts`.

## Styling
- Non-scoped `<style>` in each SFC; tokens only (`.ai/DESIGN_SYSTEM.md`).
- Surfaces: `class="sq-surface"` + `--sq-bg/--sq-bd/--sq-bw/--sq-r/--sq-shadow(-filter)` + `<SqShape />` child. Ex: `SqSheet.vue`.
- Color props accept theme names or CSS colors via `colorValue`; variant matrix via `variantVars` (`composables/style.ts`).
- Attributes meant for an inner native control (e.g. `aria-label`) must be declared props and bound on that control — undeclared attrs fall through to the wrapper root (Vue 2 + 3). Text-like fields get `ariaLabel` / `ariaLabelledby` from `fieldShellProps` (`composables/field.ts`).

## TypeScript / state / async
- Strict TS; typed `PropType`; no `any`. Emit typing helper `Emit` in `composables/model.ts`.
- Reactivity that must work in Vue 2: replace objects/Sets instead of mutating. Ex: `toggleGroup` in `SqDataGrid.vue`.
- Async: `async/await`; stale-response guards with an epoch counter. Ex: `loadBlock` in `SqDataGrid.vue`, `search` in `packages/icons/src/SqIconPicker.vue`.
- Pure logic goes in `.ts` with tests (`packages/datagrid/src/engine.ts`, `packages/calendar/src/layout.ts`).

## Anti-patterns
- `v-html` (only exception: Iconify bodies in `SqIcon.vue`), `innerHTML`, `eval`.
- Per-item `SqShape` in virtualized lists (use `.sq-squircle` radius class).
- Formatting values in hot loops (see quick filter note in `engine.ts`).
