# DESIGN_SYSTEM
Purpose: single source for tokens, theming, the squircle surface pattern and UI patterns. (UI.md merged here; component inventory → `.ai/COMPONENTS.md`.)
Read when: any UI work, Figma work, or adding/changing a component.

## Token sources
| Source | Defines |
|---|---|
| `packages/ui/src/styles/tokens.css` | radius, smoothing, spacing, type, control sizes, elevation, motion, z-index, state opacity, focus ring, breakpoint reference |
| `packages/core/src/theme.ts` (`defaultThemes`) | color tokens per theme → `--sq-<color>` (+ auto `--sq-on-<semantic>`) |
| `packages/charts/src/styles.css` | `--sq-series-1..8` categorical chart palette (light / `.sq-theme--dark`) |
| `packages/ui/src/composables/display.ts` | JS breakpoints (mirror `--sq-bp-*`) |

## Color (theme `light` / `dark`) — Figma variable: UNKNOWN
| Token | Light | Dark |
|---|---|---|
| `--sq-primary` | `#5b5bd6` | `#6262e0` |
| `--sq-secondary` | `#8e4ec6` | `#9152cc` |
| `--sq-accent` | `#e93d82` | `#f0569a` |
| `--sq-success` / `--sq-info` / `--sq-warning` / `--sq-error` | `#30a46c` / `#0090ff` / `#ffb224` / `#d93036` | `#3dd68c` / `#3b9eff` / `#ffc53d` / `#d93036` |
| `--sq-background` / `--sq-surface` / `--sq-surface-variant` / `--sq-surface-raised` | `#f8f9fb` / `#ffffff` / `#f1f2f5` / `#ffffff` | `#0f1013` / `#18191c` / `#222327` / `#1d1e22` |
| `--sq-on-surface` / `--sq-on-surface-variant` / `--sq-muted` | `#1c2024` / `#60646c` / `#80838d` | `#edeef0` / `#b0b4ba` / `#7d828a` |
| `--sq-border` / `--sq-border-strong` / `--sq-overlay` | `#e3e4e9` / `#cdced6` / `#0b0d12` | `#2b2d31` / `#3a3d43` / `#000000` |
Source of truth: `defaultThemes` in `packages/core/src/theme.ts` (= preset `iris`). `--sq-on-<semantic>` comes from `onColor()`; primary/secondary/error keep ≥ 4.5:1 (tested).
Alpha/state colors use `color-mix(in srgb, <token> N%, transparent)` — never new hex values.

## Scales (pattern → path `tokens.css`)
| Group | Tokens | Values |
|---|---|---|
| Radius | `--sq-radius-{none,xs,sm,md,lg,xl,2xl,pill}` | 0, 6, 10, 14, 20, 28, 36, 9999px — each × `--sq-radius-scale` (default 1, 0 = square) |
| Smoothing | `--sq-smoothing` | 0.6 |
| Spacing | `--sq-space-{0,1,2,3,4,5,6,8,10,12}` | 4px steps |
| Font | `--sq-font` (Geist → Inter → system; Geist must be loaded by the app), `--sq-font-mono`, `--sq-text-{2xs..4xl}` (11–36px), `--sq-weight-{regular,medium,semibold,bold}`, `--sq-leading` 1.5 | |
| Controls | `--sq-control-{xs,sm,md,lg,xl}` | 24, 30, 38, 46, 56px |
| Elevation | `--sq-elevation-{0..4}` (box-shadow) + `--sq-elevation-{0..4}-filter` (drop-shadow for SVG squircles) | always set both |
| Motion | `--sq-ease`, `--sq-ease-spring`, `--sq-duration-{fast,–,slow}` | 120 / 200 / 320ms |
| z-index | `--sq-z-{app-bar,drawer,overlay,tooltip,snackbar}` | 1000 / 1005 / 2000 / 2500 / 3000 |
| States | `--sq-hover-opacity` 8%, `--sq-press-opacity` 14%, `--sq-selected-opacity` 12%, `--sq-disabled-opacity` .45, `--sq-focus-ring` | |
| Breakpoints | sm 600 · md 960 · lg 1280 · xl 1920 | `useDisplay().mobile` = < 960 |

## Squircle surface pattern (mandatory for surfaces)
- Element gets `class="sq-surface"` and sets `--sq-bg`, `--sq-bd`, `--sq-bw`, `--sq-r`, `--sq-shadow`, `--sq-shadow-filter`; include `<SqShape />` as a child (`:watch-key` when radius/size props change; `clip` for scroll containers without shadow).
- Interactive surfaces add `sq-interactive` (state layer via `--sq-state` / `--sq-fg`).
- Dense items (grid cells, list rows, chips in virtual lists) use `.sq-squircle` (radius only, no JS).
- Inner layers that copy the radius (`border-radius: inherit`) must also get `corner-shape: inherit` — add the selector to the list in `packages/ui/src/styles/base.css`, otherwise they clip with a circle and poke past the squircle border.
- SVG mode draws the fill under the content and the stroke above it (`.sq-shape--stroke`), so child backgrounds never hide the border; flat containers with painted children (tables, grids) use `<SqShape clip />`.
- Modes: `config.squircle.mode` = `auto` (native `corner-shape` else SVG) · `native` · `svg` · `css`.

## Theming
Mechanism: `createThemeCss` (`core/src/theme.ts`) → `<style id="sq-theme-vars">` (`ui/src/config.ts` `syncThemeToDocument`) + class `sq-theme--<name>` on `<html>`; local scope `SqThemeProvider` (provides `sq-theme-scope`, inherited by `SqPortal` layers). Switch: `useTheme().name.value = 'dark'` / `toggle()`.
Customization (`ui/src/composables/theme.ts`): `setBrand(hex, { secondary?, accent? })` → `createBrandTheme` (light + dark pair, ≥ 4.5:1 on-color), `applyPreset(name)` (`themePresets`: iris, ocean, forest, sunset, rose, graphite, mint), `setColors({...})`, `setAppearance({ font, fontMono, radiusScale, smoothing })` → `appearanceCss` (font strings sanitized). Same `appearance` key in `createSquirkle({ appearance })` and the Nuxt module options. Docs UI: `apps/docs/src/components/ThemeCustomizer.vue` (persists to `localStorage` `sq-docs-appearance`).

## UI patterns
- Layout: `SqApp` CSS grid areas (`bar` / `start` / `main` / `end` / `footer`); `SqAppBar` sticky; `SqNavigationDrawer` permanent ≥ md, temporary overlay < md, closes on link click.
- Grid: `SqRow` / `SqCol` 12 columns (`cols`, `sm`, `md`, `lg`, `xl`, `offset`).
- Field labels sit above inputs (no floating labels); messages/counter row below.
- A11y: real buttons/inputs, `:focus-visible` ring (`--sq-focus-ring`), ARIA on tabs/menus/dialogs/grid, dialog focus trap + Escape, `prefers-reduced-motion` honored (`base.css`), charts ship legend + sr-only data table.
- Lazy loading: `SqImg` (IntersectionObserver), `SqLazy`, Leaflet dynamic import.

## Icons & assets
- `SqIcon icon=`: built-in names (`packages/ui/src/icons.ts` `builtinIcons`), Iconify `prefix:name`, `$alias` (`createSquirkle({ icons: { aliases } })`, presets `useIconPreset('lucide' | 'mdi')` in `@squirkle-ui/icons`), or raw path data.
- Add a built-in icon: append a 24×24 path to `builtinIcons`. No asset folders in packages.

## Chart palette (validated with the dataviz validator, 2026-10-24)
Light on `#ffffff`: all checks PASS; contrast WARN for series 3/4/5 → charts always show legend + tooltips + sr-only table. Dark on `#161925`: all PASS. Values in `packages/charts/src/styles.css`.

## Hard rules
- Never hardcode color, size, radius, shadow or font values when a token exists.
- No exact token → nearest token + flag the difference in the prompt.
- Reuse/extend an existing component (inventory in `.ai/COMPONENTS.md`) before creating one; new components must be justified in the plan.
- New tokens only when the approved prompt lists them.
