# Example: Nuxt 4.6

Squirkle UI on Nuxt 4.6, using `@squirkle-ui/nuxt` module. Renders the shared showcase ([`../shared/Showcase.vue`](../shared/Showcase.vue)).

```bash
pnpm build            # from the repo root: build the packages first
```

```bash
pnpm dev:nuxt   # http://localhost:5182
```

`nuxt.config.ts` enables the module with every add-on; components are auto-imported, the MapLibre worker is wired by the module.
