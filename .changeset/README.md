# Changesets

Each change to a published package gets a small Markdown file here, written with `pnpm changeset`
(pick the packages, the bump type and a one-line summary). All 11 packages share one version
(`fixed` in `config.json`), so any changeset releases every package at the same new version.

Release (maintainer only): `pnpm version-packages` turns the files into version bumps and
`CHANGELOG.md` entries, then `node scripts/release.mjs` packs the tarballs to publish
(see `.ai/PROJECT.md`). While on 0.x: `patch` for fixes and additions, `minor` for breaking changes.

Docs: https://github.com/changesets/changesets
