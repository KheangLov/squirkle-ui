# Task: upstream Rien's pnpm patches for core and ui (approved: `go`, 2026-11-01)
Approved plan: as shown in chat (tier M, confidence 90%) — on branch `fix/rien-patches` (from `origin/main` 5437d1e): CSS superellipse geometry as the default `getSquirclePath` shape, Figma geometry kept behind `geometry: 'figma'`; icon aliases also replace bare built-in names. Release (version bumps / publish) stays with the user.
Source: Rien `patches/@squirkle-ui__core@0.1.1.patch` and `patches/@squirkle-ui__ui@0.1.1.patch` (applied to built dist, 0.1.1).

## Changes
- `packages/core/src/squircle.ts`: new `SquircleGeometry = 'css' | 'figma'` and `geometry` option (default `css`). `css` draws |x|⁴ + |y|⁴ = 1 per corner in a box of `r · (1 + s)` (24 segments), with CSS's shared scale-down when adjacent corners overlap — the shape native `.sq-squircle` gets from `border-radius: r · (1 + s); corner-shape: squircle` (`packages/ui/src/styles/base.css`). `preserveSmoothing` applies to `figma` only. `getSquircleStrokePath` with `css` shrinks the corner span by half the stroke width (radius − half / (1 + s)), as CSS sizes inner border corners; `figma` keeps radius − half.
- `packages/ui/src/icons.ts` `resolveIcon`: a bare name with an alias key (`close`, `chevronDown`, …) resolves through the alias (single lookup), so `icons.aliases` swaps the icons components draw. `$name` unchanged. `config.ts` doc comment updated.
- `packages/core/README.md`: `geometry` documented; `smoothing` meaning per geometry.
- Tests: core — superellipse points, shared scale-down, figma arcs, css stroke inset, radius-0 rectangle; ui — alias replaces bare and `$` built-in name, other built-ins untouched, restored after delete.

## Behaviour changes for consumers
- Direct `getSquirclePath` / `getSquircleStrokePath` callers get the CSS shape by default; `geometry: 'figma'` restores the old one. With `css`, smoothing 0 is still a squircle (as native), not a rounded rect.
- `@squirkle-ui/icons` `useIconPreset` sets `home`, a built-in name, so bare `icon="home"` now follows the preset too.

## Checks (2026-11-01)
- `pnpm test` 60/60 PASS · `pnpm typecheck` 0 errors · `pnpm build core ui` PASS.
- Alias test fails on the old `icons.ts` (mutation check PASS).
- Built `css` fill paths equal Rien's patched 0.1.1 output coordinate for coordinate on 5 sizes (incl. pill, per-corner, smoothing 0); only whitespace differs.
- NOT VERIFIED: visual check in Safari / `squircle.mode: 'svg'`; Vue 2.7 example build (`pnpm examples:build`); stroke match against a native border in a browser.
- Release status (user-only, G-rules): core and ui need a version bump + publish before Rien can drop its patches.
