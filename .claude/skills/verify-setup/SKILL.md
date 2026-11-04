---
name: verify-setup
description: Record tool versions in .ai/TOOL_FACTS.md and test each UNVERIFIED item for real.
model: sonnet
effort: low
---
Update .ai/TOOL_FACTS.md (40 lines max): date; versions of claude, node, the package manager, the writer (CLI version, or the model in its config file when only the app exists), Copilot if used.
Test each UNVERIFIED row, one Bash call per test (one denied part blocks the whole command):
- a denied read: the lockfile, never a secret file;
- `git push --force --dry-run` is refused (a forced dry run sends nothing even if the deny is missing); a plain push is never tested;
- each installed hook: pipe one blocked and one allowed sample JSON to it, compare exit codes;
- frontmatter: run one skill and confirm the model shown.
Mark each SET, UNVERIFIED or BROKEN with the date.
