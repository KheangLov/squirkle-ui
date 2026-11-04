---
slug: 2026-11-04-nuxt2-prefix
status: done
writer: claude
writer_access: repo
writer_model: claude-opus-5-5 / low
base_commit: 542f181e666d30feddf0877695b4cf934aa69d54
complexity: medium
mode: full
approval_word: go
parent: 2026-11-04-nuxt-module-plan
depends_on: [2026-11-04-nuxt-module-types]
implement_tier: BUILD-SECURE
files_to_read: [packages/nuxt/src/nuxt2.cjs:1-46, packages/nuxt/src/runtime/nuxt2-plugin.js:1-14, packages/nuxt/src/module.mjs:17-30, packages/nuxt/src/nuxt2.d.cts:1-30, packages/nuxt/README.md:30-48, packages/ui/src/plugin.ts:18-30, examples/nuxt2/nuxt.config.js:1-20, .ai/SECURITY.md:9-20]
files_to_modify: [packages/nuxt/src/nuxt2.cjs, packages/nuxt/src/runtime/nuxt2-plugin.js, packages/nuxt/src/module.mjs, packages/nuxt/src/nuxt2.d.cts, packages/nuxt/README.md]
files_to_create: [packages/nuxt/test/nuxt2.test.ts, .changeset/nuxt2-prefix.md]
---

# Implementation Prompt

Role: Senior Nuxt 2/3 module author, responsible for option parity between the two module entries, with no change for apps that don't set `prefix`.

Objective: The Nuxt 2 module accepts `prefix` (default `'Sq'`) and registers ui and add-on components as `<prefix><Name>` (e.g. `prefix: 'X'` gives `XBtn`). Both modules reject a prefix that doesn't match `/^[A-Za-z][A-Za-z0-9]*$/` with a clear error at build time.

Context: B3 (API-9, PAR-G6). Nuxt 3/4 already renames components through `addComponent` (`module.mjs:25-27`). Nuxt 2 registers everything globally through `createSquirkle` (`runtime/nuxt2-plugin.js:5`, `ui/src/plugin.ts:25-28`).

Relevant Files: `files_to_read`.

Required Changes:
1. `packages/nuxt/src/nuxt2.cjs`:
   - The defaults gain `prefix: 'Sq'` (`{ addons: [], css: true, prefix: 'Sq', … }`).
   - Call `assertPrefix(options.prefix)`, a local function that throws `new Error('[squirkle] prefix must match /^[A-Za-z][A-Za-z0-9]*$/, got ' + JSON.stringify(p))`.
   - Pass `prefix` in the `addPlugin` options.
2. `packages/nuxt/src/runtime/nuxt2-plugin.js`:
   - `import * as ui from '@squirkle-ui/ui/vue2'`.
   - `Vue.use(ui.createSquirkle({ ...<runtime>, components: false }))`.
   - `const rename = (n) => n.replace(/^Sq/, <%= JSON.stringify(options.prefix) %>)`.
   - Register `ui.componentNames` and each add-on's `componentNames` with `Vue.component(rename(name), mod[name])`.
   - The head block is unchanged.
   - With `prefix: 'Sq'` the registered set is identical to today's: `createSquirkle` registers `Object.entries(components)` minus `componentNames`, which is the `componentNames` list. Verify with the test below.
3. `packages/nuxt/src/module.mjs`: the same `assertPrefix` check at the start of `setup`. Nothing else changes.
4. `packages/nuxt/src/nuxt2.d.cts`: add `prefix?: string` with TSDoc to `ModuleOptions`.
5. `packages/nuxt/README.md`: in the Nuxt 2 section, show `prefix` in the example options and remove any wording that says Nuxt 2 lacks it.
6. `packages/nuxt/test/nuxt2.test.ts` (Vitest, node env via `// @vitest-environment node`). Call the CJS module through `createRequire` with a fake `this`: `{ options: { css: [], build: { transpile: [] }, rootDir }, addPlugin: vi.fn(), extendBuild: vi.fn() }`. Cases:
   - (a) The default prefix gives `addPlugin` options with `prefix: 'Sq'`.
   - (b) `{ prefix: 'X' }` is passed through.
   - (c) `{ prefix: 'x-y' }` throws the error message.
   - (d) `{ addons: ['charts', 'bogus'] }` gives `addons: ['charts']`, and `options.css` contains the ui and charts stylesheets.
   - (e) `ui.componentNames` from `packages/ui/src/components` equals the set of non-`componentNames` keys of that module, proving the registered set doesn't change at `'Sq'`.
7. `.changeset/nuxt2-prefix.md`: a `minor` for `@squirkle-ui/nuxt`: "Nuxt 2 supports `prefix`; both modules reject an invalid prefix."

Existing Patterns To Reuse: the `componentNames` loop already in `nuxt2-plugin.js:6`; the `addComponent` rename `name.replace(/^Sq/, options.prefix)` in `module.mjs:26`; the test style in `packages/editor/test/editor.test.ts`.

Current Implementation: Nuxt 2 has no `prefix` (`nuxt2.cjs:9`) and registers ui through `createSquirkle`'s default `components`.

Architecture Constraints:
- Vue 2 only in the runtime plugin.
- The template interpolates only `JSON.stringify` values.
- No head or sanitizer change (`__dangerouslyDisableSanitizersByTagID` stays as it is).
- No dependency change.

Edge Cases:
- `prefix: ''` is rejected by the regex. That is intended: an empty prefix collides with native HTML tags (`Btn` is fine, but `Table` and `Form` aren't safe).
- Add-on components keep working under the prefix.
- `SqMap` on Nuxt 2 still uses the raster-only stub.

Error Handling: an invalid prefix throws at build time from both modules with the message above, and Nuxt prints it. No silent fallback.

Performance: N/A. The same number of global registrations.

Security: G12 (Nuxt head injection files). `prefix` ends up in generated code, as a template literal in Nuxt 2 and as component identifiers in Nuxt 3/4's generated `components.d.ts`. The regex plus `JSON.stringify` prevent code injection. The security pass checks both, and checks the head block diff is empty.

Testing Requirements:
- The new test file runs under `pnpm test`.
- `pnpm build`, all 6 examples via `examples.mjs`, and `pnpm --dir examples/nuxt2 build` with the default prefix. Then grep `examples/nuxt2/.nuxt/squirkle.js` for `"Sq"`.
- A one-off prefixed build: a scratchpad config that spreads the example config with `rootDir: <abs examples/nuxt2>` and `buildModules: [['@squirkle-ui/nuxt/nuxt2', { addons: ['datagrid'], prefix: 'X' }]]`, run with `pnpm --dir examples/nuxt2 exec nuxt build -c <scratch config>`. It exits 0 (the example's pages use `Sq*` tags, which would then be unknown elements; a compile warning is expected, not a failure), and `.nuxt/squirkle.js` contains `"X"`. Afterwards, rebuild with the default config.
- `pnpm typecheck`, the nuxt4 type check from the types task, and `pnpm changeset status`.

Acceptance Criteria:
- [ ] Test cases (a)–(e) pass.
- [ ] The default nuxt2 build passes and its plugin contains `"Sq"`.
- [ ] The prefixed one-off build exits 0 and its plugin contains `"X"`.
- [ ] test, typecheck, all 7 examples and changeset status exit 0.
- [ ] The head and sanitizer lines in `nuxt2-plugin.js` are unchanged.

Constraints: only the listed files; the scratch config lives in the scratchpad. Commit `feat(nuxt): prefix option on Nuxt 2` when the user asks.

Output Format: the check table in this file.

# Implementation Plan

Steps:
1. `nuxt2.cjs`: add the default and the check.
2. Rewrite the plugin registration.
3. Add the check to `module.mjs`.
4. Update the d.cts.
5. Write the test.
6. Update the README and add the changeset.
7. Run the checks and the one-off prefixed build.
8. Do the security pass and run `/check-all`.

Files To Read:
- `nuxt2.cjs` and the plugin: the current flow.
- `module.mjs`: the rename pattern.
- `plugin.ts`: what `createSquirkle` registers.
- the d.cts: where `prefix` goes.
- the README: the Nuxt 2 section.
- the nuxt2 example config: the base for the scratch config.
- SECURITY: the scope.

Files To Delete: none. Dependencies: the types subtask must be done.

Risks:
- The fake `this` misses a property `nuxt2.cjs` uses; the test fails loudly.
- `nuxt build -c` path handling on Nuxt 2.18 is UNVERIFIED. If it fails, the fallback is to temporarily edit `examples/nuxt2/nuxt.config.js` and restore it with an empty `git diff`.

Testing Plan: as above.

Documentation: the README.

Model Tier: BUILD-SECURE.

Decision record needed? No. Parity follows from B3; the regex is an implementation detail.

# Prompt Quality Check
| Essential | Pass/Fail | Note |
| --- | --- | --- |
| Clarity | Pass | exact changes, test cases and commands |
| Role | Pass | |
| Context | Pass | |
| Format | Pass | |
| Iteration | Pass | added the registered-set equivalence test |

# Confidence
80%. The source was read end to end. Unverified: Nuxt 2 `-c` handling (a fallback is given), and whether ui's `componentNames` exactly matches its exported components (test e proves it).

## Import Check
approved_hash: 1740608e0b03b574e72d201ccf0b179766a9b212f8639a6b03d50f9d999a5510
Approved with `go` typed by the user in this session (2026-11-04). One-step refused (BUILD-SECURE, G12); approval given as its own message.

## Implementation Log
- 2026-11-04: Steps 1–6 done as specified. The plugin keeps a named `getThemeCss, config` import beside `import * as ui`, so the head block stays byte-identical.
- `assertPrefix` also rejects non-strings, so `prefix: undefined` passed explicitly throws on Nuxt 2.
- Test case (c) was widened to `''`, `1a` and `a"b`.
- `nuxt build -c <abs scratch config>` works on Nuxt 2.18; the fallback wasn't needed. Default config rebuilt afterwards.
- `componentNames` from the built `ui/vue2` entry: 88 names, none undefined.
- First run of the checks read `PIPESTATUS` under zsh (empty); all were rerun with `$?`.

## Checks
| Check | Result |
| --- | --- |
| `pnpm test` | Pass (78/78; re-run by test-verifier) |
| `pnpm typecheck` | Pass (re-run by test-verifier) |
| `pnpm build` | Pass by log tail only; exit code not captured (zsh `PIPESTATUS`), and later example builds used its output |
| `pnpm examples:build` + `pnpm --dir examples/nuxt2 build` | Pass (exit 0) |
| Default nuxt2 plugin contains `"Sq"` | Pass |
| Prefixed one-off build (`X`, datagrid) | Pass: exit 0, plugin contains `"X"` and the rename line |
| Rendered `XBtn` at runtime | NOT RUN: the generated code was read, no app was rendered |
| nuxt4 type check (`nuxi prepare`, then `tsc`) | Pass (exit 0) |
| `pnpm changeset status` | Pass; the fixed group makes the `minor` apply to every package |
| Head and sanitizer lines unchanged | Pass |
| Nuxt 3/4 `assertPrefix` rejecting a bad prefix | NOT RUN: no test, same code as Nuxt 2 |
| G12 security pass | Pass: code-reviewer found no injection path; injection-style prefixes rejected |
| code-reviewer | PASS WITH NOTES: 0 blockers, 2 MINOR, 1 NIT, left open. Explicit `prefix: undefined` throws on Nuxt 2 (Nuxt 3 falls back to the default); no Nuxt 3 validator test; the two ui imports could merge |
| test-verifier | PASS with minor gaps: 0 blockers; generated plugin and Nuxt 3 check have no unit test |
| visual-tester | NOT RUN: no UI change |

### /check-all re-run (2026-11-04, commit fbee5c1)
- code-reviewer: PASS WITH NOTES, 0 blockers. Read the diff only; ran nothing. Diff matches the spec. G12 pass found no injection path. Open MINORs: `assertPrefix` duplicated in `module.mjs` and `nuxt2.cjs`; no unit test for the Nuxt 3/4 check or the generated Nuxt 2 plugin; explicit `prefix: undefined` or `null` throws on Nuxt 2 but falls back on Nuxt 3. NITs: test (e) checks source `components`, not the built `ui/vue2` entry; README example shows the default `Sq`.
- test-verifier: PASS with minor gaps, 0 blockers. Re-ran `pnpm test` (78/78) and `pnpm typecheck` (exit 0); diff confirms head and sanitizer lines unchanged. Not re-run, log only: builds, examples, prefixed build, nuxt4 type check, `changeset status`. Gaps: no Nuxt 3/4 validator test, no runtime render of `XBtn`.
- visual-tester: NOT RUN: no UI change.

## Metrics
- Files: 5 modified, 2 created (as listed). Acceptance: 5/5 criteria pass.
