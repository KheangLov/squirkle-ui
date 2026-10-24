# DESIGN_SYSTEM
Purpose: single source for tokens, theming, the squircle surface pattern, UI patterns and the component inventory. (UI.md merged here.)
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
- `SqIcon icon=`: built-in names (`packages/ui/src/icons.ts` `builtinIcons`), Iconify `prefix:name`, `$alias` (`createSquirkle({ icons: { aliases } })`, presets `useIconPreset('lucide' | 'mdi')` in `@squirkle/icons`), or raw path data.
- Add a built-in icon: append a 24×24 path to `builtinIcons`. No asset folders in packages.

## Chart palette (validated with the dataviz validator, 2026-10-24)
Light on `#ffffff`: all checks PASS; contrast WARN for series 3/4/5 → charts always show legend + tooltips + sr-only table. Dark on `#161925`: all PASS. Values in `packages/charts/src/styles.css`.

## Hard rules
- Never hardcode color, size, radius, shadow or font values when a token exists.
- No exact token → nearest token + flag the difference in the prompt.
- Reuse/extend an existing component (inventory below) before creating one; new components must be justified in the plan.
- New tokens only when the approved prompt lists them.

## Component inventory (generated from source 2026-10-24; Figma column UNKNOWN until mapped)
| Component | Path | Key props / variants | Slots | Figma component |
|---|---|---|---|---|
| SqCalendar | `calendar/…/SqCalendar.vue` | v-model · view, views, events, firstDayOfWeek, editable, snap, hourHeight | — | UNKNOWN |
| SqBarChart | `charts/…/components/SqBarChart.vue` | labels, series, title, subtitle, height, stacked, horizontal | — | UNKNOWN |
| SqDonutChart | `charts/…/components/SqDonutChart.vue` | data, title, subtitle, size, thickness, totalLabel, flat | center | UNKNOWN |
| SqLineChart | `charts/…/components/SqLineChart.vue` | labels, series, title, subtitle, height, area, smooth | — | UNKNOWN |
| SqSparkline | `charts/…/components/SqSparkline.vue` | data, width, height, color, fill, label | — | UNKNOWN |
| SqDataGrid | `datagrid/…/SqDataGrid.vue` | rows, columns, defaultColDef, rowId, height, rowHeight, headerHeight | default, cell, detail, group, loading, no-rows, toolbar (+`cell-<colId>`, `header-<colId>`) | UNKNOWN |
| SqIconPicker | `icons/…/SqIconPicker.vue` | v-model · prefixes, columns, height, limit, placeholder | — | UNKNOWN |
| SqMap | `map/…/SqMap.vue` | engine (vector \| raster), mapStyle, center, zoom, markers, markerDefaults, cluster, clusterColor, fitMarkers, tileUrl, attribution, height, rounded | marker, popup | UNKNOWN |
| SqSwiper | `swiper/…/SqSwiper.vue` | v-model · items, itemKey, slidesPerView, spaceBetween, breakpoints, effect, loop | default | UNKNOWN |
| SqAlert | `ui/…/components/SqAlert.vue` | v-model · type, title, text, color, variant, icon, closable | default, append, title | UNKNOWN |
| SqApp | `ui/…/components/SqApp.vue` | theme, fullHeight | default | UNKNOWN |
| SqAppBar | `ui/…/components/SqAppBar.vue` | title, height, color, flat, floating, blur | default, append, prepend, title | UNKNOWN |
| SqAutocomplete | `ui/…/components/SqAutocomplete.vue` | = SqSelect + | — | UNKNOWN |
| SqAvatar | `ui/…/components/SqAvatar.vue` | image, alt, icon, name, size, color, variant | default | UNKNOWN |
| SqBadge | `ui/…/components/SqBadge.vue` | content, max, color, dot, icon, hidden, inline | default | UNKNOWN |
| SqBanner | `ui/…/components/SqBanner.vue` | text, icon, color, sticky | default, actions | UNKNOWN |
| SqBottomNavigation | `ui/…/components/SqBottomNavigation.vue` | v-model · items, color, floating | — | UNKNOWN |
| SqBottomSheet | `ui/…/components/SqBottomSheet.vue` | = SqDialog + | — | UNKNOWN |
| SqBreadcrumbs | `ui/…/components/SqBreadcrumbs.vue` | items, divider | — | UNKNOWN |
| SqBtn | `ui/…/components/SqBtn.vue` | text, variant, color, size, rounded, icon, prependIcon | default, loader | UNKNOWN |
| SqBtnGroup | `ui/…/components/SqBtnGroup.vue` | rounded, divided, color | default | UNKNOWN |
| SqBtnToggle | `ui/…/components/SqBtnToggle.vue` | v-model · multiple, mandatory, disabled, divided, rounded | default | UNKNOWN |
| SqCard | `ui/…/components/SqCard.vue` | title, subtitle, text, image, prependIcon, variant, color | default, actions, append, prepend, subtitle, title | UNKNOWN |
| SqCardActions | `ui/…/components/SqCardActions.vue` |  | default | UNKNOWN |
| SqCardText | `ui/…/components/SqCardText.vue` |  | default | UNKNOWN |
| SqCardTitle | `ui/…/components/SqCardTitle.vue` |  | default | UNKNOWN |
| SqCheckbox | `ui/…/components/SqCheckbox.vue` | v-model · value, trueValue, falseValue, label, color, indeterminate, disabled, …validation | default | UNKNOWN |
| SqChip | `ui/…/components/SqChip.vue` | text, color, variant, size, rounded, prependIcon, appendIcon | default | UNKNOWN |
| SqChipGroup | `ui/…/components/SqChipGroup.vue` | v-model · multiple, mandatory, max, column, disabled | default | UNKNOWN |
| SqCol | `ui/…/components/SqCol.vue` | cols, sm, md, lg, xl, offset | default | UNKNOWN |
| SqColorPicker | `ui/…/components/SqColorPicker.vue` | v-model · alpha, flat, swatches | — | UNKNOWN |
| SqCombobox | `ui/…/components/SqCombobox.vue` | = SqSelect + | — | UNKNOWN |
| SqContainer | `ui/…/components/SqContainer.vue` |  | default | UNKNOWN |
| SqDateField | `ui/…/components/SqDateField.vue` | v-model · label, placeholder, range, clearable, disabled, min, max | — | UNKNOWN |
| SqDatePicker | `ui/…/components/SqDatePicker.vue` | v-model · range, multiple, min, max, allowedDates, events, firstDayOfWeek | actions | UNKNOWN |
| SqDialog | `ui/…/components/SqDialog.vue` | v-model · title, width, maxWidth, persistent, fullscreen, scrollable, closable | default, actions, activator, title | UNKNOWN |
| SqDivider | `ui/…/components/SqDivider.vue` |  | default | UNKNOWN |
| SqEmptyState | `ui/…/components/SqEmptyState.vue` | icon, title, text, color | default, actions, media | UNKNOWN |
| SqExpandTransition | `ui/…/components/SqExpandTransition.vue` |  | default | UNKNOWN |
| SqExpansionPanel | `ui/…/components/SqExpansionPanel.vue` | title, text, icon, value, disabled | default, title | UNKNOWN |
| SqExpansionPanels | `ui/…/components/SqExpansionPanels.vue` | v-model · multiple, variant, disabled | default | UNKNOWN |
| SqField | `ui/…/components/SqField.vue` | id, label, hint, persistentHint, messages, error, variant | default, append-inner, prepend-inner | UNKNOWN |
| SqFileInput | `ui/…/components/SqFileInput.vue` | v-model · label, hint, accept, multiple, maxSize, disabled, showList | default | UNKNOWN |
| SqFooter | `ui/…/components/SqFooter.vue` |  | default | UNKNOWN |
| SqForm | `ui/…/components/SqForm.vue` |  | default | UNKNOWN |
| SqIcon | `ui/…/components/SqIcon.vue` | icon, size, color, label, clickable | default | UNKNOWN |
| SqImg | `ui/…/components/SqImg.vue` | src, srcset, alt, aspectRatio, width, height, cover | default, error, placeholder | UNKNOWN |
| SqInfiniteScroll | `ui/…/components/SqInfiniteScroll.vue` | loading, hasMore, height, margin, manual | default, end, load-more, loading | UNKNOWN |
| SqKbd | `ui/…/components/SqKbd.vue` |  | default | UNKNOWN |
| SqLazy | `ui/…/components/SqLazy.vue` | minHeight, rootMargin, transition | default | UNKNOWN |
| SqList | `ui/…/components/SqList.vue` | v-model · items, itemTitle, itemValue, selectable, multiple, mandatory, nav | default, item | UNKNOWN |
| SqListGroup | `ui/…/components/SqListGroup.vue` | v-model · title, prependIcon | default | UNKNOWN |
| SqListItem | `ui/…/components/SqListItem.vue` | title, subtitle, prependIcon, prependAvatar, appendIcon, value, active | default, append, prepend, title | UNKNOWN |
| SqListSubheader | `ui/…/components/SqListSubheader.vue` |  | default | UNKNOWN |
| SqMain | `ui/…/components/SqMain.vue` |  | default | UNKNOWN |
| SqMenu | `ui/…/components/SqMenu.vue` | v-model · location, offset, openOnHover, openOnClick, openOnFocus, openDelay, closeDelay | default, activator | UNKNOWN |
| SqNavigationDrawer | `ui/…/components/SqNavigationDrawer.vue` | v-model · location, width, railWidth, rail, temporary, permanent, floating | default, append, prepend | UNKNOWN |
| SqNumberInput | `ui/…/components/SqNumberInput.vue` | v-model · min, max, step, precision, controlVariant, …fieldShell/validation | — | UNKNOWN |
| SqOtpInput | `ui/…/components/SqOtpInput.vue` | v-model · length, type, masked, disabled, error, label | — | UNKNOWN |
| SqOverlay | `ui/…/components/SqOverlay.vue` | v-model · persistent, contained, opacity | default | UNKNOWN |
| SqPagination | `ui/…/components/SqPagination.vue` | v-model · length, totalVisible, color, size, variant, disabled | — | UNKNOWN |
| SqPortal | `ui/…/components/SqPortal.vue` | target, disabled | default | UNKNOWN |
| SqProgressCircular | `ui/…/components/SqProgressCircular.vue` | indeterminate, size, width, color | default | UNKNOWN |
| SqProgressLinear | `ui/…/components/SqProgressLinear.vue` | bufferValue, indeterminate, striped, height, color | default | UNKNOWN |
| SqRadio | `ui/…/components/SqRadio.vue` | v-model · value, label, color, name, disabled | default | UNKNOWN |
| SqRadioGroup | `ui/…/components/SqRadioGroup.vue` | v-model · items, label, inline, color, disabled, …validation | default | UNKNOWN |
| SqRangeSlider | `ui/…/components/SqRangeSlider.vue` | = SqSlider + | — | UNKNOWN |
| SqRating | `ui/…/components/SqRating.vue` | v-model · length, color, fullIcon, emptyIcon, size, readonly, disabled | — | UNKNOWN |
| SqRow | `ui/…/components/SqRow.vue` | dense, noGutters, align, justify | default | UNKNOWN |
| SqSelect | `ui/…/components/SqSelect.vue` | v-model · items, itemTitle, itemValue, itemSubtitle, multiple, chips, closableChips, …fieldShell/validation | item, no-data | UNKNOWN |
| SqShape | `ui/…/components/SqShape.vue` | watchKey, clip | — | UNKNOWN |
| SqSheet | `ui/…/components/SqSheet.vue` | tag, color, border, elevation, rounded, width, height | default | UNKNOWN |
| SqSkeleton | `ui/…/components/SqSkeleton.vue` | type, lines, height | — | UNKNOWN |
| SqSlideGroup | `ui/…/components/SqSlideGroup.vue` |  | default | UNKNOWN |
| SqSlider | `ui/…/components/SqSlider.vue` | v-model · min, max, step, range, label, color, thumbLabel | append, prepend | UNKNOWN |
| SqSnackbar | `ui/…/components/SqSnackbar.vue` | v-model · text, icon, color, timeout, showTimer, location | default, actions | UNKNOWN |
| SqSpacer | `ui/…/components/SqSpacer.vue` |  | — | UNKNOWN |
| SqSpeedDial | `ui/…/components/SqSpeedDial.vue` | v-model · icon, color, actions, direction, openOnHover | — | UNKNOWN |
| SqStepper | `ui/…/components/SqStepper.vue` | v-model · items, vertical, editable, hideActions, finishText | default | UNKNOWN |
| SqSwitch | `ui/…/components/SqSwitch.vue` | v-model · trueValue, falseValue, label, color, inset, loading, disabled | default | UNKNOWN |
| SqTab | `ui/…/components/SqTab.vue` | text, value, prependIcon, disabled | default | UNKNOWN |
| SqTable | `ui/…/components/SqTable.vue` | striped, hover, fixedHeader, height, density | default | UNKNOWN |
| SqTabs | `ui/…/components/SqTabs.vue` | v-model · items, variant, color, grow, vertical | default | UNKNOWN |
| SqTextField | `ui/…/components/SqTextField.vue` | v-model · type, name, autocomplete, inputmode, maxlength, counter, …fieldShell/validation | append-inner, prepend-inner | UNKNOWN |
| SqTextarea | `ui/…/components/SqTextarea.vue` | v-model · rows, autoGrow, noResize, maxlength, counter, …fieldShell/validation | — | UNKNOWN |
| SqThemeProvider | `ui/…/components/SqThemeProvider.vue` | theme, withBackground | default | UNKNOWN |
| SqTimePicker | `ui/…/components/SqTimePicker.vue` | v-model · format, useSeconds, minuteStep, color, flat | — | UNKNOWN |
| SqTimeline | `ui/…/components/SqTimeline.vue` | align, dense | default | UNKNOWN |
| SqTimelineItem | `ui/…/components/SqTimelineItem.vue` | title, time, icon, color, small | default, opposite | UNKNOWN |
| SqToolbar | `ui/…/components/SqToolbar.vue` | title, color, dense, floating | default | UNKNOWN |
| SqTooltip | `ui/…/components/SqTooltip.vue` | v-model · text, location, offset, openDelay, closeDelay, disabled, activator | default, activator, content | UNKNOWN |
| SqTreeview | `ui/…/components/SqTreeview.vue` | v-model · opened, activated, items, itemTitle, itemValue, itemChildren, selectable | append, title | UNKNOWN |
| SqVirtualScroll | `ui/…/components/SqVirtualScroll.vue` | items, itemHeight, estimatedItemHeight, height, overscan, itemKey, infinite | default, empty, end, loading | UNKNOWN |
| SqWindow | `ui/…/components/SqWindow.vue` | v-model · showArrows, continuous | default | UNKNOWN |
| SqWindowItem | `ui/…/components/SqWindowItem.vue` |  | default | UNKNOWN |
