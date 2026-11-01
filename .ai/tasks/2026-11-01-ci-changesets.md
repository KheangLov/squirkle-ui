# Task: CI on PRs + Changesets (approved: `go`, 2026-11-01)
Tier L — new dependency (`@changesets/cli`), new CI workflow, new ADR, release-process change. Confidence 85%.
Branch: `chore/ci-changesets` from `origin/main` (e9492a9).

## Objective
1. `.github/workflows/ci.yml` runs `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm examples:build` on every `pull_request` and push to `main`; any failing step fails the run.
2. Changesets records package changes as `.changeset/*.md`; `pnpm changeset version` (run by the user) turns them into version bumps and `CHANGELOG.md` entries. Publishing stays manual via `scripts/release.mjs`.

## Required changes
1. `.github/workflows/ci.yml` (new): `pull_request` + `push: branches: [main]`; `permissions: contents: read`; concurrency `ci-${{ github.ref }}`, cancel-in-progress. Job `checks` (ubuntu-latest, 30 min): checkout → pnpm → Node 24 (`cache: pnpm`) → `pnpm install --frozen-lockfile` → test → typecheck → build → examples:build, each a named step. Job `changeset` (PRs only): checkout `fetch-depth: 0`, same setup, `pnpm changeset status --since=origin/${{ github.base_ref }}`.
2. `package.json`: devDependency `@changesets/cli` `^3.0.3`; scripts `changeset` and `version-packages` (`changeset version`).
3. `.changeset/config.json` from `changeset init`, then: `fixed` = all 11 publishable packages, `access: public`, `baseBranch: main`, `updateInternalDependencies: patch`, `privatePackages: { version: false, tag: false }`, `commit: false`, default changelog. Keep `.changeset/README.md`.
4. `.ai/decisions/0006-changesets.md`: why Changesets, why fixed versions; agent may write `.changeset/*.md`, only the user runs `changeset version` / publishes.
5. `.ai/PROJECT.md` (commands, release flow, CI), `.ai/DEPENDENCIES.md` (row), `.ai/TESTING.md` (CI line), `.ai/CODE_REVIEW.md` (changeset checklist item), `CLAUDE.md` Commands block (2 lines; guardrail block untouched).

## Constraints
No `changeset version` / publish / version bump / push; no `.claude/settings.json`; no branch-protection changes; `pages.yml` and `scripts/release.mjs` unchanged; `git commit` only after chat confirmation.

## Acceptance criteria
- [ ] `ci.yml` with both triggers and the 4 named check steps in order.
- [ ] `changeset` job PR-only, `changeset status --since=origin/<base>`.
- [ ] `@changesets/cli ^3.0.3` root devDependency; lockfile diff changes nothing else.
- [ ] `.changeset/config.json`: `fixed` = exactly the 11 publishable names, `access: public`, `baseBranch: main`, `privatePackages.version: false`.
- [ ] Scratch changeset → all 11 packages at 0.1.4, no private package (scratch file removed).
- [ ] Local test, typecheck, build, examples:build exit 0.
- [ ] ADR 0006 + doc updates; `CLAUDE.md` guardrail block and `GUARDRAILS.md` unchanged.

## Implementation notes
- `changeset init` (v3) is interactive with no flags and hung without a TTY; `.changeset/config.json` was written by hand against the published schema `https://unpkg.com/@changesets/config@4.0.1/schema.json` (keys and defaults checked there). `.changeset/README.md` is hand-written.
- Scripts named `changeset` and `version-packages` (not `version`, which npm treats as a lifecycle hook).

## Checks (2026-11-01)
- `pnpm add -Dw @changesets/cli@^3.0.3`: lockfile +217 / −0 lines (no existing entry changed). `pnpm peers check` warnings (plugin-vue2 / Nuxt / vite) are pre-existing, not from Changesets.
- `pnpm changeset status --since=origin/main` on this branch: exit 0, nothing to bump PASS.
- Scratch `.changeset/scratch-check.md` (`@squirkle-ui/ui: patch`) → `status --verbose --output`: all 11 publishable packages patch → 0.1.4; private apps/examples listed with type `none` and no version (not released) PASS. Scratch file removed.
- Gate check: uncommitted edit to `packages/core/README.md` without a changeset → `changeset status --since=origin/main` exit 1 ("Some packages have been changed but no changesets were found") PASS; file restored.
- Local CI steps: `pnpm test` 60/60 (4 s) · `pnpm typecheck` 0 errors (5 s) · `pnpm build` (10 s) · `pnpm examples:build` all 7 incl. standalone nuxt2 (58 s) — all exit 0 PASS.
- `ci.yml` parsed with Ruby `YAML.safe_load`: triggers `pull_request` + `push: main`, `contents: read`, `checks` steps in order, `changeset` job `if: github.event_name == 'pull_request'` PASS.
- NOT RUN: a real GitHub Actions run (needs the user's push + PR); `pnpm version-packages` (user-only).

## Review (/check-all, 2026-11-01)
| Agent | Verdict | Blockers | Top findings |
|---|---|---|---|
| code-reviewer | PASS WITH NOTES (approve) | none | `base_ref` interpolated into `run:` (expression-injection pattern); release commit via a PR would fail the changeset job; docs-only PRs unverified; checkout keeps token; `cancel-in-progress` also on `main`; install steps unnamed; CHANGELOG in tarballs unverified |
| test-verifier | PASS WITH NOTES | none | all 7 criteria PASS from its own runs (test 60/60, typecheck 0, build, examples 7/7, status exit 0, scratch → 11 × 0.1.4, lockfile +217/−0); GitHub run and action tags NOT RUN |
| visual-tester | skipped | — | no `.vue`/`.css` in the diff |

Applied after review (within planned files):
- `ci.yml`: `BASE_REF` passed through `env:` and quoted (`--since="origin/$BASE_REF"`); `persist-credentials: false` on both checkouts; install steps named `Install`. Re-parsed with Ruby YAML PASS; `BASE_REF=main bash -c 'pnpm changeset status --since="origin/$BASE_REF"'` exit 0 PASS.
- Docs-only check: edit to `apps/docs/index.html` → `status` exit 0; edit to `examples/README.md` → exit 0 PASS (files restored).
- `.ai/PROJECT.md` + ADR 0006: release commit goes straight to `main`, not via a PR.
Not applied: `cancel-in-progress` on `main` (the approved plan specifies `true`; optional change for the user). Follow-up at the first `pnpm version-packages` + `release.mjs` run: confirm `CHANGELOG.md` lands in each tarball (depends on each package's `files`).

## Plan
1. Branch + this file. 2. Install + `changeset init` + config. 3. Scripts. 4. `ci.yml`. 5. Edge-case checks. 6. Full local run. 7. ADR + docs. 8. `/check-all`. 9. Report, ask before commit.
Rollback: delete `ci.yml` and `.changeset/`, remove devDependency + scripts, revert docs.
