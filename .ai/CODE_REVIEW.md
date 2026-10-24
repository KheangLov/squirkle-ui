# CODE_REVIEW
Purpose: project-specific review checklist used in Phase 7 and by the `code-reviewer` agent.
Read when: reviewing any diff.

## Correctness & architecture
- [ ] Package boundaries hold: `core` imports nothing from Vue; add-ons import `@squirkle/ui` / `@squirkle/core` only via package names (never relative paths across packages) — see `.ai/ARCHITECTURE.md`.
- [ ] Datagrid data logic lives in `packages/datagrid/src/engine.ts` (pure, tested), not in the `.vue` file.
- [ ] No breaking change to a public prop/emit/slot without a note in the report.

## Vue 2.7 / Vue 3 dual build (most common defect source)
- [ ] Single root element in every template (Vue 2 has no fragments).
- [ ] No `<template v-for>`, no `v-if` + `v-for` on one element, no `<Teleport>`/`<Suspense>`, no `v-model:arg` inside library templates (use `:x` + `@update:x`).
- [ ] Every `v-model` component declares `model: { prop: 'modelValue', event: 'update:modelValue' }` and emits `update:modelValue`.
- [ ] No template refs inside `v-for`; no `$listeners`, no `.native`, no `$scopedSlots`; slots read via `setup(_, { slots })`.
- [ ] Transition CSS covers both `-enter` (Vue 2) and `-enter-from` (Vue 3) class names.
- [ ] Directives define both `bind/inserted/update/unbind` and `mounted/updated/unmounted`.
- [ ] Overlays render through `SqPortal`, not `Teleport`.
- [ ] No setup binding used in a template is named like an `Object.prototype` member (`valueOf`, `toString`, `constructor`, `hasOwnProperty`) — the Vue 2.7 template compiler crashes (`type.startsWith is not a function`).
- [ ] Listeners for camelCase emits keep the emitted casing (`@update:modelValue`, never `@update:model-value`) — Vue 2 does not normalize event names.
- [ ] No TypeScript syntax inside template expressions (`as`, `!`, generics) — Vue 2.7 templates are plain JS.
- [ ] `pnpm build <pkg>` succeeds (both builds).

## SSR
- [ ] Nothing in `setup()` / immediate watchers starts timers, touches `document`/`window` or fetches (use `onMounted` or `isBrowser`).
- [ ] Generated ids use `useUid` (hydration-stable on Vue 3.5).

## TypeScript & state
- [ ] `defineComponent` + typed `PropType`; no new `any`, `@ts-ignore`, `@ts-expect-error` (G3).
- [ ] Two-way state via `useProxiedModel` (`packages/ui/src/composables/model.ts`); no direct prop mutation.
- [ ] Global config only through `packages/ui/src/config.ts`; no new module-level mutable state per request (SSR leak risk).

## Design system (UI)
- [ ] Colors, radius, spacing, shadow, font, motion use tokens from `packages/ui/src/styles/tokens.css`; no hardcoded values where a token exists.
- [ ] Surfaces follow the squircle surface pattern: style via `--sq-bg` / `--sq-bd` / `--sq-bw` / `--sq-r` / `--sq-shadow(-filter)` and include `<SqShape />` (`.ai/DESIGN_SYSTEM.md` § Squircle).
- [ ] Existing components reused (`.ai/DESIGN_SYSTEM.md` inventory) before creating new ones.
- [ ] Dense/virtualized elements (grid cells, list rows) do not mount `SqShape` per item.

## Security (G6)
- [ ] No `v-html`/`innerHTML` with unsanitized input; no `eval`/`new Function`.
- [ ] Links with `target="_blank"` use `rel="noopener noreferrer"`.
- [ ] No secrets in code, docs, examples or the bundle.

## Performance
- [ ] Large lists use `SqVirtualScroll` / the grid's virtualizer; no `v-for` over unbounded data.
- [ ] Scroll/resize handlers are passive and rAF-throttled (`rafThrottle` in `packages/core/src/utils.ts`); observers disconnected on unmount.

## Accessibility
- [ ] Interactive elements are real `<button>`/`<input>` or have role + `tabindex` + keyboard handlers.
- [ ] Visible focus ring (`:focus-visible` uses `--sq-focus-ring`); labels linked to inputs; `aria-*` on overlays, tabs, menus.

## Tests & hygiene
- [ ] New logic has Vitest coverage under `packages/<pkg>/test/`; no skipped/deleted/weakened tests.
- [ ] No unused exports, dead code, duplicated helpers (check `packages/core/src/utils.ts` first).
- [ ] No unnecessary dependency added (G4/G6).

## Guardrail & prompt adherence
- [ ] Diff touches only files in the approved plan (G5); every Required Change done, nothing extra.
- [ ] No CONFIRM action (G4) taken without explicit confirmation.
