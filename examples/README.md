# Examples

Live: [https://kheanglov.github.io/squirkle-ui/examples/](https://kheanglov.github.io/squirkle-ui/examples/)

One app per supported framework and version. Every example renders the same page — [`shared/Showcase.vue`](shared/Showcase.vue), copied into each app — with a section per package: ui (forms, date & time field, dialog, timeline), datagrid, charts, swiper, calendar, map, icons and editor.

The examples install the packages with `workspace:*` (`nuxt2`: `link:`, see below) and load their **built** output through each package's `exports` (or the `vue2/` + `styles.css` fallbacks for webpack 4), exactly like an app installed from npm. Build the packages first:

```bash
pnpm build
```

| Example | Stack | Uses | Port | Dev command |
|---|---|---|---|---|
| [`vue3-vite`](vue3-vite/) | Vue 3.5 + Vite 7 | scoped `@squirkle-ui/*` packages | 5185 | `pnpm --filter @squirkle-ui/example-vue3-vite dev` |
| [`vue3-all-in-one`](vue3-all-in-one/) | Vue 3.5 + Vite 7 | only the all-in-one `squirkle-ui` package | 5186 | `pnpm --filter @squirkle-ui/example-vue3-all-in-one dev` |
| [`vue2-vite`](vue2-vite/) | Vue 2.7 + Vite 7 | `@squirkle-ui/*/vue2` builds | 5181 | `pnpm dev:vue2` |
| [`vue2-webpack`](vue2-webpack/) | Vue 2.7 + Vue CLI 5 (webpack 5) | `@squirkle-ui/*/vue2` builds | 5189 | `pnpm --filter @squirkle-ui/example-vue2-webpack dev` |
| [`nuxt4`](nuxt4/) | Nuxt 4.6 | `@squirkle-ui/nuxt` module | 5182 | `pnpm dev:nuxt` |
| [`nuxt3`](nuxt3/) | Nuxt 3.21 | `@squirkle-ui/nuxt` module | 5187 | `pnpm --filter @squirkle-ui/example-nuxt3 dev` |
| [`nuxt2`](nuxt2/) | Nuxt 2.18 (Vue 2.7, webpack 4) | `@squirkle-ui/nuxt/nuxt2` module | 5188 | `pnpm --dir examples/nuxt2 install && pnpm --dir examples/nuxt2 dev` |

Build every example (also fails if a `Showcase.vue` copy drifts from `shared/`):

```bash
pnpm examples:build
```

Build some of them:

```bash
pnpm examples:build nuxt3 vue2-webpack
```

`nuxt2` is **not** part of the pnpm workspace (`'!examples/nuxt2'` in `pnpm-workspace.yaml`): Nuxt 2's own packages (`vue-server-renderer`, …) `require('vue')` without declaring it and would pick up the repo root's Vue 3. It has its own `pnpm-workspace.yaml` and lockfile and links `../../packages/*`; `pnpm examples:build` installs it (`--frozen-lockfile`) before building.

To change the showcase, edit `shared/Showcase.vue` and copy it over the app copies (`src/Showcase.vue`; Nuxt: `components/Showcase.vue`, Nuxt 4: `app/components/Showcase.vue`). Keep it plain JS + Options API so it compiles on Vue 2.7 and Vue 3.
