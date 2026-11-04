---
slug: 2026-11-04-api-surface-freeze
status: done
writer: claude
writer_access: repo
writer_model: claude-opus-5-5 / low
base_commit: ae0847f262846f48bf3e40f76b21ba49a2950435
complexity: simple
mode: full
approval_word: go
parent: 2026-11-04-v1-readiness-release
depends_on: []
implement_tier: BUILD
files_to_read: [.ai/DECISIONS.md:1-25, packages/core/src/index.ts:1-4, packages/calendar/src/index.ts:1-6, packages/datagrid/src/index.ts:1-7, packages/ui/src/index.ts:1-17, packages/ui/README.md:1-110, packages/squirkle-ui/README.md:117-147, .changeset/router-link-href.md:1-6, .ai/CONVENTIONS.md:41-61]
files_to_modify: [packages/core/src/index.ts, packages/calendar/src/index.ts, packages/datagrid/src/index.ts, packages/ui/src/index.ts, packages/ui/README.md, packages/squirkle-ui/README.md]
files_to_create: [.changeset/api-surface-freeze.md]
---

# Implementation Prompt

Role: Senior TypeScript/Vue library engineer on the `@squirkle-ui/*` public entry points, responsible for an export surface that is byte-for-byte unchanged in symbols while becoming explicit and documented for the v1.0.0 freeze.

Objective: Replace the wildcard re-exports in core, calendar and datagrid with explicit named lists that export exactly the same symbols, mark ui's low-level helpers as internal in the entry file, and document the public API and semver policy (DECISIONS D1 items 1–5 and 7) in the ui and umbrella READMEs.

Context: `.ai/DECISIONS.md` D1. `.ai/tasks/2026-11-04-v1-readiness-public-api-report.md` risks 1, 2, 3, 5, 7 and 11.

Relevant Files: the 4 entry files and 2 READMEs in `files_to_modify`, plus a new changeset.

Required Changes:
1. `packages/core/src/index.ts`: replace the 4 `export *` lines with explicit exports. Values use `export { … } from`; types and interfaces use `export type { … } from` (`isolatedModules: true`, `tsconfig.json:12`). The exact lists:
   - `./squircle` values: getSquirclePath, getSquircleStrokePath, supportsNativeSquircle. Types: SquircleCorners, SquircleGeometry, SquircleOptions.
   - `./date` values: toDate, startOfDay, addDays, addMonths, daysInMonth, isSameDay, isSameMonth, startOfWeek, toISODate, monthGrid, weekdayNames, formatDate. Types: DateLike.
   - `./utils` values: clamp, nextId, isBrowser, getByPath, toUnit, debounce, rafThrottle, compareValues, niceTicks, downloadText.
   - `./theme` values: defaultThemes, themePresets, isHexColor, luminance, contrastRatio, onColor, mixColors, createBrandTheme, presetThemes, mergeThemes, themeVars, createThemeCss, appearanceCss. Types: ThemeDefinition, ThemeMap, ThemePreset, Appearance.
2. `packages/calendar/src/index.ts`: replace `export * from './layout'` with values normalizeEvent, layoutDay, eventsOnDay and types CalendarEvent, NormEvent, Placed. Keep everything else, including the default export (D1-4).
3. `packages/datagrid/src/index.ts`: replace `export * from './types'` with types CellValue, RowData, ColumnType, FilterKind, AggName, AggFunc, CellParams, ColumnDef, SortItem, TextOp, NumberOp, FilterCondition, FilterModel, ColumnState, DisplayRow, GetRowsParams, GetRowsResult, Datasource, CellRange. Replace `export * from './engine'` with values colIdOf, makeGetter, filterKindOf, matchCondition, filterRows, sortIndices, aggregate, groupRows, treeRows, flatten, allGroupIds, rowLayout, pivotRows, toCsv, parseTsv and types GroupNode, FlattenOptions. Keep the default export.
4. `packages/ui/src/index.ts`: reorder only, with the same export statements and symbols. Move the low-level helpers into one block at the end, headed by the comment `// Internal: add-on plumbing, not covered by semver. May change in any release.` The block holds useProxiedModel, vModel, useUid, colorValue, onColorValue, radiusValue, variantVars, elevationVars, computePosition, nextZIndex, lockScroll, unlockScroll, iconStoreVersion and isVue2. Each line that mixes public and internal names is split so that only the internal names move. The public names on those lines stay in the public part: `config, applyOptions, setAppearance, getThemeCss, syncThemeToDocument, t` and their types; `useResizeObserver, useClickOutside, type Location`; `type Variant, type Size, type Rounded`; `addIcons, addCollection, resolveIcon, builtinIcons, type IconData`. The CSS import and the default export stay as they are (D1-4, D1-5).
5. `packages/ui/README.md`: add `## Public API and versioning` before `## License`, 15 lines or fewer. It states:
   - Semver applies from 1.0.0 to the root exports of each package.
   - Import by name; default exports exist but named imports are the documented form.
   - Import `styles.css` explicitly.
   - `componentNames` (exported by every add-on) is public: the list of components the package registers.
   - `./dist/types/*` is internal (used by the build for cross-package types) and not covered by semver.
   - The internal ui helpers, listed by name, are not covered by semver.
6. `packages/squirkle-ui/README.md`: add the same section before `## License`, adjusted to the umbrella's import paths, or a 2-line pointer to the ui README section.
7. `.changeset/api-surface-freeze.md`: a `patch` for `@squirkle-ui/core`, `@squirkle-ui/calendar`, `@squirkle-ui/datagrid`, `@squirkle-ui/ui` and `squirkle-ui`. One line: explicit export lists (no API change) and a documented public API and semver policy.

Existing Patterns To Reuse: the named-export style of `packages/charts/src/index.ts:7-8` (`export { …, type X } from`); the changeset format in `.changeset/router-link-href.md`; the commit and changeset rules in CONVENTIONS lines 41-61.

Current Implementation: core `index.ts:1-4` and calendar/datagrid use `export *`. The ui entry `index.ts:5-14` mixes public and internal names on the same lines.

Architecture Constraints: No `package.json`, build, `exports` or dependency change. No symbol may be added, removed or renamed. Add-ons keep importing the internal helpers from `@squirkle-ui/ui`. Vue 2/3: entry files only, so no template impact.

Edge Cases: Types re-exported as values break under `isolatedModules`, so use `export type`. `export *` never re-exported defaults, and none of these source modules has one. A symbol the grep missed shows up as a diff in the export-set check below.

Error Handling: N/A. Static re-exports, no runtime paths.

Performance: N/A. There is no runtime change, and tree-shaking is unaffected by named re-exports.

Security: N/A. No G12 path is touched (`.ai/SECURITY.md` G12 lists manifests and build scripts, not entry files).

Testing Requirements:
- Export-set check, before and after: a scratchpad Node script uses the TypeScript compiler API (`ts.createProgram` + `checker.getExportsOfModule`) to print the sorted export names for core, calendar, datagrid and ui. Run it at the base commit and again after the change. The diff must be empty.
- Then run `pnpm test`, `pnpm typecheck`, `pnpm build` and `pnpm examples:build`. No new test file. Runtime behavior is unchanged, and the export-set diff is the proof.

Acceptance Criteria:
- [ ] The export-set diff (before vs after) is empty for all 4 entries.
- [ ] `grep -n 'export \*' packages/{core,calendar,datagrid}/src/index.ts` returns nothing.
- [ ] The ui entry has one internal block with exactly the 14 listed names under the stated comment.
- [ ] Both READMEs have the Public API section covering all 6 points.
- [ ] `.changeset/api-surface-freeze.md` exists, and `pnpm changeset status` passes.
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build` and `pnpm examples:build` all exit 0.

Constraints: Only the 7 listed files. Commit as `refactor(core,ui): explicit public export lists` on a `chore/`- or `refactor/`-prefixed branch, only when the user asks.

Output Format: the diff summary, the export-set diff output and the check table in the task file.

# Implementation Plan

Steps:
1. Write the export-set script in the scratchpad and save the "before" output.
2. Edit the 3 wildcard entries.
3. Reorder the ui entry.
4. Run the export-set script again and diff.
5. Add the README sections and the changeset.
6. Run test, typecheck, build and examples:build.
7. Self-review against the CONVENTIONS checklist, then run `/check-all`.

Files To Read:
- the entry files: what each exports today
- the READMEs: where the new section goes
- the changeset sample: the format
- CONVENTIONS 41-61: the commit, changeset and review rules
- DECISIONS D1: the policy text

Files To Modify: the 6 in front matter. Files To Create: the changeset. Files To Delete: none.

Dependencies: none. Base: the `chore/ai-kit-v1-readiness` branch at `ae0847f`, which is not pushed yet.

Risks:
- The grep-derived symbol lists miss an export. The export-set diff catches it.
- `pnpm build` d.ts output changes form (named instead of star). This is expected, with the same names.

Testing Plan: as in Testing Requirements.

Documentation: the READMEs as above. No `.ai/` change; D1 is already recorded.

Model Tier: BUILD.

Decision record needed? No. D1 already covers it.

# Prompt Quality Check

| Essential | Pass/Fail | Note |
| --- | --- | --- |
| Clarity | Pass | Exact symbol lists; acceptance is a diff and commands |
| Role | Pass | TS/Vue library entry points; quality bar is an unchanged symbol set |
| Context | Pass | D1 and the API report; files_to_read covers every edit |
| Format | Pass | All sections present; N/A with reasons |
| Iteration | Pass | Revised once to cut the per-definition `@internal` tags (file count) |

# Confidence

90%. The symbol lists come from grepping every `^export` line in the 7 source modules (46 core lines, matching the API report). `isolatedModules` is confirmed at `tsconfig.json:12`. Add-on use of the internal helpers is confirmed by grep. Open risk: a symbol exported in a form the grep missed, which the export-set diff guards against.

## Import Check
approved_hash: 1032c6b17b5ae26b456c330c8c0e70d1a6216e5436abd1d0b9123ed1fb8e2e77
Approved with `go` typed by the user in this session (2026-11-04). Written by Claude in this session, so all 8 checks Pass by construction.

## Implementation Log
- Wrote a scratchpad export-set script (TypeScript `getExportsOfModule` over the 4 entries) and captured the "before" output: core 46, calendar 9, datagrid 39, ui 140 names.
- Rewrote the core, calendar and datagrid entries with explicit `export {}` / `export type {}` lists.
- Reordered the ui entry so the 14 helpers sit in the internal block.
- Added the README sections and `.changeset/api-surface-freeze.md`.
- Ran nuxt2 through `pnpm --dir examples/nuxt2 build` rather than `examples.mjs`, because the latter runs a nested `pnpm install` (G4-2). The parity task did the same.

## Checks
| Check | Result |
| --- | --- |
| Export-set diff before vs after (4 entries) | PASS (empty) |
| `grep 'export \*'` in core/calendar/datagrid entries | PASS (none) |
| `pnpm test` | PASS (70/70) |
| `pnpm typecheck` | PASS (exit 0) |
| `pnpm build` | PASS (exit 0) |
| `node scripts/examples.mjs` vue3-vite vue3-all-in-one vue2-vite vue2-webpack nuxt3 nuxt4 | PASS (exit 0) |
| `pnpm --dir examples/nuxt2 build` | PASS (exit 0) |
| `pnpm changeset status` | PASS (exit 0) |
| Self-review (CONVENTIONS checklist) | PASS: no boundary change, changeset present, no attribution |
| `/check-all` (test-verifier) | NOT RUN: simple complexity; available on request |

## Metrics
- Files changed: 6 modified, 1 created. Exported symbols changed: 0.
