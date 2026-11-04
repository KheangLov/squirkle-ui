# Conventions

**Purpose:** how code is written here, with one real example path per rule, and the review checklist. **Read when:** writing or reviewing code.

## Code
- SFC: `<template>` then `<script lang="ts">` with `defineComponent({ name, props, emits, setup })`; no `<script setup>` in packages. Ex: `packages/ui/src/components/SqBtn.vue`.
- Shared props from `packages/ui/src/composables/style.ts` (variant, color, size, rounded); JSDoc on props.
- State: local refs/computed plus provide/inject groups (`packages/ui/src/composables/group.ts`); no Pinia or Vuex.
- Forms: `packages/ui/src/composables/field.ts` and `packages/ui/src/composables/validation.ts`.
- Styling: `--sq-*` CSS variables via style helpers; surfaces use `sq-surface` (`packages/ui/src/styles/base.css`).
- UI strings: `t(key)` with English defaults in `packages/ui/src/config.ts`.

### Vue 2/3 compatibility
- Single root element; no `<template v-for>`; no `v-if` + `v-for` on one element; no Teleport, Suspense or fragments (use `SqPortal`).
- `v-model` components: `model: vModel` + `useProxiedModel` (`packages/ui/src/composables/model.ts`). Ex: `packages/ui/src/components/SqSwitch.vue`.
- Second models: prop + `update:x` emit (`v-model:x` in Vue 3, `.sync` in Vue 2). Ex: `selected` in `packages/datagrid/src/SqDataGrid.vue`.
- Listen with the exact emitted name `@update:modelValue`. Ex: `packages/datagrid/src/GridFilter.vue`.
- Slots via `setup(_, { slots })` + a `has(name)` helper, never `$slots` or `$scopedSlots`. Ex: `packages/ui/src/components/SqCard.vue`.
- ARIA booleans as strings (`'true'` / `'false'`): Vue 2 drops `false` attributes.
- Plain JS in templates (no `as`, no `!`); no template bindings named like Object.prototype members.
- DOM-element props use `type: null as unknown as PropType<…>`. Ex: `activator` in `packages/ui/src/components/SqMenu.vue`.
- Transition CSS lists both `-enter` and `-enter-from` classes (`packages/ui/src/styles/base.css`).
- Extending a component: spread the SFC object and override props. Ex: `packages/ui/src/components/SqAutocomplete.vue`.
- Links: bind `v-bind="linkAttrs(to, href)"` from `packages/ui/src/composables/link.ts`, never `:href` + `:to` (Vue 3 erases RouterLink's href). Ex: `packages/ui/src/components/SqBreadcrumbs.vue`.

### SSR safety
- No timers, `document`/`window` access or network calls in `setup()` or immediate watchers: use `onMounted` or an `isBrowser` guard.
- Ids via `useUid(prefix)`; text-like fields pass an `id` prop to the native input.

## Naming (G9)
- Components `Sq` + PascalCase file names (`SqBtn.vue`); BEM classes `sq-btn__content`, `sq-btn--icon`.
- CSS variables `--sq-<group>-<step>`; theme classes `sq-theme--<name>`.
- Events: declared `emits` arrays; v-model event `update:modelValue`.
- Packages `@squirkle-ui/<name>`.

## Tests
- `describe`/`it` with `mount` from `@vue/test-utils`. Ex: `packages/ui/test/components.test.ts`.
- One test folder per package: `packages/<name>/test/*.test.ts`.
- A new component needs a story under `apps/storybook/stories` (checked by `packages/ui/test/storybook-coverage.test.ts`).

## Commits
- Conventional commits with a package scope: `fix(ui): …`, `fix(core): …`, `feat(storybook): …`, `ci: …`, `chore: …`.
- Branches `fix/…`, `feat/…`, `chore/…`, merged by PR; every PR that changes a package adds a changeset (`pnpm changeset`).

## Anti-patterns seen here
- Importing from `dist` instead of package names (aliases in `build/aliases.ts`).
- A v-model component without the `model` option breaks Vue 2.
- Empty `catch {}` in `packages/ui/src/icons.ts:102` (swallowed Iconify fetch errors); don't copy it into new code (S1-4).
- `:href` + `:to` on one element (fixed in `packages/ui/src/composables/link.ts`).

## Review checklist (Phase 7 and code-reviewer)
- Prompt adherence: every Required Change done, nothing extra; diff only in the task's files.
- Correctness: the input, state or ordering that breaks it; error paths; edge cases from the task.
- Guardrails: no secrets, no weakened checks, no G4 action without confirmation, writer scope respected.
- Security: the SECURITY sections for the touched layers; G12 paths get the full pass.
- Declarations (G9): reuse checked, no duplicates or unused code, narrowest types.
- Tests: assert behavior, cover the edge and error cases, nothing skipped.
- UI: tokens and existing components only (DS-1, DS-2), all listed states, every string through the repo's i18n or, with no i18n, plain inline strings.
- Git: no AI attribution; message format per Commits.
- Vue 2/3: the change builds with `pnpm build` (both outputs) and follows the Vue 2/3 compatibility list above.
- Package boundaries respected (PROJECT Architecture); a package change has a changeset.
- New component: exported from its package index, has a story and a docs page.
