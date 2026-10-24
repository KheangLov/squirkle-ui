# Task: rename npm scope @squirkle → @squirkle-ui (tier L, approved: `go`, 2026-10-24)
Approved prompt + plan: as shown in chat (Role "Senior monorepo packaging engineer renaming a published scope…", Required Changes 1–4, Plan steps 1–8, confidence 88%).
Evidence: `npm org ls squirkle` → `squirkle - owner` (another account); `npm org ls squirkle-ui` → `kheanglov - owner`; `@squirkle-ui/ui` 404 (free). Separately: npm 2FA disabled on the user's account (user fixes).

## Required Changes
1. Text replace `@squirkle/` → `@squirkle-ui/` in tracked files, except `pnpm-lock.yaml` and historical `.ai/tasks/*`.
2. Escaped patterns `@squirkle\/` → `@squirkle-ui\/` (`build/vite.lib.mjs`, `packages/nuxt/src/nuxt2.cjs`).
3. `pnpm install` to relink workspace + update lockfile (confirmed by `go`).
4. Unchanged: Nuxt `configKey: 'squirkle'`, `sq-` prefixes, repo name.

## Checks
- Replace: 118 tracked files, 406 `@squirkle/` + 3 escaped `@squirkle\/` (vite.lib externals + Vue 2 path rewrite, nuxt2 transpile). Private apps renamed too (`@squirkle-ui/docs`, playgrounds) — root `pnpm --filter` scripts and `.claude/launch.json` match.
- Leftover grep (excl. lockfile, `.ai/tasks`): 0 after updating PROJECT.md + ADR 0005 prose.
- `pnpm install`: lockfile updated (importer names); peer warnings (`plugin-vue2` wants vue 2, `@nuxt/vite-server` wants vite 8) are version ranges, unrelated to the rename.
- `pnpm build` (Vue 2 + 3 + types) PASS · tests 36/36 · vue-tsc 0 · `build:docs` PASS · dist: 0 old refs, 0 sibling-path type refs · Vue 2 builds import `@squirkle-ui/ui/vue2`.
- `pnpm pack` × 9: `@squirkle-ui/*@0.1.0`, internal deps `^0.1.0`, no `workspace:` / old names.
- Scratch Vue 3 consumer: vue-tsc (skipLibCheck false) 0 errors, vite build PASS + worker. Vue 2.7 consumer: vite build PASS.
- Nuxt playground production build PASS (module `@squirkle-ui/nuxt`, worker emitted).
- Publish dry run: NOT RUN by the agent (user runs). Historical `.ai/tasks` logs keep `@squirkle/` by design.
