# Task: AI setup first pass — E1, E3, E4, E5 (approved: `go`, 2026-10-24)
Approved prompt + plan: as shown in chat (Role "Context engineer maintaining the Squirkle UI AI knowledge base…", Required Changes 1–4, Plan steps 1–7, confidence 90%). Option B (moving the CLAUDE.md guardrail block) NOT approved — block stays byte-identical.

## Required Changes
1. E1: `PROMPT_ENGINEERING.md` § J → Task tiers S / M / L; TOKEN_BUDGET fast path → pointer; WORKFLOW Phase 1 states tier; `/task` first line `Tier: S|M|L — <reason>`.
2. E3: WORKFLOW Phase 9 checks per tier (S self-check · M `/review-task` · L `/check-all`); check-all "intended for L".
3. E4: CLAUDE.md ≤ 600 tokens, guardrail block unchanged.
4. E5: inventory → `.ai/COMPONENTS.md`; 9 references updated.

## Checks
- E5: inventory (95 rows) → `.ai/COMPONENTS.md` (~2.94k tokens); `DESIGN_SYSTEM.md` ~4.6k → ~1.65k; references updated in CONTEXT_MAP (4 rows), TOKEN_BUDGET, STRUCTURE, CODE_REVIEW, WORKFLOW, DESIGN_SYSTEM, code-reviewer agent, figma-ui skill (3 lines), CLAUDE.md.
- E1: § J = S / M / L tiers (single definition); TOKEN_BUDGET fast path → pointer; WORKFLOW Phase 1 + `/task` state the tier.
- E3: WORKFLOW Phase 9 check per tier; check-all marked "intended for L, still runs when called".
- E4: CLAUDE.md 779 → 583 tokens; guardrail block byte-identical to commit 087124d.
- Script checks: 0 dangling `.ai/*.md` paths; COMPONENTS rows 95 = 95; GUARDRAILS.md + settings.json identical to 087124d; 0 tracked files changed. Tests/typecheck: N/A — no code. `/task` tier line: NOT RUN (needs a real task).
- Analysis doc updated (E4 figure, Status line, 2x2 label). Prompt Lesson added.
