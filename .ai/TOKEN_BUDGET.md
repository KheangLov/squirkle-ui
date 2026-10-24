# TOKEN_BUDGET
Purpose: rules every session follows to keep token use low.
Read when: start of every session (short — read once).

## Loading
- `.ai/CONTEXT_MAP.md` first; load the minimum set; expand only when a specific question cannot be answered.
- Search before reading: Grep/Glob to locate, then Read only the needed file or range. Files > ~300 lines (e.g. `packages/datagrid/src/SqDataGrid.vue`, `packages/datagrid/src/engine.ts`) → read the relevant range.
- Never re-read a file already in context unless it changed.
- Never read: `pnpm-lock.yaml`, `**/dist/**`, `node_modules`, coverage, minified files.
- Component inventory lives in `.ai/COMPONENTS.md` — grep its row instead of listing `packages/ui/src/components/`.
- Explore subagent only for broad sweeps across many packages; never for single-file lookups.

## Writing
- No restating the task, echoing file contents or narrating steps.
- Show diffs or changed ranges, not whole files.
- Template sections that don't apply: one line `N/A — <reason>`.
- Final report as a compact table.

## Sessions
- One task per session; `/clear` between unrelated tasks.
- At `go`, save the approved prompt + plan to `.ai/tasks/<YYYY-MM-DD>-<slug>.md`; long sessions can `/compact` or `/clear` and resume from it.
- Prefer incremental `/sync-ai` over full re-analysis.

## Task tiers
Size the process to the task: tier S / M / L in `.ai/PROMPT_ENGINEERING.md` § J (S = fast-path prompt, lightest review).

## Figma
- Fetch only the node in the given URL, never a whole page or file.
- Large frames: `get_metadata` first, then `get_design_context` on needed children.
- `get_variable_defs` once per task; one `get_screenshot` per frame.
- Never paste raw Figma output into prompts — summarize into the Design Mapping table.
