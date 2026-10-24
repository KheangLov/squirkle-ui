# FEATURES
Purpose: per-feature map — location, entry point, state, dependencies, known risks.
Read when: fixing or extending a specific feature.

| FEATURE | LOCATION | ENTRY POINT | STATE | DEPENDENCIES | KNOWN RISKS |
|---|---|---|---|---|---|
| Squircle engine | `packages/core/src/squircle.ts`, `packages/ui/src/components/SqShape.vue`, `packages/ui/src/styles/base.css` | `getSquirclePath`, `<SqShape>` | `config.squircle.mode` | ResizeObserver | SVG mode: content not clipped unless `clip` (which also clips shadows) |
| Theming | `packages/core/src/theme.ts`, `packages/ui/src/config.ts`, `composables/theme.ts` | `createSquirkle({ theme })`, `useTheme()` | `config.theme`, `config.appearance` | — | custom non-`dark` themes get light chart series |
| Icons | `packages/ui/src/icons.ts`, `SqIcon.vue`, `packages/icons/src/` | `<SqIcon icon>`, `addCollection`, `SqIconPicker` | Map store + `iconStoreVersion` ref | Iconify API (network) | offline needs `addCollection` + `icons.api: false` |
| Overlays | `composables/overlay.ts`, `composables/dom.ts`, `SqPortal.vue` | SqMenu, SqTooltip, SqDialog, SqSnackbar, SqSelect | per-component model | — | leave transitions wait on rAF (background tabs) |
| Forms & validation | `composables/validation.ts`, `composables/field.ts`, `SqField.vue`, `SqForm.vue` | `rules` prop, `SqForm @submit` | field registry in SqForm | — | async rules run sequentially |
| Virtual / infinite scroll | `composables/virtual.ts`, `SqVirtualScroll.vue`, `SqInfiniteScroll.vue` | `items`, `@load-more` | typed arrays + version ref | ResizeObserver | dynamic heights re-measure via rAF |
| Select / autocomplete / combobox | `SqSelect.vue` (+ `SqAutocomplete.vue`, `SqCombobox.vue`) | `items`, `searchable`, `combobox`, `infinite` | model + search | SqVirtualScroll | always virtualized list |
| DataGrid | `packages/datagrid/src/` | `<SqDataGrid :rows :columns>` or `:datasource` | sort/filter/quick/groupBy/selected models; internal column state | ui, core | large file; see ARCHITECTURE dangerous areas |
| Charts | `packages/charts/src/` | SqLineChart, SqBarChart, SqDonutChart, SqSparkline | none (props) | ui | one y-axis by design |
| Swiper | `packages/swiper/src/SqSwiper.vue` | `items` + default slot | model index | ui | effects force slidesPerView=1 |
| Calendar | `packages/calendar/src/` | `<SqCalendar :events>`, `@event-change` | date + view models | ui, core | parent applies `event-change` (controlled) |
| Map | `packages/map/src/{SqMap.vue,adapters.ts,markers.ts,cluster.ts}` | `<SqMap :markers cluster>` | engine adapter (`markRaw`) + supercluster index | maplibre-gl / leaflet peers (lazy), supercluster | client-only in Nuxt; apps must call `setMapWorkerUrl(<?url of maplibre-gl-worker.mjs>)` (Nuxt module does it) or the worker 404s/fails; third-party style hosts may rate-limit |
| Nuxt integration | `packages/nuxt/src/` | `modules: ['@squirkle/nuxt']` / `nuxt2` | — | @nuxt/kit | Nuxt 4 dev + prod build verified (`apps/playground-nuxt`, `nuxt-preview` launch entry); Nuxt 2 NOT RUN; map is client-only |
| Docs & playground | `apps/docs/src/` | `registry.ts`, `pages/Playground.vue` | docState | full Vue build (runtime compiler) | examples are template strings; `main.ts` registers the MapLibre worker (`setMapWorkerUrl` + `?url`) |
