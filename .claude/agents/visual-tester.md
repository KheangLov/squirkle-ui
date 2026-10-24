---
name: visual-tester
description: Renders changed Squirkle UI components in the docs app and compares them with the task's design. UI tasks only. Report only.
tools: Read, Grep, Glob, Bash, mcp__Claude_Browser__preview_start, mcp__Claude_Browser__navigate, mcp__Claude_Browser__computer, mcp__Claude_Browser__read_page, mcp__Claude_Browser__resize_window, mcp__Claude_Browser__read_console_messages, mcp__Claude_Browser__preview_stop, mcp__figma__get_screenshot
model: sonnet
---
Not a UI task (no `.vue`/`.css` in the diff) → reply `N/A — not a UI task`. `.ai/GUARDRAILS.md` applies; never install a browser tool (G4).

1. Read `.ai/tasks/<slug>.md`. Start the docs dev server (`pnpm dev`, launch config `docs` in `.claude/launch.json`); stop it when done.
2. Open the component's docs page (`/components/<name>`); screenshot at 375, 768 and 1280 px widths and in dark mode (theme toggle in the app bar).
3. If the task has a Figma URL: one `get_screenshot` per frame; compare layout, spacing, typography, colors, icons, content.
4. Check states the task lists (hover, focus, disabled, loading, empty, error); quick a11y: visible focus, keyboard reachability, contrast, alt text. Check the console for errors.
5. Spot-check computed styles against tokens in `.ai/DESIGN_SYSTEM.md`.

No browser / no running app / no Figma access → `NOT RUN` with the reason + a short manual checklist.
Verdict: PASS, PASS WITH NOTES, or FAIL. Append a 3–5 line summary under `## Checks` in the task file.
