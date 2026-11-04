---
slug: 2026-11-04-manifests-plan
status: done
writer: claude
writer_access: repo
writer_model: claude-opus-5-5 / low
base_commit: c836a1eec88b7f1d404cce88b46b498209f07f7d
complexity: simple
mode: split
approval_word: go
parent: 2026-11-04-v1-readiness-release
depends_on: []
implement_tier: BUILD-SECURE
files_to_read: [.ai/DECISIONS.md:1-20]
files_to_modify: []
files_to_create: [.ai/tasks/2026-11-04-manifests-core.md, .ai/tasks/2026-11-04-manifests-addons.md]
---

# Implementation Prompt
Objective: apply DECISIONS D1 items 6 and 10 to all 11 published manifests. Add `"./package.json": "./package.json"` to `exports` everywhere, and raise the `vue` peer to `^2.7.16 || ^3.5.0` wherever it is declared. D1-9: no `engines` field.
Why split: 11 manifests plus changesets is more than 8 files (WORKFLOW Split). The work is split by layer; each subtask ships alone.

# Implementation Plan
| Subtask | Files | depends_on |
| --- | --- | --- |
| `2026-11-04-manifests-core` | core, ui, nuxt, squirkle-ui `package.json` + changeset (5) | none |
| `2026-11-04-manifests-addons` | calendar, charts, datagrid, editor, icons, map, swiper `package.json` + changeset (8) | none |
One approval, one session and one git check per subtask. Both touch G12 paths (`.ai/SECURITY.md` G12: each `packages/<name>/package.json`), so BUILD-SECURE with a security pass.

# Prompt Quality Check
| Essential | Pass/Fail | Note |
| --- | --- | --- |
| Clarity | Pass | two exact values |
| Role | Pass | in subtasks |
| Context | Pass | D1 |
| Format | Pass | split parent, 40 lines or fewer |
| Iteration | Pass | engines dropped per D1-9 |

# Confidence
90%. All 11 manifests were inspected; the shape is uniform (`packages/charts/package.json`).
