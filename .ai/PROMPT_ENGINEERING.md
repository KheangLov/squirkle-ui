# PROMPT_ENGINEERING
Purpose: the only definition of the 5 Prompt Essentials, templates, self-review and Prompt Lessons.
Read when: writing any implementation prompt; § J sets the tier (S / M / L) for every task.

## A. The 5 Essentials
| # | Essential | Rule | Weak → precise (this repo) |
|---|---|---|---|
| 1 | Clarity & Specificity | Every vague word → file path, symbol, prop, token, value, behavior, number | "make the grid faster" → "`SqDataGrid` (`packages/datagrid/src/SqDataGrid.vue`) scrolls 100 000 rows × 20 cols at ≥ 55 fps; `engine.ts` `computeRows` ≤ 30 ms for 100k rows sort+filter" |
| 2 | Role Definition | Opens with task-specific role: stack + area + quality bar | "You are a developer" → "Senior Vue 2.7/3 component engineer in `packages/ui/src/components`, responsible for dual-build compatibility, squircle token use and a11y" |
| 3 | Context | Only what the task needs; every claim cites a path | "the button uses some theme" → "`SqBtn` reads `--sq-bg`/`--sq-bd` set in `packages/ui/src/components/SqBtn.vue` `<style>`; tokens in `packages/ui/src/styles/tokens.css`" |
| 4 | Format Specification | Fixed template (E); deliverable shape stated | free-form paragraph → Template E with every section or `N/A — reason` |
| 5 | Iteration & Refinement | Draft → score (F) → revise before showing; log lessons (G) | shown first draft → revised once, Quality Check table shown |

Failure signals: banned words survive ("improve", "clean up", "handle properly", "etc.", "appropriate", "as needed"); generic role; no paths; missing sections; no self-review.

## B. Precision Rules
| Vague | Replace with |
|---|---|
| "improve performance" | measurable target, e.g. "render 10 000 rows without a main-thread task > 50 ms" |
| "handle errors" | which error, where caught, what the user sees |
| "update the component" | path + prop/emit/slot/method + new behavior |
| "match the design" | Design Mapping table + listed states + breakpoints |
| "use the right color" | exact token from `.ai/DESIGN_SYSTEM.md` (e.g. `--sq-primary`) |
| "follow conventions" | the convention + its `.ai/CONVENTIONS.md` section |
| "add tests" | test file path, cases, framework (Vitest + happy-dom) |
| "works in Vue 2" | "`pnpm build <pkg>` passes and `apps/playground-vue2` renders it without console errors" |
| "etc." | the complete list |

## C. Role Rules
Formula: `Senior <stack> engineer working in <area/paths>, responsible for <quality bar>, following <.ai files>.`
Focus by task: UI → components, tokens, squircle surface pattern, a11y; data → `packages/datagrid/src/engine.ts` pipeline; perf → virtualization + profiling; build → `build/vite.lib.mjs` dual builds.

## D. Context Rules
Only what the task needs; cite every path; symbol references or short excerpts over whole files; current behavior before desired; unverified facts marked `ASSUMPTION:` (they lower confidence).

## E. Implementation Prompt Template
```
# Implementation Prompt
## Role
## Objective            exact, verifiable outcome (1–2 sentences)
## Context              relevant context with paths (UI: include Design Mapping)
## Current Implementation
## Relevant Files
## Existing Patterns To Reuse
## Required Changes     numbered: file → change → expected behavior
## Architecture Constraints
## Edge Cases
## Error Handling
## Performance
## Security
## Testing Requirements
## Acceptance Criteria  checkbox list, each objectively pass/fail
## Constraints          what must not be done
## Output Format        what the executor delivers
```
Non-applicable section: `N/A — <reason>`. Tier S tasks use only Role, Objective, Relevant Files, Required Changes, Acceptance Criteria.

## F. Prompt Self-Review (shown below every prompt)
```
# Prompt Quality Check
| Essential | Pass/Fail | Note |
|---|---|---|
| Clarity & Specificity | | no banned terms; every requirement verifiable |
| Role Definition | | stack + area + quality bar |
| Context | | real paths; nothing unrelated |
| Format | | all sections present or N/A with reason |
| Iteration | | revised at least once; Prompt Lessons applied |
```
Any Fail → revise before showing. Max 3 passes; still failing → show with failures listed and lower confidence. This checks prompt quality; confidence checks task understanding — keep them separate.

## H. Implementation Plan Template
```
# Implementation Plan
## Steps
## Files To Modify
## Files To Create
## Files To Delete     (None. if none)
## Dependencies
## Risks
## Testing Plan
## Documentation
## ADR                 required / not required + reason
```

## I. Confidence and Stop
```
# Confidence
XX%
# Confidence Reason
<short evidence-based explanation>

Waiting for approval: `go`
```

## J. Task tiers (the only tier definition — pick one in Phase 1, state it with a one-line reason)
| Tier | Entry criteria | Prompt | Plan | Review (Phase 9) |
|---|---|---|---|---|
| S | ≤ ~20 changed lines, one area; no public API, behavior, state, dependency, config or build change (copy, typo, comment, style tweak with existing tokens, `.ai/` doc fix) | fast path: Role, Objective, Files, Change, Acceptance | 1–3 steps | tests + typecheck when code changed, CODE_REVIEW self-check |
| M | default: anything that is not S or L | template E; small sections `N/A — <reason>`; Quality Check F | steps, risks, testing | `/review-task <slug>` |
| L | public API or new export, new package, dependency, build/bundler or Nuxt module change, cross-package change, data migration, or an ADR | full template E + data flow + migration/rollback; Quality Check F | detailed + rollback | `/check-all <slug>` |
Every tier: confidence → STOP → `go` (G2). Unsure between two tiers → pick the higher one. A tier that turns out wrong after `go` → Scope protection STOP (`.ai/WORKFLOW.md`).

## Dogfood sample (scored, not executed)
Task: "Add a `size` prop to SqKbd."
- Role: Senior Vue 2.7/3 component engineer in `packages/ui/src/components`, responsible for dual-build compatibility and token use, following `.ai/CONVENTIONS.md`, `.ai/DESIGN_SYSTEM.md`.
- Objective: `SqKbd` (`packages/ui/src/components/SqKbd.vue`) accepts `size: 'sm' | 'md' | 'lg'` (default `'md'`) mapping font-size to `--sq-text-xs` / `--sq-text-sm` / `--sq-text-md`.
- Acceptance: [ ] class `sq-kbd--<size>` on root; [ ] no hardcoded px font sizes; [ ] `pnpm typecheck` passes; [ ] docs API table lists the prop (generated from props in `apps/docs/src/components/ApiTable.vue`).
Quality Check result: all Pass after revision 1 (first draft said "make sizes consistent" → banned vagueness; replaced with the token mapping). Lesson applied: always name the exact token per variant.

## G. Prompt Lessons
Format: `- <YYYY-MM-DD> | <task type> | What went wrong | Rule going forward`
Scan entries for the same task type before drafting. Consolidate; keep under ~40 entries.
- 2026-10-24 | component (dual build) | `<template v-for>` with `:key` compiles in Vue 3 but errors in Vue 2.7 (and the reverse) | never use `<template v-for>`; loop real elements (`.ai/CONVENTIONS.md`)
- 2026-10-24 | component (dual build) | a setup binding named `valueOf` broke only the Vue 2 build (`type.startsWith is not a function`) | never name template bindings after Object.prototype members; run `pnpm build <pkg>` (both builds) before review
- 2026-10-24 | component (dual build) | TS `as` casts inside template expressions compile in Vue 3 only | keep templates plain JS; move casts into setup functions
- 2026-10-24 | component (dual build) | `@update:model-value` listeners worked in Vue 3 but never fired in Vue 2 (grid selection broke) | write event listeners with the exact emitted name; verify in `apps/playground-vue2`
- 2026-10-24 | component (SSR) | `setInterval` in SqCalendar setup crashed Nuxt SSR (500) and module-counter ids caused hydration mismatches | list SSR-safety (no setup side effects, `useUid`) in Architecture Constraints for every component prompt; verify with `apps/playground-nuxt`
- 2026-10-24 | add-on (third-party CSS) | MapLibre's lazily loaded CSS (`.maplibregl-map { position: relative }`) overrode SqMap's equal-specificity rule and collapsed the map to 0 px; DOM checks passed while nothing was visible | scope container rules with two classes when a lazily loaded library styles the same element; verify element size/pixels, not only DOM presence
- 2026-10-24 | add-on (bundler) | MapLibre's web worker fails under Vite dep pre-bundling (docs, Vue 2 playground, Nuxt dev) | for libraries that spawn workers, list bundler integration in Risks and test in a plain consumer app, not only the docs
- 2026-10-24 | add-on (Nuxt client-only) | `SqMap` mounted from `onMounted` while Nuxt's `createClientOnly` still rendered a hydration placeholder (ref null) → spinner forever on full page loads; client navigation hid it | for `mode: 'client'` components, wait for the template ref before mounting; always test a full SSR load in a foreground tab
- 2026-10-24 | add-on (worker assets) | MapLibre builds its worker URL from `import.meta.url`; neither dev pre-bundling nor production builds provide that file | for libraries that load sibling files at runtime, verify the production build output contains them and pass explicit URLs (`?url`)
- 2026-10-24 | context (token trim) | planned to cut CLAUDE.md to ~300 tokens by moving its guardrail block, which G3 protects; real saving was ~200, not ~500 | trim around always-loaded guardrails; measure section sizes before promising a token saving
