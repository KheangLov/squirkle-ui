# Task: modern font + theme customization + vector map (approved: `go`, 2026-10-24)
Approved prompt + plan: as shown in chat (Implementation Prompt "Senior Vue 2.7/3 design-system and mapping engineer…", Required Changes 1–12, Plan steps 1–7, confidence 88%).
Dependencies approved: maplibre-gl@^6.15.0 (optional peer/dev), supercluster@^9.1.0 (dependency of @squirkle/map).

## Checks (session 2, 2026-10-24)
- Build (8 packages, Vue 2 + 3) PASS · tests 36/36 PASS · vue-tsc 0 errors.
- Docs browser: Geist on `.sq-app`; setBrand / radius 0 / smoothing / font PASS; customizer survives reload PASS; vector default + auto light/dark + preset switch PASS; raster PASS; cluster click splits (49 → zoom 12) PASS; 4 marker shapes + `#marker` slot PASS.
- Fixed in test phase: map canvas 0 px under MapLibre CSS (specificity); raster cluster radius halved on 256 px tiles (`extent` = tile size, + test); forest/rose dark secondary < 4.5:1 (`ensureReadable`, + test); Font select blank for default (placeholder); docs Vite `optimizeDeps.exclude: ['maplibre-gl']` (session 1).
- Vue 2.7 playground: renders on rebuilt dist; SqMap (vue2 dist) mounts, clusters, full-height canvas PASS; vector tiles FAIL in Vite dev (MapLibre worker under pre-bundling).
- Nuxt 4 dev: SSR theme class + Geist + `appearance.radiusScale` PASS; vector map FAIL (same worker error; first load also stuck on spinner until a client-side remount). Nuxt prod build: NOT RUN.
- Open: worker fix for consumers (proposed: Nuxt module adds the exclude; README note); DataGrid docs `#cell-trend` crashes on totals row (unrelated, not fixed).
