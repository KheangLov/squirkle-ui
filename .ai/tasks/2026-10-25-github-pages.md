# Task: host docs, Storybook and examples on GitHub Pages (approved: `go`, 2026-10-25)
Approved prompt + plan: as shown in chat (tier L; confidence 85%).
- Site `https://kheanglov.github.io/squirkle-ui/`: `/` docs, `/storybook/`, `/examples/` index + `/examples/<name>/` (Nuxt via `nuxt generate`).
- Optional `BASE_PATH` env per app (default `/`); `scripts/pages.mjs` + `pnpm build:pages` assemble `_site/`; `.github/workflows/pages.yml` (push to main + manual) builds and deploys; docs app bar links (Pages build only); README links.
- No new dependencies. Agent does not push/deploy; user enables Pages (Source: GitHub Actions) and pushes/merges.

## Checks (2026-10-25)
- `pnpm build:pages` PASS: packages, docs, Storybook, 7 examples (Nuxt via `nuxt generate`) → `_site/` 36 MB; `pnpm typecheck` 0 errors; workflow YAML parses (jobs build, deploy).
- Served at http://localhost:5195/squirkle-ui/ (launch `pages-preview`): docs routes, map (MapLibre worker `/squirkle-ui/assets/…` 200), editor page, DateTime field, Pages-only Storybook/Examples links PASS; Storybook sidebar + docs page render PASS; examples index (7 cards) PASS; each example in an iframe: 8 sections, editor, map canvas (Nuxt 2 raster), DateTime value, no failed requests, no JS errors PASS; Nuxt pages pre-rendered with `/squirkle-ui/examples/<name>/_nuxt/` assets.
- NOT RUN: the GitHub Actions workflow itself (needs push + Pages source "GitHub Actions", user-only).
