# STRUCTURE
Purpose: important paths only (inventory of components lives in `.ai/DESIGN_SYSTEM.md`).
Read when: locating where something lives or where a new file goes.

| PATH | PURPOSE | IMPORTANT FILES | DEPENDENCIES | RISKS / NOTES |
|---|---|---|---|---|
| `build/` | shared build config | `vite.lib.mjs`, `aliases.ts` | vite, plugin-vue, plugin-vue2, `vue2` alias pkg | changing externals/paths breaks Vue 2 builds |
| `scripts/` | build + codegen | `build.mjs`, `gen-index.mjs` | vite API | `gen-index.mjs` overwrites `components/index.ts` |
| `packages/core/src/` | framework-free helpers | `squircle.ts`, `theme.ts`, `date.ts`, `utils.ts` | none | no Vue imports allowed |
| `packages/ui/src/` | core library | `plugin.ts`, `config.ts`, `icons.ts`, `index.ts` | core, vue | `config` is module-level state |
| `packages/ui/src/components/` | 86 SFCs | `SqShape.vue`, `SqPortal.vue`, `SqSelect.vue`, `SqField.vue` | composables | `index.ts` is generated |
| `packages/ui/src/composables/` | shared logic | `model.ts`, `overlay.ts`, `virtual.ts`, `group.ts`, `validation.ts`, `style.ts`, `dom.ts`, `display.ts`, `field.ts`, `theme.ts` | vue | used by every component |
| `packages/ui/src/styles/` | tokens + base CSS | `tokens.css`, `base.css`, `utilities.css` | — | token source of truth |
| `packages/datagrid/src/` | data grid | `SqDataGrid.vue`, `engine.ts`, `types.ts`, `GridFilter.vue` | ui, core | biggest file in repo |
| `packages/charts/src/` | SVG charts | `utils.ts`, `components/*.vue`, `styles.css` | ui | series palette validated (see DESIGN_SYSTEM) |
| `packages/swiper/src/` | carousel | `SqSwiper.vue` | ui | loop = wrapped offsets, no clones |
| `packages/calendar/src/` | event calendar | `SqCalendar.vue`, `layout.ts` | ui, core | — |
| `packages/map/src/` | Leaflet map | `SqMap.vue` | ui, leaflet (peer, lazy import) | needs network tiles |
| `packages/icons/src/` | Iconify picker/presets | `SqIconPicker.vue`, `index.ts` | ui | uses Iconify API |
| `packages/nuxt/src/` | Nuxt modules | `module.mjs`, `nuxt2.cjs`, `runtime/nuxt2-plugin.js` | @nuxt/kit | add-on names listed statically in `module.mjs` — update when an add-on gains a component |
| `packages/*/test/` | Vitest specs | `core.test.ts`, `engine.test.ts`, `layout.test.ts` | vitest | — |
| `apps/docs/src/` | docs + playground | `registry.ts`, `App.vue`, `pages/*.vue`, `components/DocExample.vue` | all packages, vue-router | examples are runtime-compiled templates |
| `apps/playground-vue2/` | Vue 2.7 smoke test | `src/App.vue`, `vite.config.js` | built dist | pins `vue` to Vue 2 runtime |
| `apps/playground-nuxt/` | Nuxt 4 SSR test of `@squirkle/nuxt` | `nuxt.config.ts`, `app/app.vue`, `app/pages/{index,grid}.vue` | nuxt 4.6.2, built dist | `.nuxt`/`.output` gitignored |
| `.claude/` | agent config | `settings.json`, `skills/`, `agents/`, `launch.json` | — | settings edits need confirmation (G4) |
