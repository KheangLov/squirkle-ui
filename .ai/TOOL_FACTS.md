# Tool facts

**Purpose:** installed tool versions and settings verified for real. **Read when:** a rule depends on a tool feature; updated by `/verify-setup`.

| Item | Value | Status (SET / UNVERIFIED / BROKEN) | Checked |
| --- | --- | --- | --- |
| claude | 2.1.318 | SET | 2026-11-04 |
| node | v26.13.0 (CI: 24) | SET | 2026-11-04 |
| pnpm | 11.10.0 | SET | 2026-11-04 |
| codex | codex-cli 0.166.0 | SET | 2026-11-04 |
| writer model | gpt-6-luna, effort medium (`~/.codex/config.toml`) | SET | 2026-11-04 |
| Figma MCP | connected (`claude mcp list`) | SET | 2026-11-04 |
| settings deny rules accepted | lockfile Read denied; `git push --force --dry-run` denied; no hooks installed | SET | 2026-11-04 |
| skill `model` frontmatter honored | verify-setup (`model: sonnet`) ran as Sonnet 5.5; `effort` not observable | SET (model) | 2026-11-04 |
