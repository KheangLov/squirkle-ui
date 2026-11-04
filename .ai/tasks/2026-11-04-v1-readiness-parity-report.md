# V1 readiness: Vue 2.7 / Vue 3 parity and Nuxt 2/3/4 compatibility report

Task: `2026-11-04-v1-readiness-parity` · base `a71f5b1` · run 2026-11-04 on darwin, Node from the local toolchain, existing `node_modules` (nothing installed).

## Evidence levels
- **Build**: the package or example compiled with exit 0 in this run.
- **Test**: an automated assertion ran (Vitest, happy-dom).
- **Runtime**: the app was rendered or served and behavior was observed. **No runtime check ran in this task (NOT RUN)** for any framework.

## Commands run (this session)
| Command | Exit | Time | Result |
| --- | --- | --- | --- |
| `pnpm test` | 0 | 6s | 10 files, 70 tests passed (Vue 3 only, see G1) |
| `pnpm typecheck` | 0 | 6s | clean |
| `pnpm build` | 0 | 10s | core, plus ui, datagrid, swiper, calendar, map, charts, icons and editor each as vue3 + vue2, then the `squirkle-ui` re-exports; vue-tsc d.ts per package |
| `node scripts/examples.mjs vue3-vite vue3-all-in-one vue2-vite vue2-webpack nuxt3 nuxt4` | 0 | 35s | all 6 built; the Showcase drift check passed |
| `pnpm --dir examples/nuxt2 build` | 0 | 16s | client + server compiled (nuxt2 was run directly to skip `examples.mjs`'s `pnpm install --frozen-lockfile`, G4-2) |

Warnings, all non-failing: vue2-webpack reports `export 'default' (imported as 'style0') was not found` in `Showcase.vue` styles, a MapLibre "Critical dependency: expression" warning, and asset-size warnings. nuxt2 reports asset and entrypoint size warnings. Vite reports chunk-size warnings (5).

Side effects: these steps regenerated the gitignored `packages/*/dist`, `packages/*/vue2/`, `packages/*/styles.css` and the examples' `dist`, `.nuxt` and `.output` folders. No tracked file changed (checked with `git status`).

## Matrix: packages × Vue major
| Package | Vue 3 build | Vue 2.7 build | Vue 3 tests | Vue 2 tests | Consumed by examples (build) |
| --- | --- | --- | --- | --- | --- |
| core (no Vue) | Pass (single build) | n/a (same output) | Pass `core.test.ts` | n/a | all 7 |
| ui | Pass | Pass | Pass (`components`, `surface`, `storybook-coverage`) | **none** | all 7 |
| datagrid | Pass | Pass | Pass `engine.test.ts` (engine logic) | none | all 7 |
| swiper | Pass | Pass | Pass `swiper.test.ts` | none | all 7 |
| calendar | Pass | Pass | Pass `layout.test.ts` (layout logic) | none | all 7 |
| map | Pass | Pass | Pass `cluster.test.ts` (clustering only) | none | all 7; vector engine excluded on Nuxt 2 |
| charts | Pass | Pass | Pass `charts.test.ts` | none | all 7 |
| icons | Pass | Pass | **no test file** | none | all 7 |
| editor | Pass | Pass | Pass `editor.test.ts` | none | all 7 (Nuxt 2: Tiptap transpile + aliases) |
| squirkle-ui (umbrella) | Pass (re-exports `vue3` dist) | Pass (`vue2.*` + `<addon>/vue2.*` re-exports) | none | none | `vue3-all-in-one` only, **no Vue 2 consumer** |
| nuxt | n/a (Node module) | n/a | **no test file** | none | nuxt2, nuxt3, nuxt4 |

How the dual build works (verified in source): `scripts/build.mjs:47-57` builds each non-core package twice through `build/vite.lib.mjs`. Vue 3 uses `@vitejs/plugin-vue` with target es2020. Vue 2 uses `@vitejs/plugin-vue2` with `vue2/compiler-sfc` and target es2019 (`build/vite.lib.mjs:16,26`). In the Vue 2 output, add-ons import `@squirkle-ui/<pkg>/vue2` (`vite.lib.mjs:40`). For webpack 4, which ignores `exports`, `vue2/package.json` and `styles.css` fallbacks are written (`build.mjs:33-41`). Each manifest declares `vue: ^2.7.0 || ^3.3.0` as a peer and exports `./vue2`. Runtime branching on the Vue major sits in one place: `isVue2` in `packages/ui/src/plugin.ts:31` (`$squirkle` on the prototype).

## Matrix: Nuxt paths
| Path | Entry | Component registration | CSS | Theme SSR head | Map | Editor | Build evidence | Runtime |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Nuxt 4 (4.6.2) | `@squirkle-ui/nuxt` → `src/module.mjs` | `addComponent` per name, with `prefix` option; map registered `mode: 'client'` | `nuxt.options.css` per package | `useHead` style `sq-theme-vars` + html class | worker `?url` client plugin, `optimizeDeps` tweaks (`module.mjs:59-87`) | Vite, no special handling | Pass `examples/nuxt4`, all 7 add-ons | NOT RUN |
| Nuxt 3 (3.21) | same module (`compatibility: '>=3.0.0'`, `@nuxt/kit ^4`) | same | same | same | same | same | Pass `examples/nuxt3`, all 7 add-ons | NOT RUN |
| Nuxt 2 (2.18, webpack 4) | `@squirkle-ui/nuxt/nuxt2` → `src/nuxt2.cjs` | `Vue.use(createSquirkle(...))` registers ui globally; add-ons via `componentNames` loop (`runtime/nuxt2-plugin.js`) | same pattern | vue-meta `head.style` with `__dangerouslyDisableSanitizersByTagID` | `maplibre-gl` aliased to a stub that throws; raster (Leaflet) only | `@tiptap/`, `prosemirror-` transpiled; `@tiptap/pm/*` aliases | Pass `examples/nuxt2` (client + server bundles) | NOT RUN |

Nuxt 2.17 is named in the `nuxt2.cjs:1` comment, but only 2.18 has an example.

## Gaps (prioritized, evidence-backed)
1. **G1 (high): Vue 2.7 has zero test coverage.** `vitest.config.ts` loads only `@vitejs/plugin-vue` (Vue 3) and the sources through `build/aliases`. Vue 2 parity rests entirely on builds succeeding. The compatibility rules in CONVENTIONS (ARIA string booleans, the `model` option, slot access, Transition classes) are not asserted for Vue 2 anywhere. Suggested direction: a second Vitest project that aliases `vue` to `vue2` with `@vitejs/plugin-vue2` and runs a mount smoke over `componentNames`.
2. **G2 (high): no runtime or SSR verification for any framework.** No Playwright or e2e exists, and no example is served or hydrated in CI (`.github/workflows` runs test, typecheck, build, `examples:build` and `build:pages` only). Hydration mismatches, SSR crashes (Nuxt 2 registers `SqMap` for SSR, while Nuxt 3/4 make it client-only) and runtime Vue 2 bugs would pass CI. Suggested direction: `nuxt build && nuxt start` (or `generate`) plus a fetch that asserts HTTP 200 and the `sq-theme-vars` markup for nuxt2/3/4, and a headless render of vue2/vue3 examples.
3. **G3 (medium): the Nuxt module has no tests.** `packages/nuxt` has no `test/` folder. Option merging, addon filtering, `prefix`, `css: false` and the map worker branch are covered only by the examples, and those always pass all 7 add-ons with default options.
4. **G4 (medium, G12 hardening): theme CSS injected into `<head>` is only partly sanitized.** `appearanceCss` strips `;{}<>` from fonts (`packages/core/src/theme.ts:208`). `themeVars` and `createThemeCss` (`theme.ts:179-192`) interpolate theme **names, color keys and color values** without escaping. That CSS goes out through `useHead` `innerHTML` (Nuxt 3/4) and through vue-meta with the sanitizer explicitly disabled (Nuxt 2, `runtime/nuxt2-plugin.js`). The html class `'sq-theme--' + config.theme.name` is also unsanitized. Today the values come from developer config, so this is not exploitable from end-user input by itself. It becomes a stored-XSS vector if an app feeds per-tenant or user-chosen themes into `squirkle.theme` or `createBrandTheme`. Recommend a dedicated task, BUILD-SECURE: strip or validate `</>{};` in theme names, keys and values.
5. **G5 (medium): the umbrella `squirkle-ui` package has no Vue 2 consumer.** Its `vue2` and `<addon>/vue2` re-exports (`scripts/build.mjs:68-79`) are built but never imported by an example. Neither Nuxt module supports the umbrella; both hard-code `@squirkle-ui/<pkg>`.
6. **G6 (low): Nuxt 2 vs 3/4 option parity.** Nuxt 2 ignores `prefix` (no option in `nuxt2.cjs`) and always registers ui globally. Nuxt 3/4 support `prefix` and lazy auto-import. The SqMap vector engine is unavailable on Nuxt 2 by design (stub throws a clear error). This is documented in the code comments; check that the user docs say the same.
7. **G7 (low): packaging details unverified on a real registry install.** The `@squirkle-ui/nuxt` `exports["."]` has only an `import` condition, so `require('@squirkle-ui/nuxt')` fails and Nuxt 2 must use `/nuxt2`, as the docs and example do. `peerDependencies` use `workspace:^`, which pnpm rewrites on publish. Every example consumes the packages via `workspace:*` or `link:`, so a packed-tarball install (`pnpm pack` → fresh app) has never been exercised.
8. **G8 (low): `icons` has no test file.** It also has the known swallowed-error `catch {}` in `packages/ui/src/icons.ts:102`, listed in CONVENTIONS anti-patterns.
9. **G9 (info): the Vue 2.7 floor is not pinned in examples beyond 2.7.16 (`vue2` alias).** Vue 2.7.0–2.7.15 and Vue 3.3–3.4 fall inside the peer ranges but are not exercised. The examples use Vue 3.5.

## Acceptance criteria
- [x] Vue 2.7/3 parity assessed for all packages: package matrix above, with build Pass for both majors on all 9 Vue packages plus the umbrella.
- [x] Nuxt 2/3/4 paths assessed: Nuxt matrix above, source-traced, with all three example builds Pass.
- [x] Evidence distinguishes build, test and runtime coverage: three columns per row; runtime is NOT RUN everywhere and is flagged as gap G2.
