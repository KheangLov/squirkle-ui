# v1.0.0 readiness: consolidated report

Task: `2026-11-04-v1-readiness-release` (parent `2026-11-04-v1-readiness-plan`) · base `a71f5b1` · 2026-11-04 · read-only. I bumped no versions, published nothing and changed no git state.

Sources:
- [public API report](2026-11-04-v1-readiness-public-api-report.md) (cited as **API-n**)
- [parity report](2026-11-04-v1-readiness-parity-report.md) (**PAR-Gn**)
- [quality report](2026-11-04-v1-readiness-quality-report.md) (**Q-n**)
- My own release checks below (**REL-n**)

## Executive status

**Recommendation: NO-GO for 1.0.0 today. Confidence 85%.**

The code builds and type-checks for both Vue majors and all three Nuxt majors. Tests pass. The release tooling is sound and safe. What blocks 1.0.0 is the contract, not the build: semver would freeze surface that hasn't been decided yet (API-1..3, Nuxt options), and one of the two runtimes the library promises (Vue 2.7) has never been exercised by a test.

| Axis | Status | Basis |
| --- | --- | --- |
| Public API freeze | **Fail** | 6 owner decisions open (API report "API freeze decisions") |
| Vue 2.7 / 3 parity | Build Pass · Test Fail (Vue 2) · Runtime NOT RUN | PAR matrix, PAR-G1, PAR-G2 |
| Nuxt 2 / 3 / 4 | Build Pass · Test none · Runtime NOT RUN | PAR Nuxt matrix, Q-3 |
| Tests | Partial: 70 tests pass, but 76 of 88 ui components and 2 packages are untested | Q matrix, Q-4, Q-5 |
| Docs | Mostly Pass: 88/88 registry entries, 11 READMEs; the API table has no slots | Q-10 |
| CI | Pass with gaps: no docs/Storybook build on PRs, no coverage, no lint | Q-2, Q-6, Q-8 |
| Release / changesets | Pass with gaps: fixed group correct, but no 1.0 changeset, tags or CHANGELOGs | REL-1..6 |

## Release and changeset assessment (this task)

Checks I ran:

| Check | Result | Evidence |
| --- | --- | --- |
| `.changeset/config.json` fixed group | PASS | One group lists all 11 names from the manifests (`.changeset/config.json:5-17`). This closes the API report's open question U. |
| `pnpm changeset status --verbose` | PASS (exit 0) | The single pending changeset `.changeset/router-link-href.md` (ui patch) bumps all 11 packages to **0.1.4**. The fixed group realigns the drift (calendar 0.1.3, editor 0.1.0). |
| Release script review (`scripts/release.mjs:1-37`) | PASS | Builds, then runs `pnpm pack` into `.release/` (gitignored, `.gitignore:8`) and only **prints** `npm publish … --otp` in dependency order. It never publishes. The order covers all 11 packages. |
| `node scripts/release.mjs` | NOT RUN | It writes `dist/` and `.release/`, so it is a dry run the user should do. |
| Registry state (`npm view`) | NOT RUN | External network. The user can run it (see commands). |

Gaps:

| # | Priority | Gap | Evidence | Closure criterion |
| --- | --- | --- | --- | --- |
| REL-1 | Blocker (procedural) | No `major` changeset exists, so the next `version-packages` would produce 0.1.4, not 1.0.0. | `changeset status` output above | `pnpm changeset status --verbose` lists every package `-> 1.0.0` |
| REL-2 | High | No git tags exist and the release flow creates none, so published versions can't be traced to a commit. | `git tag` is empty; `release.mjs` has no tag step | After publishing, a `v1.0.0` tag (or `pnpm changeset tag`) exists on the release commit |
| REL-3 | Medium | No `CHANGELOG.md` exists in any package. `version-packages` will create them, but they'll start at 1.0.0 with only the pending entries, so 0.1.x history is lost. | `ls packages/*/CHANGELOG.md` finds none | Owner accepts this, or the 1.0 changeset text summarises the 0.x → 1.0 changes (API decisions, breaking renames) |
| REL-4 | Medium | `release.mjs` doesn't gate on `pnpm test`/`typecheck`, a clean tree or aligned versions before packing. | `scripts/release.mjs:15-17` runs only build | Either a G12 task adds the gates (BUILD-SECURE), or the user runs the pre-flight commands below every time |
| REL-5 | Medium | A packed tarball has never been installed into a fresh app. `workspace:^` rewriting and the `files` lists are unverified as a consumer would see them (= PAR-G7). | Examples use `workspace:*`/`link:` | `pnpm pack` output installs into a clean Vue 3, Vue 2 and Nuxt app and builds |
| REL-6 | Low | Publishing is manual with 2FA OTP and has no npm provenance. Acceptable for 1.0; record it as a decision. | `release.mjs:33` | Decision recorded |

## Prioritized gaps (all reports reconciled)

### Blockers: must close before tagging 1.0.0

| # | Gap | Sources | Evidence | Closure criterion |
| --- | --- | --- | --- | --- |
| B1 | `./dist/types/*` is exported from 10 packages, which makes the internal d.ts layout semver-bound. | API-1 | every non-nuxt `package.json` `exports`; `scripts/build.mjs:26` | Owner decision 1 recorded. Either the export is documented as stable, or the types are restructured and `pnpm build` + `pnpm examples:build` pass. |
| B2 | Wildcard exports (core, calendar, datagrid) and ~14 low-level ui helpers are public by accident. | API-2, API-3, API-6 | `core/src/index.ts:1-4`, `datagrid/src/index.ts:5-6`, `ui/src/index.ts:5-14` | Every exported symbol is classed public, internal or removed. Wildcards are replaced with named lists. The built `dist/types/index.d.ts` matches the decided list. |
| B3 | Nuxt module options are unfrozen: there are no types, and `prefix` exists only on Nuxt 3/4. | API-8, API-9, PAR-G6, Q-3 | `packages/nuxt/package.json`; `module.mjs:19` vs `nuxt2.cjs:9` | Options are typed (d.ts shipped) and Nuxt 2 either supports `prefix` or the docs state it doesn't. G12 path, so BUILD-SECURE. |
| B4 | The Vue 2.7 runtime is never tested. | PAR-G1, Q-1 (both High) | `vitest.config.ts` uses only plugin-vue | A Vue 2 Vitest project mounts every `componentNames` entry and passes in CI. |
| B5 | No major changeset exists. | REL-1 | above | as REL-1 |

### High

| # | Gap | Sources | Closure criterion |
| --- | --- | --- | --- |
| H1 | No runtime or SSR smoke for any example. PAR rates this High and Q-7 rates it Low; I rate it **High**, because a hydration or SSR crash in Nuxt is a 1.0-visible failure that a build can't catch. | PAR-G2, Q-7 | Nuxt 2/3/4 examples serve HTTP 200 with `sq-theme-vars` in the HTML; the Vue 2/3 examples mount headlessly without console errors |
| H2 | Vue peer floor `^3.3.0` is untested; the repo builds on 3.5. | API-12, PAR-G9 | Decision 5: raise to `^3.5.0`, or add a 3.3 CI job |
| H3 | Docs and Storybook builds don't run on PRs. | Q-2 | `ci.yml` builds docs and Storybook on `pull_request` (G12 change) |
| H4 | Tarball install never verified. | REL-5, PAR-G7 | as REL-5 |
| H5 | No tags. | REL-2 | as REL-2 |

### Medium
- **Theme CSS injected into `<head>` is only partly sanitized** (PAR-G4, G12). It becomes stored XSS if an app feeds user-chosen themes. Needs a BUILD-SECURE task that strips or validates `</>{};` in names, keys and values. A fix is safer before 1.0, because it may reject values that are accepted today.
- **Test depth is thin.** 76 of 88 ui components are untested (Q-4). Add-ons are tested only through pure helpers (Q-5). `icons` and `nuxt` have no tests (PAR-G8, Q-3). There is no coverage measurement (Q-6).
- **Inconsistent package conventions:** default exports (API-5), CSS side-effect imports (API-7), `componentNames` contract (API-11), and no `./package.json` export or `engines` field (API-10). Each is cheap now and breaking later.
- **Umbrella `squirkle-ui`:** no Vue 2 consumer and no Nuxt support (PAR-G5, Q-11).
- **Vue 2 types:** they point at the Vue 3 d.ts, and the impact is unverified (API-4).
- **Release script and CHANGELOGs:** REL-3, REL-4.

### Low
- No lint or format step (Q-8).
- 15 ui components appear only as Storybook subcomponents (Q-9).
- The API table has no slots or descriptions (Q-10).
- The Nuxt 2.17 claim has no example (PAR matrix note).
- The Iconify `catch {}` swallows errors (`packages/ui/src/icons.ts:102`).
- REL-6.

## Disagreements and uncertainty kept
- **Runtime smoke priority:** PAR says High and Q says Low. I resolved it as High (H1), with the reason given there.
- **`pnpm build` / `examples:build`:** PAR ran them (Pass) and Q did not (NOT RUN). The PAR result stands for base `a71f5b1`.
- **Unknowns that could change the verdict:**
  - The emitted d.ts surface compared with the source (API "Uncertain").
  - Real runtime behavior on any framework.
  - Whether every public symbol is documented.
  - The npm registry's current versions.

## Package cross-links

| Package | API | Parity | Quality | Open blockers |
| --- | --- | --- | --- | --- |
| core | API-2 wildcard | Pass | 18 tests | B1, B2 |
| ui | API-3 internals, API-7 | Vue 2 untested | 12/88 referenced | B1, B2, B4 |
| calendar / datagrid | API-2 wildcard | Pass | helpers only | B1, B2 |
| charts / icons | API-5 no default | Pass | icons: no tests | B1 |
| map / swiper / editor | — | Pass (map vector off on Nuxt 2 by design) | helpers / small | B1 |
| nuxt | API-8, API-9 | PAR-G6 | no tests, not typechecked | B3 |
| squirkle-ui | — | no Vue 2 consumer | none | — |

## Recommended order
1. **Owner decisions.** Answer the 6 API questions, the Vue floor question and the REL-6 decision. Record them in `.ai/DECISIONS.md`.
2. **API fixes.** Tasks `api-explicit-exports`, `api-types-layout`, `api-manifest-polish` and `nuxt-module-types-and-parity` (BUILD-SECURE where G12) close B1–B3 and the Medium convention items.
3. **Test work.** A Vue 2 Vitest project closes B4. Runtime smoke closes H1. A theme sanitization task (BUILD-SECURE) closes PAR-G4.
4. **CI.** A docs and Storybook PR build closes H3 (G12).
5. **Tarball install check.** Closes H4.
6. **Release (user).** Add the major changeset, then version, pack, publish and tag, using the commands below.

## Checks summary
| Check | Result |
| --- | --- |
| `pnpm changeset status --verbose` | PASS (exit 0; 11 packages → 0.1.4) |
| config / release script review | PASS |
| `pnpm test`, `pnpm typecheck` | PASS (from PAR and Q runs at `a71f5b1`; not re-run here) |
| `pnpm build`, examples builds | PASS (from the PAR run; not re-run here) |
| `node scripts/release.mjs`, `npm view` | NOT RUN |

## Commands for you (user-only; no agent runs these)

Pre-flight, read-only or local build:
```
pnpm install --frozen-lockfile
pnpm test && pnpm typecheck && pnpm build && pnpm examples:build
pnpm build:docs && pnpm build:storybook
pnpm changeset status --verbose
npm view @squirkle-ui/ui versions --json        # current registry state
```

When B1–B4 are closed, the release:
```
pnpm changeset                     # choose every package, bump "major", describe the 1.0 API
pnpm changeset status --verbose    # expect: every package -> 1.0.0
pnpm version-packages              # user only: bumps all 11 + writes CHANGELOGs
git add -A && git commit -m "chore: release 1.0.0"
node scripts/release.mjs           # builds + packs into .release/, prints publish commands
# run each printed: npm publish .release/<tgz> --access public --otp=<code>
# run each printed: npm view <name> readmeFilename --prefer-online
git tag v1.0.0 && git push origin main --tags
```
