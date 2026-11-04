---
slug: 2026-11-04-nuxt-module-plan
status: done
writer: claude
writer_access: repo
writer_model: claude-opus-5-5 / low
base_commit: 542f181e666d30feddf0877695b4cf934aa69d54
complexity: medium
mode: split
approval_word: go
parent: 2026-11-04-v1-readiness-release
depends_on: []
implement_tier: BUILD-SECURE
files_to_read: [.ai/tasks/2026-11-04-v1-readiness-report.md:60-75]
files_to_modify: []
files_to_create: [.ai/tasks/2026-11-04-nuxt-module-types.md, .ai/tasks/2026-11-04-nuxt2-prefix.md]
---

# Implementation Prompt
Objective: close readiness blocker B3 (API-8, API-9, PAR-G6). Ship typed options for `@squirkle-ui/nuxt` on Nuxt 3/4 and Nuxt 2, and make `prefix` work on Nuxt 2.
Writer note: the routing table says Codex writes medium plans. The user chose "claude writes it" in this session.

# Implementation Plan
| Subtask | Files | depends_on |
| --- | --- | --- |
| `2026-11-04-nuxt-module-types` | `src/module.d.mts`, `src/nuxt2.d.cts` (new), `package.json`, `README.md`, changeset (5) | none |
| `2026-11-04-nuxt2-prefix` | `src/nuxt2.cjs`, `src/runtime/nuxt2-plugin.js`, `src/module.mjs`, `src/nuxt2.d.cts`, `README.md`, `test/nuxt2.test.ts` (new), changeset (7) | types |
Every `packages/nuxt/src` file and the manifest are G12 paths: BUILD-SECURE, with a security pass and REVIEW + CHECK.

# Prompt Quality Check
| Essential | Pass/Fail | Note |
| --- | --- | --- |
| Clarity | Pass | file lists and order are exact |
| Role | Pass | in subtasks |
| Context | Pass | B3 and source read |
| Format | Pass | split parent, 40 lines or fewer |
| Iteration | Pass | revised for the 8-file limit |

# Confidence
85%. The full module source was read (`module.mjs`, `nuxt2.cjs`, `runtime/*`, `package.json`, README). Nuxt's type generation from the default export was confirmed in `examples/nuxt4/.nuxt/types/modules.d.ts:11,21`.
