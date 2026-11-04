---
slug: 2026-11-04-v1-readiness-parity
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
files_to_read: [.ai/PROJECT.md:1-80, .ai/CONVENTIONS.md:1-80, examples/README.md:1-120, packages/nuxt/src/module.mjs:1-180]
files_to_modify: [.ai/tasks/2026-11-04-v1-readiness-parity.md]
files_to_create: [.ai/tasks/2026-11-04-v1-readiness-parity-report.md]
---

# Implementation Prompt

Role: Framework compatibility analyst, accountable for verifying supported consumer matrices from repository evidence.

Objective: Assess Vue 2.7 and Vue 3 output parity across packages and Nuxt 2/3/4 module compatibility. Report verified coverage, gaps, and unknowns with evidence.

Context: One source is built for Vue 2.7 and Vue 3; examples include framework consumers. Source and build scripts are truth.

Relevant Files: Build scripts, package manifests, Nuxt module, examples and compatibility-sensitive source/tests.

Required Changes: Create a compatibility matrix by package/framework; inspect Vue 2 entry/build behavior and Nuxt 2/3/4 integration; identify missing representative coverage and commands.

Existing Patterns To Reuse: `.ai/CONVENTIONS.md` Vue 2/3 and SSR rules; `.ai/PROJECT.md` build and examples commands.

Current Implementation: PROJECT documents dual builds and Nuxt 2/3/4; independently verify implementation.

Architecture Constraints: Read-only; no build/config/source changes.

Edge Cases: Separate build success from runtime behavior; record only actually exercised framework/version examples as verified.

Error Handling: Failed or unavailable checks are NOT RUN/unknown with reason.

Performance: N/A — compatibility review.

Security: Nuxt module is G12-sensitive; inspect head injection only per `.ai/SECURITY.md`, no edits or execution against production.

Testing Requirements: Use existing non-mutating build/example commands where practical; report exact results. Do not install dependencies.

Acceptance Criteria: [ ] Vue 2.7/3 parity assessed for all packages. [ ] Nuxt 2/3/4 paths assessed. [ ] Evidence distinguishes build, test, and runtime coverage.

Constraints: Only `.ai/tasks/` report/task edits; no git state changes.

Output Format: Matrix and prioritized evidence-backed gaps.

# Implementation Plan

Steps: Read build routes; inspect Nuxt module branches; map examples; inspect package compatibility evidence; write matrix.

Files To Read: listed build, compatibility, example and module files answer framework support and exercised paths.

Files To Modify: Task file only if scope correction is necessary.

Files To Create: Named report only.

Files To Delete: None.

Dependencies: None.

Risks: Running builds may require existing installed dependencies; do not install.

Testing Plan: Existing scoped build/example checks only, results recorded precisely.

Documentation: Report only.

Model Tier: PLAN.

Decision record needed? No.

# Prompt Quality Check

| Essential | Pass/Fail | Note |
| --- | --- | --- |
| Clarity | Pass | Compatibility dimensions and evidence types are explicit. |
| Role | Pass | Framework analysis role specified. |
| Context | Pass | Routed repo sources named. |
| Format | Pass | Full sections included. |
| Iteration | Pass | No prior prompt lesson applies. |

# Confidence

78% — PROJECT and CONVENTIONS establish the matrix; module implementation and examples need detailed verification.

## Import Check
approved_hash: c4d191ebab845cfe1b9dcdd5a8a411068f87c8e128f151272562aabad28e833f
Approved by user typing `go` (2026-11-04). Checks 1, 3–8 Pass; 2 Fail on paper: .ai/PROJECT.md and .ai/CONVENTIONS.md staged-modified (uncommitted kit rewrite), accepted by user with `go`.

## Implementation Log
- Read files_to_read, plus the sources the Required Changes name: `scripts/build.mjs`, `build/vite.lib.mjs`, `scripts/examples.mjs`, `packages/nuxt/src/{nuxt2.cjs,runtime/*}`, package manifests, `vitest.config.ts`, example configs and entries, `packages/core/src/theme.ts:160-215`, CI `run:` lines.
- Created `.ai/tasks/2026-11-04-v1-readiness-parity-report.md` with two matrices, 9 prioritized gaps and the AC mapping.
- nuxt2 built via `pnpm --dir examples/nuxt2 build` instead of `examples.mjs nuxt2`, which runs `pnpm install --frozen-lockfile` (G4-2, the task forbids installs).
- Builds regenerated gitignored outputs only; no tracked file changed.

## Checks
| Check | Result |
| --- | --- |
| `pnpm test` | Pass, 70/70 |
| `pnpm typecheck` | Pass |
| `pnpm build` | Pass |
| examples vue3-vite, vue3-all-in-one, vue2-vite, vue2-webpack, nuxt3, nuxt4 | Pass |
| examples nuxt2 (direct build) | Pass |
| Runtime / SSR render of any example | NOT RUN (no harness; out of a read-only scope) |
| Review | Self-review against the AC; independent `/review-task` NOT RUN |
| Tamper seal | matches `approved_hash` at report |
| Git | no commit, no git state change (task constraint) |

## Metrics
- Files created 1, task file appended 1, source changes 0. Check runtime ~73s.
