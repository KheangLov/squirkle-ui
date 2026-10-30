# Task: Map style select alignment + field aria-label (approved: `go` ×2, 2026-10-31)
1. Docs (tier S): `MapPage.vue` Style select dropped the stacked `label` (it pushed the control ~16 px below the toggle/switch); now `prepend-inner-icon="lucide:layers"` + `aria-label="Map style"`, width 240 px.
2. Library (tier M, confidence 88%): `aria-label` on SqTextField / SqTextarea / SqNumberInput / SqSelect landed on the wrapper div (undeclared attr), so label-less fields had no accessible name (also SqAutocomplete / SqCombobox / SqDateField / SqDateTimeField, which forward attrs). Fix: `ariaLabel` + `ariaLabelledby` in `fieldShellProps` (excluded from `pickShellProps`), bound on the native input / textarea / combobox; SqSelect's listbox gets `label || ariaLabel`.

## Checks (2026-10-31)
- `pnpm test` 55/55 PASS (5 new in `components.test.ts`; all 5 fail without the component change) · `pnpm typecheck` 0 errors · `pnpm build ui` PASS (Vue 2 + Vue 3 dist both contain the bindings).
- Docs 1400×800 Map row: toggle / select / switch centers all 270.5 px, light + dark PASS.
- Docs accessibility tree: `combobox "Map style"`, `combobox "Squircle renderer"` PASS; wrapper has no aria-label; listbox named "Map style"; no console errors PASS.
- NOT RUN: Vue 2.7 playground in a browser (build only); screen-reader run.
- Noticed, not fixed: inputs always set `aria-describedby="<id>-messages"` even with `hide-details` (target missing); Customize drawer Font select has no label/aria-label (named by its placeholder).
