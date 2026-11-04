# Decisions

**Purpose:** decisions the user made that win over other `.ai/` rules on their subject (G1-5). **Read when:** a task touches the subject of a decision.

## D1 · 2026-11-04 · v1.0.0 API freeze defaults
User: "use your recommended defaults" (this session). Source: `.ai/tasks/2026-11-04-v1-readiness-report.md`.

| # | Question | Decision | Why |
| --- | --- | --- | --- |
| 1 | `./dist/types/*` export | **Keep, document it as internal and not covered by semver.** Consumers import types from the package root only. | The build rewrites cross-package d.ts imports to it (`scripts/build.mjs:26`); restructuring the types is a large G12 change with no consumer benefit. |
| 2 | Low-level ui helpers (`useProxiedModel`, `vModel`, `useUid`, `colorValue`, `onColorValue`, `radiusValue`, `variantVars`, `elevationVars`, `computePosition`, `nextZIndex`, `lockScroll`, `unlockScroll`, `iconStoreVersion`, `isVue2`) | **Keep the root exports. Group them under an "internal" comment block in `packages/ui/src/index.ts` and list them in the README as add-on plumbing that is not covered by semver.** (Per-definition `@internal` TSDoc was dropped: it touched 6 more files and pushed the task past the 8-file split limit.) | Add-ons import them from `@squirkle-ui/ui` (charts, datagrid, map, editor, icons). An `./internal` subpath would be a G12 build and exports change for every package. |
| 3 | Wildcard exports (core, calendar, datagrid) | **Replace with explicit named lists, with the same symbol set as today** (no removals). | New helpers can't leak into the public API by accident. |
| 4 | Default exports | **Keep the existing ones, add none. Named imports are the documented form.** | No code in the repo uses a default import, and removing them is breaking for no gain. |
| 5 | CSS | **An explicit `styles.css` import is the documented contract** (it already is in every README). The CSS imports in the ui and charts entries stay as they are. | It's consistent with the docs today; changing either side risks unstyled apps. |
| 6 | Vue peer floor | **`^2.7.16 \|\| ^3.5.0`** | Only Vue 2.7.16 and 3.5 are built and tested. |
| 7 | `componentNames` | **Public, documented** | The Nuxt module and custom registration depend on it. |
| 8 | Publishing | **Manual `npm publish` with 2FA OTP, no provenance, for 1.0.** Tag `v1.0.0` after publishing. | It matches `scripts/release.mjs`; no publish workflow exists. |
