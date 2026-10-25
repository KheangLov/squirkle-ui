# Example: Vue 3.5 + Vite 7

Squirkle UI on Vue 3.5 + Vite 7, using scoped `@squirkle-ui/*` packages. Renders the shared showcase ([`../shared/Showcase.vue`](../shared/Showcase.vue)).

```bash
pnpm build            # from the repo root: build the packages first
```

```bash
pnpm --filter @squirkle-ui/example-vue3-vite dev   # http://localhost:5185
```

`src/main.js` installs `createSquirkle()`, imports each package's `styles.css`, registers the add-on components and sets the MapLibre worker URL with Vite's `?url` import.
