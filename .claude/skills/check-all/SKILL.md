---
name: check-all
description: Run code-reviewer, test-verifier and (for UI tasks) visual-tester in parallel on a task and merge their reports.
argument-hint: [slug]
---
Slug: $ARGUMENTS (empty → newest file in `.ai/tasks/`).

Launch in parallel: `code-reviewer`, `test-verifier`, and `visual-tester` unless the task touches no `.vue`/`.css` file. Merge into one table: agent | verdict | blockers | top findings. No agent output counts as approval (G2).
