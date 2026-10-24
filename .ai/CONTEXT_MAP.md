# CONTEXT_MAP
Purpose: routing table — which `.ai/` files to read for which task. Read this first, every task.
Read when: always, before anything else (after the CLAUDE.md guardrails).

Always binding: `.ai/GUARDRAILS.md` (compact copy in CLAUDE.md). Session rules: `.ai/TOKEN_BUDGET.md`.

| Task type | Read first | Read if needed | Skip |
|---|---|---|---|
| New UI component in `@squirkle-ui/ui` | DESIGN_SYSTEM, COMPONENTS (grep), CONVENTIONS | ARCHITECTURE, TESTING, PROMPT_ENGINEERING | DEPENDENCIES, SECURITY |
| Change an existing component | COMPONENTS (grep the row), CONVENTIONS | FEATURES, CODE_REVIEW | PERFORMANCE |
| UI from Figma (`/figma-ui`) | DESIGN_SYSTEM, FIGMA, COMPONENTS (grep) | CONVENTIONS, TESTING | DEPENDENCIES |
| Vue 2 / dual-build bug | CONVENTIONS § Vue 2/3, ARCHITECTURE § Build model | TESTING (playground-vue2), PROMPT_ENGINEERING § G lessons | DESIGN_SYSTEM |
| DataGrid feature / bug | FEATURES (DataGrid row), ARCHITECTURE § Data flow | PERFORMANCE, TESTING | FIGMA |
| Virtual / infinite scroll | PERFORMANCE, FEATURES | ARCHITECTURE | FIGMA |
| Charts / swiper / calendar / map / icons | FEATURES, DESIGN_SYSTEM | DEPENDENCIES (map, icons) | SECURITY |
| Theming / tokens | DESIGN_SYSTEM | ARCHITECTURE § Runtime model | FEATURES |
| Nuxt module / SSR bug | ARCHITECTURE § SSR, CONVENTIONS § SSR safety | FEATURES (Nuxt row), TESTING | DESIGN_SYSTEM |
| Build / packaging | PROJECT, ARCHITECTURE § Build model | DEPENDENCIES | DESIGN_SYSTEM |
| Docs / playground page | STRUCTURE (apps/docs), FEATURES (docs row) | DESIGN_SYSTEM | PERFORMANCE |
| Security-sensitive (HTML injection, network) | SECURITY | CODE_REVIEW | DESIGN_SYSTEM |
| Dependency change (CONFIRM G4) | DEPENDENCIES | PROJECT | DESIGN_SYSTEM |
| Writing any implementation prompt | PROMPT_ENGINEERING, WORKFLOW | CODE_REVIEW | — |
| Reviewing a task | CODE_REVIEW | the task file in `.ai/tasks/` | — |

## Path → knowledge file (used by `/sync-ai`)
| Changed path | Update |
|---|---|
| `packages/ui/src/components/**` | COMPONENTS, FEATURES |
| `packages/ui/src/styles/**`, `packages/core/src/theme.ts`, `packages/charts/src/styles.css` | DESIGN_SYSTEM |
| `packages/ui/src/composables/**`, `packages/ui/src/config.ts`, `plugin.ts` | ARCHITECTURE, CONVENTIONS |
| `packages/datagrid/**` | FEATURES, PERFORMANCE |
| `build/**`, `scripts/**`, `package.json`, `packages/*/package.json` | PROJECT, ARCHITECTURE, DEPENDENCIES |
| `packages/nuxt/**` | FEATURES, ARCHITECTURE |
| `packages/*/test/**`, `vitest.config.ts` | TESTING |
| `apps/**` | STRUCTURE, FEATURES |
| `.claude/**` | WORKFLOW (skills/agents) |

## Merged files (size rule)
- `DATA_FLOW.md` → `ARCHITECTURE.md` § Data flow
- `UI.md` → `DESIGN_SYSTEM.md` § UI patterns
- `INTEGRATIONS.md` → `DEPENDENCIES.md` § Integrations
