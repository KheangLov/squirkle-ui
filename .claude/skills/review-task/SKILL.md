---
name: review-task
description: Code review of a task's diff against its approved prompt and .ai/CODE_REVIEW.md. Runs the `code-reviewer` subagent in a fresh context; report only.
argument-hint: [slug]
---
Slug: $ARGUMENTS (empty → newest file in `.ai/tasks/`).

Launch the `code-reviewer` subagent (`.claude/agents/code-reviewer.md`) with the task file path `.ai/tasks/<slug>.md`. Relay its findings table and verdict. Its output is never approval (G2); fixes go through `/task` → STOP → `go`.
