# Decision
Version and changelog the 11 published packages with Changesets (`@changesets/cli` 3), all in one `fixed` group so every release puts every package on the same version. Publishing stays manual (`scripts/release.mjs` + `npm publish`, ADR 0005).

## Context
ADR 0005 deferred a versioning tool. Hand bumps (`npm version` / `npm pkg set`) let versions drift within a week (editor 0.1.0, calendar 0.1.3, the rest 0.1.2), there was no CHANGELOG, and nothing on a PR recorded whether a package change needed a release. The all-in-one `squirkle-ui` package re-exports every add-on, and add-ons depend on `^0.x` of `ui`, so a breaking `ui` minor in 0.x already forces releases of its dependents.

## Decision
- `@changesets/cli` ^3.0.3 as a root devDependency; config in `.changeset/config.json`: `fixed` = all 11 publishable packages, `access: public`, `baseBranch: main`, `updateInternalDependencies: patch`, `privatePackages: { version: false, tag: false }` (apps and examples are never versioned), `commit: false`, default changelog (`@changesets/cli/changelog`, no GitHub token).
- Scripts: `pnpm changeset` (write a changeset) and `pnpm version-packages` (`changeset version`: bumps + `CHANGELOG.md`).
- The agent may write `.changeset/*.md` files as part of a task (CODE_REVIEW checklist). Only the user runs `pnpm version-packages` or publishes (G3/G4). `changeset publish` is not used; `scripts/release.mjs` reads the bumped `package.json` versions.
- CI (`.github/workflows/ci.yml`, job `changeset`) fails a PR that changes a publishable package without a changeset; `pnpm changeset --empty` marks a change that needs no release.
- The release commit from `pnpm version-packages` goes straight to `main`, not through a PR: it deletes the consumed changesets while changing every package, which the PR-only changeset job would reject.
- 0.x semver: `patch` for fixes and additions, `minor` for breaking changes.

## Alternatives
Independent versions per package (keeps unchanged packages still, but versions drift again and the all-in-one package's ranges are harder to read); manual bumps with a hand-written CHANGELOG (what drifted); `release-please` (needs a GitHub token and a bot PR flow).

## Consequences
Every release bumps all 11 packages, even ones with no change (the first one takes editor from 0.1.0 to 0.1.4). Changesets 3 needs Node `^22.11 || ^24 || >=26`, newer than the repo's `>=20.19` engines; contributors on Node 20 can build and test but not run `pnpm changeset`. `changeset init` is interactive in v3, so the config was written by hand against the published schema (`@changesets/config@4.0.1/schema.json`).

## Affected Areas
`package.json`, `pnpm-lock.yaml`, `.changeset/`, `.github/workflows/ci.yml`, `.ai/PROJECT.md`, `.ai/CODE_REVIEW.md`, `.ai/TESTING.md`, `.ai/DEPENDENCIES.md`, `CLAUDE.md` (commands).
