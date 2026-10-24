# Decision
Compile one SFC source tree twice (Vue 3 + Vue 2.7) instead of using vue-demi render functions.

## Context
The library must run on Vue 2.7, Vue 3 and Nuxt 2/3/4 (user requirement, 2026-10-24).

## Decision
`build/vite.lib.mjs` builds `dist/vue3` with `@vitejs/plugin-vue` and `dist/vue2` with `@vitejs/plugin-vue2` + `vue2/compiler-sfc`; consumers pick `@squirkle/<pkg>` or `@squirkle/<pkg>/vue2`.

## Alternatives
- vue-demi + `h()` render functions: `h` signatures differ between versions; templates would be lost.
- postinstall switching (vue-demi style): fragile in monorepos and CI.

## Consequences
Templates must respect the common subset (`.ai/CONVENTIONS.md`); every SFC change needs `pnpm build <pkg>`; Vue 2 runtime verified via `apps/playground-vue2`.

## Affected Areas
All packages, `scripts/build.mjs`, `packages/nuxt`.
