# Decision
`@squirkle-ui/map` renders vector tiles with MapLibre GL by default and keeps Leaflet as `engine="raster"`; clustering uses supercluster for both engines.

## Context
The map needed modern vector basemaps that follow light/dark, custom markers and clustering of thousands of points, without dropping Leaflet users or adding API-key providers.

## Decision
- `packages/map/src/adapters.ts`: one `MapAdapter` interface with `createVectorAdapter` (MapLibre) and `createRasterAdapter` (Leaflet); both engines are optional peers loaded by dynamic import.
- `mapStyle="auto"` resolves to Positron / Dark Matter by theme; `MAP_STYLES` lists keyless CARTO and OpenFreeMap styles; any style URL/object is accepted.
- `packages/map/src/cluster.ts`: pure supercluster wrapper; index `extent` = engine tile size (512 vector, 256 raster) so `radius` is in screen pixels on both engines.
- `packages/map/src/markers.ts`: DOM marker/cluster builders shared by both engines (shapes pin, dot, squircle, avatar; `#marker` slot).

## Alternatives
Leaflet + vector-tile plugin (weaker rendering); Mapbox GL (API key, licence); per-engine clustering plugins (two behaviours).

## Consequences
MapLibre adds a lazy ~800 kB chunk. MapLibre's worker file is not emitted by bundlers: apps pass its URL via `setMapWorkerUrl` (Vite `?url`; the Nuxt module adds this plugin), otherwise the worker fails in dev when MapLibre is pre-bundled and 404s in production builds. Style hosts are third parties and may rate-limit.

## Affected Areas
`packages/map`, `apps/docs` (Map page, vite config), `packages/nuxt` (client-only map).
