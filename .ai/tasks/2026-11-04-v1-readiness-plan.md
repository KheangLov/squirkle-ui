---
slug: 2026-11-04-v1-readiness-plan
status: ready
writer: Codex
writer_access: repo
writer_model: gpt-6-luna / medium (Codex CLI)
base_commit: a71f5b13608c3fa9d7e66b40b23722de37169a01
complexity: complex
mode: split
approval_word: go
parent: none
depends_on: []
implement_tier: PLAN
files_to_read: [.ai/PROJECT.md:1-80, .ai/CONVENTIONS.md:1-80, .ai/SECURITY.md:1-40, .github/workflows/ci.yml:1-160]
files_to_modify: []
files_to_create: [.ai/tasks/2026-11-04-v1-readiness-public-api.md, .ai/tasks/2026-11-04-v1-readiness-parity.md, .ai/tasks/2026-11-04-v1-readiness-quality.md, .ai/tasks/2026-11-04-v1-readiness-release.md]
---

# Implementation Prompt

Role: Release readiness analyst for a Vue component monorepo, responsible for a code-evidenced and actionable v1.0.0 gap assessment.

Objective: Assess all `@squirkle-ui/*` packages against v1.0.0 readiness across public API freeze, Vue 2.7/3 and Nuxt 2/3/4 parity, tests, documentation, CI, and release/changesets. Produce a prioritized gap report with evidence and pass/fail/unknown status; do not implement fixes or bump/publish versions.

Context: This is a split assessment; four independently reviewable workstreams feed the readiness report.

Relevant Files: Package source, package manifests, package tests/readmes, examples, docs/storybook, CI and release scripts as scoped in child tasks.

Required Changes: 1. Public API inventory and freeze assessment for every workspace package. 2. Compatibility/parity assessment for Vue 2.7/3 and Nuxt 2/3/4 consumers. 3. Test, docs, and CI coverage assessment. 4. Release/changeset workflow assessment and consolidated prioritized report.

Existing Patterns To Reuse: `.ai/PROJECT.md` architecture and command facts; `.ai/CONVENTIONS.md` Vue compatibility and tests; `.ai/SECURITY.md` G12 constraints; current CI and changeset configuration as source truth.

Current Implementation: Known workspace packages are core, ui, calendar, charts, datagrid, editor, icons, map, nuxt, squirkle-ui, and swiper. Inventory and validate against current package manifests.

Architecture Constraints: Read-only analysis of source/config/docs. Do not edit implementation, CI, dependency, version, lock, or publishing files. No publishing or version bumps; those remain user-only.

Edge Cases: Distinguish unsupported by design from missing parity; report inaccessible or unverified behavior as unknown. Check package-specific peer/dependency and export conditions.

Error Handling: Record failed or unavailable checks with exact command and reason; do not infer success.

Performance: N/A — assessment only.

Security: Read `.ai/SECURITY.md` relevant G12 sections before reviewing Nuxt head injection or CI/deploy behavior; do not run external or production actions.

Testing Requirements: Read-only checks and existing commands only; no test additions. Record each check as PASS/FAIL/NOT RUN with evidence.

Acceptance Criteria: [ ] Every `@squirkle-ui/*` package is inventoried. [ ] Each requested readiness axis has evidence, gaps, and unknowns. [ ] Findings are prioritized and traceable to file/line or command. [ ] Final report makes no version bump or publish and ends with user-run commands.

Constraints: All changes limited to `.ai/tasks/`; no git state changing commands. Versions and publishing are user-only.

Output Format: Consolidated report in the final subtask, with summary, package-by-package findings, blockers, follow-up order, checks, and commands for the user.

# Implementation Plan

Steps: Complete four child assessments; consolidate only after all are done. Dependencies: public API, parity, and quality assessments have no dependencies; release assessment depends on all three.

Files To Read: See child task `files_to_read` lists; each answers the package-specific readiness question.

Files To Modify: None.

Files To Create: One report per child task, each confined to `.ai/tasks/`.

Files To Delete: None.

Risks: Large package surface; findings must distinguish confirmed gaps from unverified scope. CI and Nuxt are G12-sensitive; inspect only, never modify.

Testing Plan: Execute non-mutating repository checks listed in each child; no installs, versioning, or publishing.

Documentation: Readiness report only; no knowledge-file updates.

Model Tier: PLAN-HIGH for analysis; writer model gpt-6-luna / medium (Codex CLI).

Decision record needed? No; assessment does not choose a product policy.

# Prompt Quality Check

| Essential | Pass/Fail | Note |
| --- | --- | --- |
| Clarity | Pass | Axes and acceptance evidence are explicit. |
| Role | Pass | Release readiness analysis role and quality bar specified. |
| Context | Pass | Repo map, routed facts, package list and child scopes identified. |
| Format | Pass | Full contract sections and front matter included. |
| Iteration | Pass | No prior prompt lesson applies. |

# Confidence

80% — CONTEXT_MAP, PROJECT, CONVENTIONS, WORKFLOW, TASK_CONTRACT, and package paths were inspected; base commit recorded. Open question: package-by-package exported API details and CI/release behavior require child analysis.
