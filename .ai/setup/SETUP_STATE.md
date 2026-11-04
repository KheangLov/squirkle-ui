# Setup state

- Kit: CONTEXT-ENGINEER-PROMPT v2.1 · run 2026-11-04 at `a71f5b1`
- Tier: Standard · profile: standard · flags: fe, figma
- Writer: Codex (CLI 0.166.0) · writer models: UNKNOWN (user: later; `~/.codex/config.toml` has a model set)
- Attribution: forbidden (G10-1 kept)
- Git tracking: all AI files stay tracked; `.gitignore` unchanged (user choice)
- Previous kit: `.ai/`, `.claude/skills`, `.claude/agents`, CLAUDE.md, AGENTS.md removed and backed up to the session scratchpad; decision log ADRs 0001–0006 only in git history
- Formatter: none in the repo (no Prettier), step skipped

## Open conflicts
- Preserved "Never git push" vs G4-9 (preserved wins)
- Preserved rules cite removed .ai/COMPONENTS.md and .ai/ARCHITECTURE.md
- 21 AI co-author trailers in history vs G10-1 (not rewritten)

## Proposals pending (each needs its own yes)
- `.ai/setup/proposals/settings.json` → `.claude/settings.json` (deny rules + empty attribution)
- CI: SHA-pin actions, audit step, secret scan; pnpm `minimumReleaseAge`
- Recreate a decision log (restore ADRs from git or start .ai/DECISIONS.md)
