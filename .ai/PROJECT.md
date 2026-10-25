# PROJECT
Purpose: what Squirkle UI is, its stack, entry points and verified commands.
Read when: first task in a session, or any task touching build/scripts/packages.

- **What**: squircle-first Vue component library + add-ons, inspired by Vuetify (component breadth) and AG Grid (data grid). App type: library monorepo with a docs/playground app.
- **Stack**: TypeScript 5.9, Vue SFCs (`defineComponent` + `setup()`, templates), Vite 7 library mode, pnpm 11 workspaces, Vitest 3 + happy-dom, vue-tsc 3. Node ≥ 20.19 (`package.json` engines).
- **Targets**: Vue 3.3+ (`@squirkle-ui/<pkg>`), Vue 2.7 (`@squirkle-ui/<pkg>/vue2`), Nuxt 3/4 (`@squirkle-ui/nuxt`), Nuxt 2.17 (`@squirkle-ui/nuxt/nuxt2`).
- **Packages**: `squirkle-ui` (all-in-one re-export package), `core` (framework-free), `ui` (86 components), `datagrid`, `charts`, `swiper`, `calendar`, `map` (Leaflet peer), `icons`, `nuxt`. Apps: `apps/docs` (Vue 3 docs + playground), `apps/playground-vue2` (Vue 2.7 smoke test of built dist), `apps/playground-nuxt` (Nuxt 4.6.2 SSR test of `@squirkle-ui/nuxt`).
- **Entry points**: `packages/<pkg>/src/index.ts`; plugin `packages/ui/src/plugin.ts` (`createSquirkle`); docs `apps/docs/src/main.ts`; Nuxt `packages/nuxt/src/module.mjs`, `packages/nuxt/src/nuxt2.cjs`.

## Commands (verified 2026-10-24)
| Command | What | Status |
|---|---|---|
| `pnpm install` | install workspace | verified |
| `pnpm dev` | docs on http://localhost:5180 (sources aliased via `build/aliases.ts`) | verified |
| `pnpm dev:vue2` | Vue 2.7 playground on :5181, uses `dist/vue2` (run `pnpm build` first) | verified |
| `pnpm build [pkg…]` | `scripts/build.mjs`: core → ui → add-ons, each Vue 3 + Vue 2 + `dist/types` | verified |
| `pnpm dev:nuxt` | Nuxt 4 playground on :5182 (built dist; `pnpm --filter @squirkle-ui/playground-nuxt build` for prod) | verified |
| `pnpm build:docs` | production docs build | verified |
| `pnpm test` | Vitest, `packages/*/test/**/*.test.ts` (36 tests) | verified |
| `pnpm typecheck` | vue-tsc over packages + docs | verified (0 errors) |
| lint | none configured | UNKNOWN — no ESLint in repo |
| `node scripts/gen-index.mjs` | regenerate `packages/*/src/components/index.ts` after adding an SFC | verified |

## Constraints
- Every SFC must compile for Vue 2.7 and Vue 3 (`.ai/CONVENTIONS.md`).
- Publishing: npm, scope `@squirkle-ui` (npm org `squirkle-ui`, owner `kheanglov`; the `squirkle` org belongs to another account), npm 2FA (`auth-and-writes`) required to publish, `publishConfig.access: public`, internal deps `workspace:^` → `^x.y.z` on publish (ADR 0005). The agent never publishes or bumps versions (G3/G4); the user runs it.
- Release check (agent may run): `node scripts/release.mjs` (build → `pnpm pack` per package into git-ignored `.release/` → prints `npm publish` commands, never runs them); install the tarballs in a scratch Vue 3 app (`vue-tsc` with `skipLibCheck: false` + `vite build`) and a Vue 2.7 app (`vite build`).
- Release (user): bump versions (e.g. `pnpm -r --filter "./packages/*" exec npm pkg set version=0.1.1`) → `node scripts/release.mjs` → run the printed `npm publish .release/<tgz> --access public --otp=<code>` in order → check `npm view <pkg> readmeFilename`. Upload with `npm publish` (its tarball read includes the README); `pnpm publish` 0.1.0 reached npm without READMEs.
- Nuxt 3/4 module: verified on Nuxt 4.6.2 (`apps/playground-nuxt`: dev + prod build, SSR HTML, hydration). Nuxt 2 module: NOT RUN (no Nuxt 2 app; syntax-checked only).

Last synced: UNKNOWN (no commits yet — `/sync-ai` falls back to `git status`)
