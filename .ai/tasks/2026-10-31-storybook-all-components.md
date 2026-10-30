# Task: Storybook covers every component (approved: `go`, 2026-10-31)
Approved plan: as shown in chat (tier M, confidence 80%) — add-on workspace deps + MapLibre worker in `apps/storybook`; one story file per component under `stories/<Category>/`; coverage test; typecheck + build + test + browser sweep. Release (version bumps / publish) stays with the user.
Dependencies approved: `@squirkle-ui/{calendar,charts,datagrid,icons,map}` (workspace) and `maplibre-gl ^6.15.0` (same range as apps/docs) in `apps/storybook` only.

## Changes
- `apps/storybook`: 83 component metas (79 new + Btn/Timeline/Editor/Swiper moved into category folders; `Forms.stories.ts` split into per-component files). Child parts are `subcomponents` (Card*, List*, Tab, WindowItem, ExpansionPanel, Radio, Row/Col, Main, Field, TimelineItem). `stories/data.ts` holds fixtures. `preview.ts` calls `setMapWorkerUrl`; `vite.config.ts` excludes `maplibre-gl` from pre-bundling (as docs).
- Wrapper components (SqAutocomplete, SqCombobox, SqRangeSlider, SqBottomSheet) declare only their own props, so forwarded attrs sit in the template, not in typed `args`.
- `packages/ui/test/storybook-coverage.test.ts`: reads every package's `componentNames` as text and fails on any component without a story.

## Checks (2026-10-31)
- `pnpm typecheck` 0 errors · `pnpm test` 48/48 PASS (coverage test fails with `['SqRating']` when that story is removed — mutation check PASS) · `pnpm build:storybook` PASS.
- `pnpm install` (network) timed out; `--offline` linked the new deps (`maplibre-gl` tarball not in store, but already linked from the first attempt). Lockfile updated.
- Storybook dev (:6006) sweep of all 119 stories (83 component pages) in hidden iframes: 0 error displays, 0 empty roots, 0 uncaught errors PASS. Map vector (dark): worker 200, tiles + markers render PASS. DataGrid playground renders 500 rows PASS. Dialog (dark) opens via portal PASS.
- NOT VERIFIED: every story visually (only DataGrid, Map, Dialog were screenshotted); story control panels per component; GitHub Pages Storybook build in CI.
- Release status (user-only, G-rules): npm `@squirkle-ui/editor` unpublished; ui/swiper/nuxt/squirkle-ui changed since 0.1.1 without a bump.
