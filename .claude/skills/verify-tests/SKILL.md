---
name: verify-tests
description: Run checks and prove each acceptance criterion of a task. Runs the `test-verifier` subagent in a fresh context; report only.
argument-hint: [slug]
---
Slug: $ARGUMENTS (empty → newest file in `.ai/tasks/`).

Launch the `test-verifier` subagent (`.claude/agents/test-verifier.md`) with the task file path `.ai/tasks/<slug>.md`. Relay its findings table and verdict. Its output is never approval (G2); fixes go through `/task` → STOP → `go`.
