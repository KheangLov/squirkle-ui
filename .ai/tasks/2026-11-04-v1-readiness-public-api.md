---
slug: 2026-11-04-v1-readiness-public-api
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
files_to_read: [.ai/PROJECT.md:1-80, packages/*/package.json, packages/*/src/index.ts]
files_to_modify: [.ai/tasks/2026-11-04-v1-readiness-public-api.md]
files_to_create: [.ai/tasks/2026-11-04-v1-readiness-public-api-report.md]
---

# Implementation Prompt

Role: Public API analyst for a Vue monorepo, accountable for a complete and evidence-based API freeze inventory.

Objective: Inventory exported package APIs and assess whether each `@squirkle-ui/*` package has a stable, intentional v1 public surface. Produce a report, not code changes.

Context: Use package manifests, source entrypoints, exports, declarations, and existing docs as evidence.

Relevant Files: All `packages/*/package.json`, package entrypoints and their direct re-export indexes; `.ai/PROJECT.md` architecture.

Required Changes: Report every package, public entry/subpath, exports/declarations, undocumented or accidental-looking exports, and freeze risks. Cite `path:line`; label uncertainty.

Existing Patterns To Reuse: Package boundaries in `.ai/PROJECT.md`; package names use `@squirkle-ui/<name>`.

Current Implementation: Eleven workspace package names are known; validate using manifests.

Architecture Constraints: Read-only. No source, manifest, version, or lockfile edits.

Edge Cases: Mark generated Vue 2 entrypoints separately from authored APIs; differentiate deliberate subpaths from build artifacts.

Error Handling: Report missing entrypoints or unresolvable exports as gaps; no assumed intent.

Performance: N/A — inventory only.

Security: No sensitive files required.

Testing Requirements: Read-only inspection; no tests required.

Acceptance Criteria: [ ] All packages inventoried. [ ] Export surfaces and freeze risks have file/line evidence. [ ] Report identifies confirmed vs uncertain findings.

Constraints: Edit only this task file and its named report. No git state changing commands.

Output Format: Markdown report under `.ai/tasks/` with package table, risk list, and API freeze decisions that need the user's policy choice.

# Implementation Plan

Steps: Enumerate manifests; inspect exports and entrypoints; compare README/docs; write evidence table.

Files To Read: Manifests/entrypoints answer package surface and published export questions.

Files To Modify: This task file only if scope correction is needed.

Files To Create: Named report only.

Files To Delete: None.

Dependencies: None.

Risks: Generated build files are not authoritative; infer only from source and package metadata.

Testing Plan: None — read-only.

Documentation: Report only.

Model Tier: PLAN.

Decision record needed? No; enumerate decisions for owner, do not decide policy.

# Prompt Quality Check

| Essential | Pass/Fail | Note |
| --- | --- | --- |
| Clarity | Pass | Inventory output and evidence are verifiable. |
| Role | Pass | API analysis responsibility specified. |
| Context | Pass | Scope and evidence sources specified. |
| Format | Pass | Full sections included. |
| Iteration | Pass | No prior prompt lesson applies. |

# Confidence

78% — package directory inventory and PROJECT architecture read; detailed exports remain to be inspected.

## Import Check
approved_hash: 681a94333db9f673abce5a8b4a0898160657a324b6883b921783b3171f226ee5
Approved by user `go` in chat, 2026-11-04, after the table. Rows 1–8 Pass; row 3 gap: `packages/nuxt` and `packages/squirkle-ui` have no `src/index.ts`, their real entrypoints are read instead. Model: claude-opus-5-5.

## Implementation Log
- Read: `.ai/PROJECT.md:1-80`; 11 `packages/*/package.json` (exports, files, peers, deps); 9 `packages/*/src/index.ts`; `packages/nuxt/src/module.mjs:17-71` (grep), `packages/nuxt/src/nuxt2.cjs:8-27`; `scripts/build.mjs` (grep: 26, 62-86); README heading lists.
- Commands (read-only): `ls`, `grep`, `git ls-files`, `node -e` over manifests. No build, install or test run; `dist/` not read.
- Created `.ai/tasks/2026-11-04-v1-readiness-public-api-report.md`. No source, manifest, version or lockfile edits.

## Checks
| Check | Result |
| --- | --- |
| Acceptance: all 11 packages inventoried | PASS (report table) |
| Acceptance: export surfaces and risks cite file/line | PASS (12 risks, each with evidence) |
| Acceptance: confirmed vs uncertain marked | PASS (C/U column, Uncertain section) |
| `pnpm test` / `typecheck` / `build` | N/A — no code changed |
| `/check-all` | NOT RUN — report-only task; run `/review-task 2026-11-04-v1-readiness-public-api` to have the report challenged |

## Metrics
Files read: ~25 (partial). Files written: 1 report + this log. Tier: PLAN (claude-opus-5-5).
