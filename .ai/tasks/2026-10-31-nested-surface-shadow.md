# Task: Customize drawer looks off in light mode (approved: `go`, 2026-10-31, tier M, confidence 85%)
Cause: `--sq-shadow` / `--sq-shadow-filter` are custom properties, so they inherit. A container that sets its elevation by class (temporary drawer panel, dialog panel, menu, snackbar, floating toolbar / app bar / bottom nav) leaked it onto every nested `.sq-surface` without its own shadow — fields, color picker, button-toggle groups looked like cards on a card (visible in light mode).
Fix: `base.css` → `:where(.sq-surface) :where(.sq-surface) { --sq-shadow: none; --sq-shadow-filter: none; }`. Zero specificity: a surface's own class rule or inline `elevationVars` still wins. Audit: every shadow setter (`elevationVars` in SqBtn/SqSheet/SqCard, class rules in 9 components) targets the surface element itself, so nothing relied on inheritance.

## Checks (2026-10-31)
- `pnpm test` 50/50 PASS (new `packages/ui/test/surface.test.ts` loads the real base.css; fails without the rule) · `pnpm typecheck` 0 errors.
- Docs Customize drawer, light + dark: panel keeps elevation-4; mode toggle, color picker, fields `none`; active toggle button keeps elevation-1 PASS.
- Storybook computed shadows: Card/Btn elevated, Sheet elevation 4, floating Toolbar/AppBar/BottomNavigation, active toggle keep theirs; Dialog/Menu/Snackbar panels keep theirs, buttons/list items/fields inside are `none` PASS.
- NOT RUN: Vue 2.7 playground (CSS-only change), SVG renderer mode check (`--sq-shadow-filter` reset covers it by the same rule).
