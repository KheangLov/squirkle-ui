# Context map

**Purpose:** which files and sections to read for which task; read this first, every task. **Read when:** always.

- **Prompt version:** CONTEXT-ENGINEER-PROMPT v2
- **Last synced:** `a71f5b13608c3fa9d7e66b40b23722de37169a01`

## Routing
| Task type | Read first | Read if needed |
| --- | --- | --- |
| Implement a handed-off task (Claude) | the task file only | its `files_to_read`; `.ai/TASK_CONTRACT.md` Import Check |
| Write a task file | `.ai/TASK_CONTRACT.md`, `.ai/WORKFLOW.md` (Modes, Routing) | rows below for the task type |
| Change on a G12 path | `.ai/SECURITY.md` (sections for the layer) | `.ai/GUARDRAILS.md` G12 |
| UI from Figma | `.ai/DESIGN_SYSTEM.md` (Figma section) | `.ai/CONVENTIONS.md` |
| UI change | `.ai/DESIGN_SYSTEM.md` | `.ai/CONVENTIONS.md` |
| Commit or git question | `.ai/GUARDRAILS.md` G10 | `.ai/CONVENTIONS.md` (commits) |
| Refresh docs | this file (Last synced) | the files the changed paths map to |
| New or changed component in `packages/ui` | `.ai/CONVENTIONS.md` (Vue 2/3 compatibility, SSR safety) | `.ai/DESIGN_SYSTEM.md` Components; `packages/ui/src/components/SqBtn.vue` as the pattern |
| Add-on package (charts, map, editor, calendar, datagrid, swiper, icons) | `.ai/PROJECT.md` (Architecture and boundaries) | `.ai/CONVENTIONS.md`; the add-on source folder |
| Tokens, theming or squircle rendering | `.ai/DESIGN_SYSTEM.md` (Tokens, Theming) | `packages/core/src/theme.ts`, `packages/core/src/squircle.ts` |
| Nuxt module | `.ai/PROJECT.md` (Structure) | `.ai/SECURITY.md` G12 (head injection) |
| Build, release or changesets | `.ai/PROJECT.md` (Commands, Dependencies) | `.ai/SECURITY.md` G12; `scripts/build.mjs` |
| Docs app or Storybook | `.ai/PROJECT.md` (Structure) | `apps/docs/src/router.ts`; `apps/storybook/stories` |
| Examples (Vue 2 / Nuxt consumers) | `.ai/PROJECT.md` (Commands, Structure) | `examples/README.md` |
| Tests | `.ai/CONVENTIONS.md` (Tests) | `.ai/PROJECT.md` Testing |
| Security advisory matches a dependency | `.ai/SECURITY_WATCH.md` | `.ai/SECURITY.md` S5 |
| CI or GitHub Pages | `.ai/SECURITY.md` (G12, Enforcement status) | `.github/workflows/ci.yml`, `.github/workflows/pages.yml` |

## Reserved approval words (work → the only word that approves it; default `go`)
none

## Existing kit and records
- Kit: CONTEXT-ENGINEER-PROMPT v2.1, tier Standard, flags `fe`, `figma`; setup state in `.ai/setup/SETUP_STATE.md`.
- No other prompt or agent kit (no .cursor, .codex, docs/prompting or .github/agents folders).
- Decision log: none in the tree (the previous ADRs 0001–0006 were removed with the old `.ai/`; they remain in git history at commit a71f5b1). Create .ai/DECISIONS.md on the first real decision. A logged decision wins over a conflicting `.ai/` rule (G1-5).

## Merged or renamed files
- The previous `.ai/` kit (removed 2026-11-04 at the user's request) → its unique rules merged: Vue 2/3 compatibility and SSR safety → `.ai/CONVENTIONS.md`; package boundaries → `.ai/PROJECT.md` Architecture; SqIcon raw-HTML exception → `.ai/SECURITY.md` ARCH; Figma rules (old G7) → `.ai/DESIGN_SYSTEM.md` Figma.
- Previous `CLAUDE.md` project rules → AGENTS.md preserved block.
- Previous `.claude/skills/` and `.claude/agents/` → replaced by the kit versions (same names plus quick, implement, verify-setup, run-evals).

## Known drift (code vs rules, open conflicts)
- Preserved rule "Never `git push`" is stricter than G4-9 (push allowed when the user asks in chat). The preserved rule wins until the user decides.
- Preserved rules cite .ai/COMPONENTS.md and .ai/ARCHITECTURE.md, which no longer exist: read `.ai/DESIGN_SYSTEM.md` Components and `.ai/PROJECT.md` Architecture and boundaries instead.
- G10-1 forbids AI attribution, but git history has 21 Claude co-author trailers in the last 50 commits; history is not rewritten, the rule applies from now on.
- No lint or format tooling: G9-2 (TOOL lint) and S2-1 (TOOL lint) are enforced by review only.

## Glossary
- **behavior change:** any change in output, state, API, validation or side effect a user, caller or test can observe.
- **security-sensitive path:** a path listed under G12 in `.ai/SECURITY.md`.
- **production:** any environment with real users or real data.
- **new dependency:** a package not in the lockfile, or a major-version bump.
- **done:** every acceptance criterion proven by a test name or command output.
