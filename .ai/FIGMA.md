# FIGMA
Purpose: how Figma designs become Squirkle code; mapping tables that grow per task.
Read when: `/figma-ui` or any task with a Figma URL.

## Setup check
`claude mcp list` (2026-10-24): `figma: https://mcp.figma.com/mcp (HTTP) - ✔ Connected` (remote server — needs a frame link; no current-selection mode).
Other options (documented, not run):
```
claude plugin install figma@claude-plugins-official                      # recommended
claude mcp add --transport http figma https://mcp.figma.com/mcp           # remote: needs a frame link
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp   # desktop: supports current selection
```
Figma is read-only by default — write tools need explicit confirmation (G4).

## Tools (confirmed names on the connected server)
| Tool | Use for |
|---|---|
| `get_metadata` | outline of a large frame; pick child nodes |
| `get_design_context` | layout + styling for one node — a React/Tailwind reference: translate, never paste |
| `get_variable_defs` | variables/styles used (once per task) |
| `get_screenshot` | visual reference (one per frame) |
| `get_code_connect_map` | Figma → code component links, if Code Connect exists |
(The server also requires `create_session` with the file key before file tools.)

## Translation rules
- Stack: Vue SFC with `defineComponent` + template, dual Vue 2/3 rules (`.ai/CONVENTIONS.md`).
- Absolute positions → `SqRow`/`SqCol`, flex/grid utilities (`packages/ui/src/styles/utilities.css`), layout components.
- Raw values → tokens via the tables below, then `.ai/DESIGN_SYSTEM.md`. Corner radii → `rounded` prop / `--sq-r`; Figma corner smoothing → `--sq-smoothing` (default 0.6 ≈ Figma "iOS").
- Text → component props/slots (no i18n system; locale strings in `config.locale.messages`).
- Icons → `SqIcon` with an Iconify name; images → `SqImg`.
- Undesigned states (hover, focus, disabled, loading, empty, error) and missing breakpoints → questions or `ASSUMPTION:` lines.

## Mapping tables
| Figma variable | Code token |
|---|---|
| — | (none confirmed yet) |

| Figma component | Code component | Prop mapping |
|---|---|---|
| — | (none confirmed yet) | |

## Quick prompts
```
/figma-ui <figma-url>                                          build a new component/screen; location from STRUCTURE.md
/figma-ui <figma-url> packages/ui/src/components/SqCard.vue    update an existing component to match
/figma-ui <figma-url> tokens                                   diff Figma variables vs tokens.css / theme.ts
/figma-ui <figma-url> audit                                    compare implemented UI vs design; report only
/figma-ui <figma-url> "notes"                                  constraints, e.g. "mobile first, reuse SqDataGrid"
```
