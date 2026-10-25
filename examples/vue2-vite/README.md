# Example: Vue 2.7 + Vite 7

Squirkle UI on Vue 2.7 + Vite 7, using `@squirkle-ui/*/vue2` builds. Renders the shared showcase ([`../shared/Showcase.vue`](../shared/Showcase.vue)).

```bash
pnpm build            # from the repo root: build the packages first
```

```bash
pnpm dev:vue2   # http://localhost:5181
```

`src/main.js` uses the `/vue2` entry of each package. `vite.config.js` pins `vue` to this app's Vue 2.7 (needed only inside this monorepo, where the repo root has Vue 3).
