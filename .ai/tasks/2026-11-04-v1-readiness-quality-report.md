# v1 readiness: quality, docs and CI report

Task: `2026-11-04-v1-readiness-quality` (parent `2026-11-04-v1-readiness-plan`). Read-only assessment at HEAD `a71f5b1` plus the uncommitted `.ai/` kit. No source, test, docs, workflow or config file was changed.

## Checks run
| Check | Result | Evidence |
| --- | --- | --- |
| `pnpm test` | PASS | 10 files, 70 tests, 1.36s; no `.skip`/`.only`/`.todo` in any `packages/*/test` file |
| `pnpm typecheck` | PASS | `vue-tsc --noEmit -p tsconfig.json`, exit 0 |
| `pnpm build` | NOT RUN | writes `dist/` for every package; the task allows read-only checks only. CI runs it (`.github/workflows/ci.yml:40-41`) |
| `pnpm examples:build` | NOT RUN | writes build output and runs a nested `pnpm install` for nuxt2 (`scripts/examples.mjs:33-36`); CI runs it (`ci.yml:43-44`) |
| `pnpm build:storybook` / `build:docs` | NOT RUN | write build output; run only by `pages.yml` on main |
| `pnpm changeset status` | NOT RUN | needs a PR base ref; CI job `changeset` (`ci.yml:47-68`) |

Inventory method: `ls`/`grep` over `packages/*/test`, `packages/*/README.md`, `apps/storybook/stories` (83 story files) and `apps/docs/src/registry.ts` (98 `doc(...)` entries). I matched each package's `componentNames` list against the same `component:`/`subcomponents:` patterns `packages/ui/test/storybook-coverage.test.ts:30-31` uses. "Referenced in a test" means the component is imported or looked up by name in a test file (comment mentions excluded). It is not a measure of behavior coverage.

## Package matrix
| Package | Exported comps | Tests (file · its) | What the tests cover | Docs (site) | Stories | README |
| --- | --- | --- | --- | --- | --- | --- |
| core | — (TS only) | `core.test.ts` · 18 | squircle paths, utils, theme CSS, brand theme/presets, contrast | Guide pages `theming`, `squircle` (`apps/docs/src/pages/Guide.vue:41,85`) | n/a | 26 lines |
| ui | 88 | `components.test.ts` · 10 (20 run), `surface.test.ts` · 1, `storybook-coverage.test.ts` · 1 | 12/88 components referenced (SqDialog and SqNavigationDrawer appear only in a comment, `surface.test.ts:8`): SqSelect, SqDateTimePicker, field aria-label set, router-link href set, resolveIcon, nested surface | 88/88 have a registry entry + generated props/events table (`apps/docs/src/components/ApiTable.vue:28-38`) | 88/88 (73 own story, 15 only as `subcomponents`) | 110 lines |
| datagrid | 1 | `engine.test.ts` · 13 | pure engine: filter, sort, group, tree, pivot, csv/tsv | entry + `/datagrid` page | 1 | 40 lines |
| calendar | 1 | `layout.test.ts` · 2 | layout functions only | entry + `/calendar` | 1 | 35 lines |
| charts | 4 | `charts.test.ts` · 1 | SqBarChart screen-reader table only | entries + `/charts` | 4 | 35 lines |
| map | 1 | `cluster.test.ts` · 7 | clustering + `resolveMapStyle` | entry + `/map` | 1 | 43 lines |
| swiper | 1 | `swiper.test.ts` · 2 | pointer-cancel and drag-vs-click | entry + `/swiper` | 1 | 37 lines |
| editor | 1 | `editor.test.ts` · 5 | v-model, schema stripping, toolbar, `javascript:` link refusal, readonly | entry + `/editor` | 1 | 36 lines |
| icons | 1 | **none** (no `packages/icons/test`) | — | entry + `/icons` | 1 | 36 lines |
| nuxt | — (module) | **none** (no `packages/nuxt/test`) | indirect only: `examples/nuxt2/3/4` builds in CI | Guide `installation` (`Guide.vue:26-34`) | n/a | 48 lines |
| squirkle-ui (umbrella) | re-export | **none** (no `src`, no `test`) | indirect only: `examples/vue3-all-in-one` build in CI | Guide `installation` | n/a | 147 lines |

## CI stages (`.github/workflows/ci.yml`)
| Stage | Where | Trigger |
| --- | --- | --- |
| frozen install | `:33-34` | every PR + push to main |
| `pnpm test` | `:35-36` | same |
| `pnpm typecheck` | `:37-38` | same |
| `pnpm build` (Vue 3 + Vue 2 + d.ts) | `:40-41` | same |
| `pnpm examples:build` (vue3, all-in-one, vue2 vite/webpack, nuxt 4/3/2) | `:43-44` | same |
| `pnpm changeset status --since=origin/$BASE_REF` | `:47-68` | PRs only |
| docs + Storybook + examples build, deploy | `pages.yml:35-52` | push to main / manual only |

Hardening already in place: `permissions: contents: read` (`ci.yml:10-11`), `persist-credentials: false` (`:26,56`), base ref passed through env (`:65-68`), concurrency cancel (`:14-16`).

## Gaps, prioritized
| # | Priority | Gap | Evidence |
| --- | --- | --- | --- |
| 1 | High | **The Vue 2 runtime is never tested.** Vitest runs only `@vitejs/plugin-vue` (Vue 3). Vue 2.7 is checked only by compiling `dist/vue2` and building the vue2/nuxt2 examples, so its behavior (v-model `model` option, `.sync`, ARIA `'false'` strings) is not asserted anywhere. | `vitest.config.ts:2,7`; `.ai/CONVENTIONS.md` Vue 2/3 compatibility |
| 2 | High | **Docs and Storybook builds don't run on PRs.** A broken docs registry or story only fails on main in `pages.yml`, after the merge. `vue-tsc` type-checks both but doesn't bundle them. | `ci.yml` has no docs or Storybook build step; they are built only by `pnpm build:pages` (`pages.yml:5-8,35-36` → `scripts/pages.mjs:35-41`) |
| 3 | High | **`@squirkle-ui/nuxt` has no tests and is excluded from typecheck.** The module injects theme CSS at SSR (a G12 path). The only check is that the examples build. | `tsconfig.json:28` excludes `packages/nuxt/**`; no `packages/nuxt/test` |
| 4 | Medium | **76 of 88 ui components are never referenced in a test.** Forms are partly covered. Overlays (SqMenu, SqDialog, SqSnackbar), the validation composable (`packages/ui/src/composables/validation.ts`) and the virtual scroll have no tests. No composable is imported directly by any test. | test imports: `packages/ui/test/components.test.ts:4` |
| 5 | Medium | **Add-on components are tested through pure helpers only.** The mounted SqDataGrid, SqCalendar and SqMap and 3 of 4 charts have no component test. `@squirkle-ui/icons` has no tests at all. Its Iconify fetch path swallows errors (`packages/ui/src/icons.ts:102`). | matrix above |
| 6 | Medium | **No coverage measurement.** There is no coverage provider or threshold, so the gaps above can't be tracked as a number. | `vitest.config.ts`, `package.json` scripts |
| 7 | Low | **Examples are built but never run.** No smoke or SSR render test (Nuxt hydration, Vue 2 mount) exists. A build that succeeds can still fail at runtime. | `scripts/examples.mjs:31-40` only builds |
| 8 | Low | **No lint or format step.** The SSR-safety and Vue 2/3 template rules in CONVENTIONS are enforced by review only. | `package.json` scripts; `.ai/PROJECT.md` Commands |
| 9 | Low | **15 ui components appear only as `subcomponents` of another story.** The coverage test passes, but they have no stories of their own (SqRadio, SqTab, SqField, SqListItem, SqRow/SqCol, SqExpansionPanel…). | inventory script output; `storybook-coverage.test.ts:31` |
| 10 | Low | **The docs API table lists props and events only.** It shows no slots and no descriptions (prop JSDoc isn't surfaced), so the site is not a full API reference. | `apps/docs/src/components/ApiTable.vue:8,14,28-38` |
| 11 | Info | **The umbrella `squirkle-ui` package isn't checked directly.** Its re-exports are verified only by building `examples/vue3-all-in-one`. | no `packages/squirkle-ui/src` or `test` |

Not found (no evidence, so not reported as an issue): flaky tests. The single local run passed, and there's no CI history in the repo.

## Exact commands to reproduce
`pnpm test` · `pnpm typecheck` · `pnpm build` · `pnpm examples:build` · `pnpm build:docs` · `pnpm build:storybook` · `pnpm changeset status --since=origin/main`

## Acceptance
- [x] Every package has a test/docs/story status (matrix, 11 packages).
- [x] CI workflow stages and omissions reported (CI stages + gaps 1, 2, 3, 6, 7, 8).
- [x] Gaps have file/line or command evidence.
