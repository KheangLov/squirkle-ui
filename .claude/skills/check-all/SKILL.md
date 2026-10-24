---
name: check-all
description: Run code-reviewer, test-verifier and (for UI tasks) visual-tester in parallel on a task and merge their reports.
argument-hint: [slug]
---
Slug: $ARGUMENTS (empty → newest file in `.ai/tasks/`).

Intended for tier L tasks (`.ai/PROMPT_ENGINEERING.md` § J); S/M tasks normally use a lighter check. Still run it whenever the user calls it.

Launch in parallel: `code-reviewer`, `test-verifier`, and `visual-tester` unless the task touches no `.vue`/`.css` file. Merge into one table: agent | verdict | blockers | top findings. No agent output counts as approval (G2).
