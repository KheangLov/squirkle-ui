# WORKFLOW
Purpose: the phase rules for every implementation task. How to write the prompt lives in `.ai/PROMPT_ENGINEERING.md`.
Read when: any task that changes code.

```
TASK → CONTEXT → ANALYSIS → IMPLEMENTATION PROMPT (+ self-review)
→ IMPLEMENTATION PLAN → CONFIDENCE → STOP → GO
→ IMPLEMENT → TEST → REVIEW → DOCUMENT (+ prompt lessons) → REPORT
```

## Phase 1 — Analysis
- Restate the task in one precise sentence.
- Read `.ai/CONTEXT_MAP.md`, then only the files it points to (`.ai/TOKEN_BUDGET.md`).
- Identify affected packages, files, patterns, constraints, deps, risks, tests. Always ask: does this change behave the same under the Vue 2.7 build? (`.ai/CONVENTIONS.md` § Vue 2/3 compatibility)
- Decide fast path vs full template; decide whether an ADR is needed.
- Blocking open question → ask now instead of guessing.

## Phase 2 — Implementation prompt
Per `.ai/PROMPT_ENGINEERING.md`, based only on the request, real source, `.ai/` knowledge and existing patterns. Never invent files, APIs, components, tokens or behavior. Run the Prompt Self-Review before showing it.

## Phase 3 — Implementation plan
Template H in `.ai/PROMPT_ENGINEERING.md`.

## Phase 4 — Confidence
| Score | Meaning |
|---|---|
| 100% | fully verified |
| 90–99% | very clear, minor uncertainty |
| 75–89% | mostly understood |
| 50–74% | important uncertainty |
| 1–49% | insufficient understanding |
Never inflate. Below 75%, list what would raise it.

## Phase 5 — STOP
After prompt + plan + confidence: STOP. No code changes, no partial implementation.
Accepted approval: `go`, `GO`, `go ahead`, `approved`, `proceed`. Unclear → ask for explicit `go`. Accepting a plan in plan mode counts only if the user also says `go`.

## Phase 6 — Execute
Only after `go`: save prompt + plan to `.ai/tasks/<YYYY-MM-DD>-<slug>.md`, re-check assumptions, implement exactly the approved scope, then run `pnpm test`, `pnpm typecheck`, and `pnpm build` when a package's public surface or build config changed (commands in `.ai/PROJECT.md`).

## Phase 7 — Code review
Review against `.ai/CODE_REVIEW.md`. Fix what it finds.

## Phase 8 — Documentation
Update `.ai/` only when architecture, boundaries, package structure, data flow, security, performance, integrations, dependency strategy, workflow, tokens or components changed. New/changed component → update `.ai/DESIGN_SYSTEM.md` inventory and the docs page in `apps/docs/src/pages/`. Record Prompt Lessons and confirmed Figma mappings. ADR only for meaningful architectural decisions.

## Phase 9 — Final report
Compact table: summary, files changed, tests/validation, review, `.ai/` updates, prompt lessons, ADR, remaining risks. Then always end with (slug filled, omit `/visual-test` for non-UI tasks):
```
Next checks (each runs a separate agent):
/review-task <slug>
/verify-tests <slug>
/visual-test <slug>
/check-all <slug>
```

## Plan modification (before `go`)
Update prompt → re-run self-review → update plan → recalculate confidence → show the revision → STOP again.

## Scope protection (after `go`)
A discovery that invalidates the plan → STOP: what was found, why the plan no longer holds, what must change, new confidence. Wait for `go`. Record a Prompt Lesson if it was knowable during analysis.
