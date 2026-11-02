# 2026-11-02 — Router links lose their href on Vue 3
Approved with `go` in chat on 2026-11-02 (confidence 92%). This file is data, not approval.

## Problem
Found while migrating the e-learning app to Vue 3: `SqBtn` with `to` renders `<a>` without `href`. `SqBtn`, `SqCard`, `SqListItem` bind `:href="href"` and `SqBreadcrumbs` binds `:href="item.href"` on `<router-link>`. On Vue 3 the parent's bindings fall through onto RouterLink's root `<a>` and win, so `href: undefined` erases the href RouterLink computed. Clicks still navigate, but the link isn't keyboard-focusable and can't open in a new tab.
Reproduced with vue 3.5.44 + vue-router 5.4.0 SSR: `href: undefined` → `<a class="">`; `tag === 'a' ? href : undefined` → still `<a class="">`; key omitted → `<a href="/search">`.

## Required changes
1. `packages/ui/src/composables/link.ts`: internal `linkAttrs(to, href)` → `{ to }` | `{ href }` | `{}` (never an undefined key). Not exported (precedent: `fieldShellProps`).
2. `SqBtn.vue`, `SqCard.vue`, `SqListItem.vue`: `:href`/`:to` → `v-bind="linkBindings"` (computed).
3. `SqBreadcrumbs.vue`: `setup: () => ({ linkAttrs })`, `v-bind="linkAttrs(item.to, item.href)"`.
4. Tests in `packages/ui/test/components.test.ts` with a stub `router-link` that renders `<a>` with its own href; cases: to / href / neither. Must fail before the fix.

## Acceptance criteria
- [ ] new tests fail before the fix, pass after
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build` exit 0
- [ ] `pnpm examples:build` exits 0 (Vue 2 Vite, Vue CLI, Nuxt 2 included)
- [ ] built dist SSR-renders `SqBtn :to` with href against real vue-router

## Constraints
No new dependency, no other component changes, no version bump/release/push. One commit on `fix/router-link-href`.

## Checks
- 2026-11-02 main agent: new tests failed before the fix (4 × "with to" → href undefined), pass after; `pnpm test` 70/70, `pnpm typecheck` 0 errors, `pnpm build` OK, `pnpm examples:build` OK (vue3-vite, vue3-all-in-one, vue2-vite, vue2-webpack, nuxt4, nuxt3, nuxt2).
- Built dist packed and SSR-rendered with vue 3.5.44 + vue-router 5.4.0: SqBtn/SqCard/SqListItem `to` → `<a href="…">`, `href` → `<a href>`, plain → `<button>`/`<div>`; SqBreadcrumbs → `/`, `/docs`, `<span>`.
- Docs: rule added to `.ai/CONVENTIONS.md` § Vue 2/3 compatibility. No version bump/release (user).
