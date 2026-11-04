---
slug: 2026-11-04-v1-readiness-quality
status: done
writer: Codex
writer_access: repo
writer_model: gpt-6-luna / medium (Codex CLI)
base_commit: a71f5b13608c3fa9d7e66b40b23722de37169a01
complexity: medium
mode: full
approval_word: go
parent: 2026-11-04-v1-readiness-plan
depends_on: []
implement_tier: PLAN
files_to_read: [.ai/PROJECT.md:1-80, .ai/CONVENTIONS.md:1-100, .github/workflows/ci.yml:1-180, apps/docs/src/router.ts:1-100]
files_to_modify: [.ai/tasks/2026-11-04-v1-readiness-quality.md]
files_to_create: [.ai/tasks/2026-11-04-v1-readiness-quality-report.md]
---

# Implementation Prompt

Role: Quality and documentation readiness analyst for a component library, accountable for a measurable coverage assessment.

Objective: Assess package test coverage, public documentation, and CI readiness across all packages for v1.0.0; report concrete gaps with evidence.

Context: CI runs tests, typecheck, builds, examples, and PR changeset status per project facts; verify against workflows.

Relevant Files: Package tests/readmes, docs registry/pages, Storybook stories, CI workflows, root scripts.

Required Changes: Inventory each package's tests/docs/examples; map public features to documentation/stories where evidence permits; assess CI stages and release PR checks; list missing coverage and exact existing commands.

Existing Patterns To Reuse: `.ai/CONVENTIONS.md` test/story rules and `.ai/PROJECT.md` CI/testing commands.

Current Implementation: Per-package test folders exist for some packages; verify every package.

Architecture Constraints: Read-only; no test, docs, workflow, or config edits.

Edge Cases: Distinguish absent tests from indirect coverage; a story is not an API reference; report flaky/unverified only with evidence.

Error Handling: Each check PASS/FAIL/NOT RUN; explain unavailable commands.

Performance: N/A — assessment only.

Security: CI workflow is G12-sensitive; inspect only, no modifications.

Testing Requirements: Existing read-only repository checks only; do not add or weaken checks.

Acceptance Criteria: [ ] Every package has a test/docs/story status. [ ] CI workflow stages and omissions reported. [ ] Gaps have file/line or command evidence.

Constraints: Only task/report files under `.ai/tasks/`; no git state changing commands.

Output Format: Package matrix plus prioritized quality and CI gaps.

# Implementation Plan

Steps: Inventory tests/readmes; map docs/stories; inspect CI and command scripts; write evidence-backed findings.

Files To Read: Listed convention, project, workflow and router sections answer expected and current coverage.

Files To Modify: Task file only if scope correction needed.

Files To Create: Named report only.

Files To Delete: None.

Dependencies: None.

Risks: Feature-to-doc mapping may require broad inventory; flag incomplete mappings honestly.

Testing Plan: No new tests; report existing command outcomes.

Documentation: Report only.

Model Tier: PLAN.

Decision record needed? No.

# Prompt Quality Check

| Essential | Pass/Fail | Note |
| --- | --- | --- |
| Clarity | Pass | Coverage axes and deliverable are concrete. |
| Role | Pass | Quality/docs assessment responsibility specified. |
| Context | Pass | Relevant repo sources named. |
| Format | Pass | Full sections included. |
| Iteration | Pass | No prior prompt lesson applies. |

# Confidence

78% — routed CI and quality rules read; package-level coverage requires inventory.

## Import Check

| # | Check | Result |
| --- | --- | --- |
| 1 | Contract | Pass |
| 2 | Freshness | Fail on paper — .ai/PROJECT.md, .ai/CONVENTIONS.md staged (kit rewrite); re-read current content; read-only plan holds |
| 3 | Paths | Pass |
| 4 | Scope | Pass |
| 5 | Guardrails | Pass |
| 6 | Declarations and quality | Pass |
| 7 | Writer stayed a writer | Pass |
| 8 | Approval word | Pass |

Approved by user typing `go` (2026-11-04).
approved_hash: 6a11faebbd56456586a068518f9e0ccb2c53bd9f5fa5c01c7113cac148aab0e1

## Implementation Log
- Read: files_to_read (PROJECT.md, CONVENTIONS.md re-read at current staged content; ci.yml; router.ts), plus inventory by ls/grep of packages/*/test, packages/*/README.md, apps/storybook/stories, apps/docs/src/registry.ts, ApiTable.vue, Guide.vue, pages.yml, scripts/pages.mjs, scripts/examples.mjs, vitest.config.ts, tsconfig.json, .changeset/config.json (Risks: broad inventory).
- Ran: `pnpm test` (PASS, 10 files / 70 tests), `pnpm typecheck` (PASS). NOT RUN: build, examples:build, docs/storybook builds, changeset status (write output or need PR base).
- Created `.ai/tasks/2026-11-04-v1-readiness-quality-report.md`. Self-review corrected the ui "named in a test" count 14 → 12 (two names were comment-only) and clarified the pages.yml citation after review.
- No source, test, workflow or config changes.

## Checks
| Agent | Verdict | Blockers | Top finding |
| --- | --- | --- | --- |
| code-reviewer | PASS | none | 14 claims spot-checked, all accurate; nit on pages.yml citation (fixed) |
| test-verifier | PASS | none | 10 files / 70 tests confirmed; per-package test file counts match |
| visual-tester | NOT RUN | — | not a UI task |

## Metrics
- Files created: 1 (report); files modified: 1 (this task file). Tiers: implement on opus (PLAN), checks sonnet. Seal verified before report.
