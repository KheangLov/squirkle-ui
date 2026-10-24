# ARCHITECTURE
Purpose: package boundaries, dependency direction, build model, data flow and dangerous areas.
Read when: adding a package/component, changing build config, cross-package work. (DATA_FLOW merged here.)

## Dependency direction
```
@squirkle-ui/core  (no Vue: squircle math, theme CSS, dates, utils)
      ↑
@squirkle-ui/ui    (components, plugin, composables, tokens)
      ↑
datagrid · charts · swiper · calendar · map · icons   (import ui + core by package name only)
      ↑
@squirkle-ui/nuxt  (Node-side module; imports ui only for componentNames)
apps/docs, apps/playground-vue2 (consumers)
```
- ui never imports an add-on. Add-ons never import each other.
- Cross-package imports use package names; `build/aliases.ts` maps them to sources for docs/tests/type-check.

## Build model (`build/vite.lib.mjs`, `scripts/build.mjs`)
- Same `src/` compiled twice: `dist/vue3` (`@vitejs/plugin-vue`) and `dist/vue2` (`@vitejs/plugin-vue2` with `vue2/compiler-sfc`, target es2019 for webpack 4).
- `vue`, `@squirkle-ui/*`, `leaflet` are external. In the Vue 2 build `output.paths` rewrites `@squirkle-ui/<addon>` imports of ui to `@squirkle-ui/ui/vue2`.
- CSS: SFC `<style>` + `src/styles/*.css` → `dist/styles.css` (one file per package).
- Types: after the Vite builds, `vue-tsc -p packages/<pkg>/tsconfig.build.json` emits `dist/types` (one set for both `.` and `./vue2`; sibling `@squirkle-ui/*` resolve to their built types, so build order matters). `scripts/build.mjs` then rewrites inferred `../../<pkg>/dist/types/x(.js)` refs to `@squirkle-ui/<pkg>/dist/types/x`, served by each package's `./dist/types/*` export. Vue 2.7 TS users get these Vue 3-based types (NOT verified).

## Runtime model
- `createSquirkle(options)` (`packages/ui/src/plugin.ts`) → `applyOptions` into the module-level `config` (`packages/ui/src/config.ts`) → registers components → writes theme CSS vars into `<style id="sq-theme-vars">` + `sq-theme--<name>` on `<html>` (watched).
- Global config is app-wide static data (theme name, squircle mode, icons, locale) — no per-request data (SSR-safe by design).
- Squircle rendering: CSS `@supports (corner-shape: squircle)` in `styles/base.css`; otherwise `<SqShape>` (`components/SqShape.vue`) paints an SVG path from `getSquirclePath` (`core/src/squircle.ts`).

## SSR (Nuxt)
- `@squirkle-ui/nuxt` registers components with `addComponent` (map: `mode: 'client'`), pushes each package's `styles.css`, and a plugin installs `createSquirkle({ components: false })` + `useHead` theme CSS and `<html class="sq-theme--…">`. With the `map` add-on it also adds a client plugin `setMapWorkerUrl(<maplibre-gl-worker.mjs?url>)` (when `maplibre-gl` resolves) and Vite `optimizeDeps` (exclude `maplibre-gl`, include `@squirkle-ui/map > supercluster`, `leaflet` if installed) — `packages/nuxt/src/module.mjs` `addMapSupport`.
- Client-only components (`mode: 'client'`) render a placeholder during hydration, so template refs can be empty in `onMounted`; `SqMap` waits for its ref before mounting.
- Setup functions must be side-effect free on the server: timers, DOM and fetches start in `onMounted` (calendar clock, icon search, grid datasource) or are `isBrowser`-guarded (dialog focus, snackbar timeout).
- Element ids come from `useUid` (`composables/id.ts`): Vue 3.5 `useId()` (hydration-stable), module counter on Vue 2.

## Data flow
- Two-way state: prop `modelValue` → `useProxiedModel` (`composables/model.ts`, internal ref + `update:*` emit) → template.
- Selection groups: `provideGroup` / `useGroupItem` (`composables/group.ts`) via provide/inject (Tabs, Window, BtnToggle, ChipGroup, ExpansionPanels, List).
- Forms: `provideForm` / `useValidation` (`composables/validation.ts`); fields register with the nearest `SqForm`.
- Overlays: `useActivatorOverlay` (`composables/overlay.ts`) → `SqPortal` moves the layer to `<body>`; `computePosition` flips/shifts; z-index from `nextZIndex`.
- Virtualization: `useVirtual` (`composables/virtual.ts`) — typed arrays for sizes/offsets, `version` ref triggers renders.
- DataGrid: `packages/datagrid/src/engine.ts` pure pipeline (filter → sort → pivot → group/tree → flatten → layout) cached in separate computeds in `SqDataGrid.vue`; server mode replaces it with block loading (`datasource.getRows`).

## Dangerous areas
- `SqPortal` DOM moving (must stay the root's only child; layer removed manually on unmount).
- `SqShape` mutates its parent (`data-sq-shape`, optional `clip-path`) — never touch those from Vue bindings.
- `SqDataGrid.vue` is large (~1000 lines); read ranges. Rows are used via `toRaw`; edits mutate row objects then bump `dataVersion`.
- Vue 2 reactivity: no new keys on reactive objects, no Set/Map mutation — replace values (`colWidth.value = {...}`, `new Set(...)`).
