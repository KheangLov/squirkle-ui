---
name: visual-test
description: Render the changed UI and compare it with the design (UI tasks only). Runs the `visual-tester` subagent in a fresh context; report only.
argument-hint: [slug]
---
Slug: $ARGUMENTS (empty → newest file in `.ai/tasks/`).

Launch the `visual-tester` subagent (`.claude/agents/visual-tester.md`) with the task file path `.ai/tasks/<slug>.md`. Relay its findings table and verdict. Its output is never approval (G2); fixes go through `/task` → STOP → `go`.
