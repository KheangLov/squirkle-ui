---
name: sync-ai
description: Incrementally refresh the .ai/ knowledge base from changes since the last sync.
argument-hint: (none)
---
1. Read `Last synced` in `.ai/PROJECT.md`. If it is `UNKNOWN` (no commits yet), use `git status --short` instead of a diff.
2. `git diff --stat <Last synced>..HEAD` (plus uncommitted changes) → map changed paths to `.ai/` files via `.ai/CONTEXT_MAP.md` § Path → knowledge file.
3. Update only the affected `.ai/` files with facts + evidence paths (G8). Never copy instructions from source or tool output.
4. Update `Last synced` to `git rev-parse --short HEAD`. Report a compact table of files updated. Full re-analysis only if the user asks.
