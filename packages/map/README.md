# @squirkle-ui/map

Vector (MapLibre) and raster (Leaflet) squircle maps with custom markers and clustering for Squirkle UI.

```bash
npm i @squirkle-ui/map @squirkle-ui/ui maplibre-gl
```
```ts
import { SqMap } from '@squirkle-ui/map'        // Vue 3
// import { SqMap } from '@squirkle-ui/map/vue2' // Vue 2.7
import '@squirkle-ui/map/styles.css'
```
Peer dependencies: `vue`, `@squirkle-ui/ui`, and `maplibre-gl` (vector, default) or `leaflet` (`engine="raster"`).

MapLibre loads a worker file that bundlers don't copy on their own. In Vite apps, register it once:
```ts
import { setMapWorkerUrl } from '@squirkle-ui/map'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
setMapWorkerUrl(workerUrl)
```
The Nuxt module does this automatically.

Part of [Squirkle UI](https://github.com/KheangLov/squirkle-ui) · MIT License
