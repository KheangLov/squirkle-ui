# Task: `squirkle-ui` all-in-one package + full npm READMEs + README-carrying release path (tier L, approved: `go`, 2026-10-24)
Approved prompt + plan: as shown in chat (Role "Senior library packaging and documentation engineer…", Required Changes 1–4, Plan steps 1–8, confidence 78%). User choices: one package `squirkle-ui` (with add-on subpaths), full-docs READMEs.
Evidence: all 9 `@squirkle-ui/*@0.1.0` live; `npm view <pkg> readmeFilename` empty for every 0.1.0 although tarballs contain README.md.

## Required Changes
1. `packages/squirkle-ui`: deps on 8 `@squirkle-ui/*` libs (`workspace:^`), peer vue, optional peers maplibre-gl/leaflet; `scripts/build.mjs` generates re-export entries (`.mjs/.cjs/.d.ts`) + `@import` styles into `dist/` for `.`, `./vue2`, `./styles.css`, `./core`, `./<addon>`, `./<addon>/vue2`, `./<addon>/styles.css`; LICENSE.
2. Full READMEs: squirkle-ui, @squirkle-ui/ui, add-ons, core, nuxt — every API name grepped in source.
3. `scripts/release.mjs`: build → `pnpm pack` per package into `.release/` → print `npm publish <tgz> --access public --otp=<code>` in dependency order (never runs publish). `.release/` git-ignored. PROJECT.md documents the flow + the user's version-bump command.
4. Docs: root README install, `.ai` PROJECT / ARCHITECTURE / COMPONENTS / FEATURES, ADR 0005.

## Constraints
No version bump, no publish (user), no new repo deps, no API changes to existing packages.

## Checks
- `packages/squirkle-ui`: 22 export paths; `scripts/build.mjs` generates 52 dist files (defaults re-exported only where the source has one: not core/charts/icons; styles copied). `pnpm install` added the new workspace importer to `pnpm-lock.yaml` (workspace links only, no new registry deps).
- READMEs: 10 packages (537+ lines). Script check: every `Sq*` name, import, `theme.*` method and "Key props" prop exists in `packages/*/src` (only misses were values: `vector`/`raster`, `dots`/`fraction`/`progress`); example props checked per component (SqCard/SqAppBar title, SqForm `submit`, …). Fixed `getSquirclePath` options in core README (`radius`, `smoothing`) after a consumer type error from a wrong guess in the test.
- `scripts/release.mjs` + `.release` in `.gitignore`: build → pack 10 → prints `npm publish` + `readmeFilename` checks; never publishes.
- README reaches npm: user's npm 11.18 `publish.js` reads tarballs with `fullReadJson: true`; pacote manifest of packed tarballs has `readme` (core 962, map 1945, squirkle-ui 7574 chars). Final proof only after the user publishes.
- `pnpm test` 36/36 · vue-tsc 0 · `build:docs` PASS.
- Consumer apps importing ONLY `squirkle-ui` (+ local tarballs of all libs): Vue 3 strict vue-tsc 0 errors + vite build (worker emitted); Vue 2.7 (`squirkle-ui/vue2`, `squirkle-ui/datagrid/vue2`) vite build PASS.
- Not verified: README rendering on npmjs.com (after user publishes 0.1.1); Nuxt via `squirkle-ui` (not supported by design).
