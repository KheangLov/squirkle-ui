# PROJECT
Purpose: what Squirkle UI is, its stack, entry points and verified commands.
Read when: first task in a session, or any task touching build/scripts/packages.

- **What**: squircle-first Vue component library + add-ons, inspired by Vuetify (component breadth), with an enterprise data grid. App type: library monorepo with a docs/playground app.
- **Stack**: TypeScript 5.9, Vue SFCs (`defineComponent` + `setup()`, templates), Vite 7 library mode, pnpm 11 workspaces, Vitest 3 + happy-dom, vue-tsc 3. Node ≥ 20.19 (`package.json` engines).
- **Targets**: Vue 3.3+ (`@squirkle-ui/<pkg>`), Vue 2.7 (`@squirkle-ui/<pkg>/vue2`), Nuxt 3/4 (`@squirkle-ui/nuxt`), Nuxt 2.17 (`@squirkle-ui/nuxt/nuxt2`).
- **Packages**: `squirkle-ui` (all-in-one re-export package), `core` (framework-free), `ui` (88 components), `datagrid`, `charts`, `swiper`, `calendar`, `map` (Leaflet peer), `icons`, `editor` (Tiptap), `nuxt`. Apps: `apps/docs` (Vue 3 docs + playground), `apps/storybook` (Storybook 10, Vue 3), `examples/*` (one consumer app per framework: Vue 3 Vite, all-in-one, Vue 2.7 Vite, Vue 2.7 Vue CLI 5, Nuxt 4/3/2).
- **Entry points**: `packages/<pkg>/src/index.ts`; plugin `packages/ui/src/plugin.ts` (`createSquirkle`); docs `apps/docs/src/main.ts`; Nuxt `packages/nuxt/src/module.mjs`, `packages/nuxt/src/nuxt2.cjs`.

## Commands (verified 2026-10-24)
| Command | What | Status |
|---|---|---|
| `pnpm install` | install workspace | verified |
| `pnpm dev` | docs on http://localhost:5180 (sources aliased via `build/aliases.ts`) | verified |
| `pnpm dev:vue2` | `examples/vue2-vite` on :5181, uses `dist/vue2` (run `pnpm build` first) | verified |
| `pnpm build [pkg…]` | `scripts/build.mjs`: core → ui → add-ons, each Vue 3 + Vue 2 + `dist/types` | verified |
| `pnpm dev:nuxt` | `examples/nuxt4` on :5182 (built dist; `pnpm --filter @squirkle-ui/example-nuxt4 build` for prod) | verified |
| `pnpm build:pages` | builds packages, docs, Storybook and every example with sub-path bases and assembles `_site/` (`PAGES_BASE`, default `/squirkle-ui/`); deployed by `.github/workflows/pages.yml` | verified locally (CI run NOT RUN) |
| `pnpm examples:build [name…]` | builds every `examples/*` app against built packages; fails if a Showcase copy drifts | verified (all 7; `nuxt2` is installed in place with its own lockfile) |
| `pnpm build:docs` | production docs build | verified |
| `pnpm test` | Vitest, `packages/*/test/**/*.test.ts` (47 tests) | verified |
| `pnpm storybook` / `pnpm build:storybook` | Storybook 10 on :6006 (Vue 3, sources) / static build to `apps/storybook/storybook-static` | verified |
| `pnpm typecheck` | vue-tsc over packages + docs | verified (0 errors) |
| lint | none configured | UNKNOWN — no ESLint in repo |
| `node scripts/gen-index.mjs` | regenerate `packages/*/src/components/index.ts` after adding an SFC | verified |

## Constraints
- Every SFC must compile for Vue 2.7 and Vue 3 (`.ai/CONVENTIONS.md`).
- Publishing: npm, scope `@squirkle-ui` (npm org `squirkle-ui`, owner `kheanglov`; the `squirkle` org belongs to another account), npm 2FA (`auth-and-writes`) required to publish, `publishConfig.access: public`, internal deps `workspace:^` → `^x.y.z` on publish (ADR 0005). The agent never publishes or bumps versions (G3/G4); the user runs it.
- Release check (agent may run): `node scripts/release.mjs` (build → `pnpm pack` per package into git-ignored `.release/` → prints `npm publish` commands, never runs them); install the tarballs in a scratch Vue 3 app (`vue-tsc` with `skipLibCheck: false` + `vite build`) and a Vue 2.7 app (`vite build`).
- Release (user): bump versions (e.g. `pnpm -r --filter "./packages/*" exec npm pkg set version=0.1.1`) → `node scripts/release.mjs` → run the printed `npm publish .release/<tgz> --access public --otp=<code>` in order → check `npm view <pkg> readmeFilename`. Upload with `npm publish` (its tarball read includes the README); `pnpm publish` 0.1.0 reached npm without READMEs.
- Nuxt 3/4 module: verified on Nuxt 4.6.2 and 3.21.11 (`examples/nuxt4`, `examples/nuxt3`: prod build, SSR HTML, hydration). Nuxt 2.18.1 module: verified (`examples/nuxt2`, standalone install: prod build, SSR HTML, hydration, editor, raster map; vector maps unsupported on webpack 4).

Last synced: UNKNOWN (no commits yet — `/sync-ai` falls back to `git status`)
