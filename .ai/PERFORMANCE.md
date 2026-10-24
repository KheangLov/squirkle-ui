# PERFORMANCE
Purpose: evidence-based performance facts and budgets.
Read when: touching virtualization, grid pipeline, large lists, or bundle size.

- **Virtualization** (`packages/ui/src/composables/virtual.ts`): fixed size = O(1) index math; measured sizes in `Float64Array`, prefix sums rebuilt from the first dirty index. Verified: 1,000,000-item SqVirtualScroll and 100,000-option SqAutocomplete in docs render only the visible window.
- **DataGrid**: row + column virtualization (`renderCols` in `SqDataGrid.vue`); measured on 100k rows in the docs page (2026-10-24): sort ≈ 120 ms, quick filter no long task > 50 ms after debouncing + raw-value matching, ~27 DOM rows rendered after a 2,000,000 px scroll. Engine test budget: filter + sort 100k rows < 400 ms (`engine.test.ts`).
- **Server row model**: blocks of `blockSize` (100) cached per epoch; sort/filter purge the cache; stale responses dropped.
- **Hot-loop rule**: never format values per cell in pipelines (quick filter once took ~880 ms with `toLocaleString`).
- **Reactivity**: pass big data non-deeply-reactive — Vue 3 `markRaw`/`shallowRef`, Vue 2 `Object.freeze(array)` (freeze the array only if cells are editable). The grid reads `toRaw(rows)`.
- **Scroll handling**: scroll state updates directly (no rAF throttle) — scroll fires once per frame; rAF stalls in background tabs.
- **Bundle (docs prod build)**: main chunk 500 kB / 166 kB gzip incl. Vue full build + all packages; Leaflet split into its own 150 kB chunk (lazy import in `SqMap`).
- **Squircle cost**: native mode zero JS; SVG mode one ResizeObserver per surface — avoid `SqShape` in per-row markup.
