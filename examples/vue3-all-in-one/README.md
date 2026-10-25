# Example: Vue 3.5 + Vite 7

Squirkle UI on Vue 3.5 + Vite 7, using only the all-in-one `squirkle-ui` package. Renders the shared showcase ([`../shared/Showcase.vue`](../shared/Showcase.vue)).

```bash
pnpm build            # from the repo root: build the packages first
```

```bash
pnpm --filter @squirkle-ui/example-vue3-all-in-one dev   # http://localhost:5186
```

Same as `vue3-vite`, but every import comes from `squirkle-ui` and `squirkle-ui/<addon>` (styles: `squirkle-ui/styles.css`, `squirkle-ui/<addon>/styles.css`).
