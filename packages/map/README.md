# @squirkle/map

Vector (MapLibre) and raster (Leaflet) squircle maps with custom markers and clustering for Squirkle UI.

```bash
npm i @squirkle/map @squirkle/ui maplibre-gl
```
```ts
import { SqMap } from '@squirkle/map'        // Vue 3
// import { SqMap } from '@squirkle/map/vue2' // Vue 2.7
import '@squirkle/map/styles.css'
```
Peer dependencies: `vue`, `@squirkle/ui`, and `maplibre-gl` (vector, default) or `leaflet` (`engine="raster"`).

MapLibre loads a worker file that bundlers don't copy on their own. In Vite apps, register it once:
```ts
import { setMapWorkerUrl } from '@squirkle/map'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
setMapWorkerUrl(workerUrl)
```
The Nuxt module does this automatically.

Part of [Squirkle UI](https://github.com/KheangLov/squirkle-ui) · MIT License
