---
name: task
description: Run analysis → implementation prompt → plan → confidence for a Squirkle UI change, then STOP for `go`.
argument-hint: <request>
---
Request: $ARGUMENTS

1. Read `.ai/GUARDRAILS.md` rules as binding, then `.ai/CONTEXT_MAP.md` and only the files its row for this task type lists.
2. First output line: `Tier: S|M|L — <one-line reason>` (`.ai/PROMPT_ENGINEERING.md` § J); the tier sets the prompt form, plan size and review.
3. Run `.ai/WORKFLOW.md` phases 1–5 exactly: implementation prompt per `.ai/PROMPT_ENGINEERING.md` (template E + Quality Check F), plan (template H), confidence (I).
4. STOP. Make no code change until the user types `go` in this chat.
