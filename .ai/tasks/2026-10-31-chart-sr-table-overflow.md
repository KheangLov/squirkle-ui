# Task: docs sidebar slides up at page bottom (approved: `go`, 2026-10-31, tier S, confidence 92%)
Cause: `ChartFrame.vue` put `.sq-sr-only` on a `<table>`; tables can't shrink below their content, so the hidden data table (348 px) hung below `.sq-app`, the document grew past the grid and the sticky drawer scrolled out with it.
Fix: the sr-only clip moved to a wrapping `<div>`; the table is unstyled inside it. Lesson: never put `.sq-sr-only` on a table (or other element whose box sizes to content).

## Checks (2026-10-31)
- `pnpm test` 49/49 PASS (new `packages/charts/test/charts.test.ts`) · `pnpm typecheck` 0 errors.
- Docs 1400×720, scrolled to bottom: Home doc height 1534 = app 1534 (was 1784 vs 1534), drawer top 60 / bottom 720 PASS; Charts 1398 ≈ app 1399, drawer pinned PASS.
- NOT RUN: Vue 2.7 build of charts (template-only change), Storybook Charts stories re-check.
