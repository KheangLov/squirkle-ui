# Task: npm publish readiness (tier L, approved: `go`, 2026-10-24)
Approved prompt + plan: as shown in chat (Role "Senior library packaging engineer…", Required Changes 1–4, Plan steps 1–9, confidence 78%). Decisions by the user: scope `@squirkle` (org to be created by the user), LICENSE holder "KheangLov".

## Required Changes
1. Types: `packages/<pkg>/tsconfig.build.json` (8 TS packages) → `dist/types`; `scripts/build.mjs` runs `vue-tsc -p` after Vite, fails on errors.
2. Manifests (9): `types` + `types` export condition first (`./vue2` same d.ts); `publishConfig.access: public`; `repository` (+directory), `homepage`, `bugs`, `keywords`; internal `workspace:*` → `workspace:^`.
3. MIT LICENSE ("Copyright (c) 2026 KheangLov") at root + each package; short README per package.
4. Docs: root README install; `.ai/PROJECT.md` release steps; ARCHITECTURE § Build model; DEPENDENCIES; ADR 0005.

## Constraints
No version bump, no `npm publish` / `pnpm publish`, no repo dependency changes; scratch consumer apps only in the scratchpad.

## Checks
- Types: 8 `tsconfig.build.json`; `scripts/build.mjs` runs vue-tsc after Vite. Fixes found while building (within Required Change 1): `SqRadio.vue` now exports `RadioGroupCtx` (TS4023, type-only); 126 inferred `../../ui/dist/types/…` refs rewritten to `@squirkle/ui/dist/types/…` (+ `.js` stripped, 3 refs) and served by a `./dist/types/*` export.
- `pnpm build` (8 pkgs, Vue 2 + 3 + types) PASS · `pnpm test` 36/36 · vue-tsc 0 · `build:docs` PASS.
- `pnpm pack` × 9: each tarball = package.json, LICENSE, README.md, dist (nuxt: src); `dist/types/index.d.ts` in the 8 TS packages; no test/, no src (except nuxt), 0 `workspace:`; published ranges `^0.1.0`; `publishConfig.access: public`.
- Scratch Vue 3 consumer (npm install of 4 tarballs + vue 3.5, vite 7, vue-tsc 3, maplibre-gl 6): `vue-tsc` with `skipLibCheck: false` 0 errors; `vite build` PASS, worker emitted.
- Scratch Vue 2.7 consumer (`@squirkle/ui/vue2`, `@squirkle/datagrid/vue2`): `vite build` PASS. Vue 2 types: NOT RUN (by design).
- Lockfile: NOT RUN — `pnpm-lock.yaml` read is denied; specifiers likely still `workspace:*` → needs `pnpm install` (user confirmation, G4).
- Not verified: Nuxt 3 app with `@nuxt/kit` ^4; `squirkle` npm org availability; actual publish (user).
