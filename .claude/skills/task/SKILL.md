---
name: task
description: Run analysis → implementation prompt → plan → confidence for a Squirkle UI change, then STOP for `go`.
argument-hint: <request>
---
Request: $ARGUMENTS

1. Read `.ai/GUARDRAILS.md` rules as binding, then `.ai/CONTEXT_MAP.md` and only the files its row for this task type lists.
2. Run `.ai/WORKFLOW.md` phases 1–5 exactly: implementation prompt per `.ai/PROMPT_ENGINEERING.md` (template E + Quality Check F), plan (template H), confidence (I).
3. STOP. Make no code change until the user types `go` in this chat.
