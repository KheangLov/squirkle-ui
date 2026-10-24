# PROJECT
Purpose: what Squirkle UI is, its stack, entry points and verified commands.
Read when: first task in a session, or any task touching build/scripts/packages.

- **What**: squircle-first Vue component library + add-ons, inspired by Vuetify (component breadth) and AG Grid (data grid). App type: library monorepo with a docs/playground app.
- **Stack**: TypeScript 5.9, Vue SFCs (`defineComponent` + `setup()`, templates), Vite 7 library mode, pnpm 11 workspaces, Vitest 3 + happy-dom, vue-tsc 3. Node ≥ 20.19 (`package.json` engines).
- **Targets**: Vue 3.3+ (`@squirkle/<pkg>`), Vue 2.7 (`@squirkle/<pkg>/vue2`), Nuxt 3/4 (`@squirkle/nuxt`), Nuxt 2.17 (`@squirkle/nuxt/nuxt2`).
- **Packages**: `core` (framework-free), `ui` (86 components), `datagrid`, `charts`, `swiper`, `calendar`, `map` (Leaflet peer), `icons`, `nuxt`. Apps: `apps/docs` (Vue 3 docs + playground), `apps/playground-vue2` (Vue 2.7 smoke test of built dist), `apps/playground-nuxt` (Nuxt 4.6.2 SSR test of `@squirkle/nuxt`).
- **Entry points**: `packages/<pkg>/src/index.ts`; plugin `packages/ui/src/plugin.ts` (`createSquirkle`); docs `apps/docs/src/main.ts`; Nuxt `packages/nuxt/src/module.mjs`, `packages/nuxt/src/nuxt2.cjs`.

## Commands (verified 2026-10-24)
| Command | What | Status |
|---|---|---|
| `pnpm install` | install workspace | verified |
| `pnpm dev` | docs on http://localhost:5180 (sources aliased via `build/aliases.ts`) | verified |
| `pnpm dev:vue2` | Vue 2.7 playground on :5181, uses `dist/vue2` (run `pnpm build` first) | verified |
| `pnpm build [pkg…]` | `scripts/build.mjs`: core → ui → add-ons, each Vue 3 + Vue 2 | verified |
| `pnpm dev:nuxt` | Nuxt 4 playground on :5182 (built dist; `pnpm --filter @squirkle/playground-nuxt build` for prod) | verified |
| `pnpm build:docs` | production docs build | verified |
| `pnpm test` | Vitest, `packages/*/test/**/*.test.ts` (24 tests) | verified |
| `pnpm typecheck` | vue-tsc over packages + docs | verified (0 errors) |
| lint | none configured | UNKNOWN — no ESLint in repo |
| `node scripts/gen-index.mjs` | regenerate `packages/*/src/components/index.ts` after adding an SFC | verified |

## Constraints
- Every SFC must compile for Vue 2.7 and Vue 3 (`.ai/CONVENTIONS.md`).
- Deployment/publishing: UNKNOWN (no CI, no registry config). Never publish (G4).
- Nuxt 3/4 module: verified on Nuxt 4.6.2 (`apps/playground-nuxt`: dev + prod build, SSR HTML, hydration). Nuxt 2 module: NOT RUN (no Nuxt 2 app; syntax-checked only).

Last synced: UNKNOWN (no commits yet — `/sync-ai` falls back to `git status`)
