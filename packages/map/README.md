# @squirkle-ui/map

MapLibre vector maps (or Leaflet raster) with squircle markers and clustering for [Squirkle UI](https://www.npmjs.com/package/squirkle-ui). Works with Vue 3 and Vue 2.7.

## Install
```bash
npm i @squirkle-ui/map @squirkle-ui/ui maplibre-gl
pnpm add @squirkle-ui/map @squirkle-ui/ui maplibre-gl
```
Or get every component and add-on with [`squirkle-ui`](https://www.npmjs.com/package/squirkle-ui) and import from `squirkle-ui/map`.

Peer dependencies: `vue`, `@squirkle-ui/ui`, and `maplibre-gl` (vector) or `leaflet` (raster). Set up `@squirkle-ui/ui` first (`app.use(createSquirkle())` and `@squirkle-ui/ui/styles.css`).

## Usage
```ts
import { SqMap } from '@squirkle-ui/map'        // Vue 3
// import { SqMap } from '@squirkle-ui/map/vue2' // Vue 2.7
import '@squirkle-ui/map/styles.css'
```
```vue
<template>
  <SqMap :markers="markers" cluster fit-markers :height="420" />
</template>
<script setup lang="ts">
import { SqMap, type MapMarker } from '@squirkle-ui/map'
const markers: MapMarker[] = [
  { lat: 11.5636, lng: 104.9282, title: 'Phnom Penh', shape: 'pin', icon: 'lucide:coffee' },
]
</script>
```
Key props: `engine` (`vector` default, or `raster`), `mapStyle` (`auto` follows light/dark; presets `positron`, `voyager`, `dark-matter`, `liberty`, `bright`, `openfreemap-dark`, `fiord`; or any style URL), `center`, `zoom`, `markers`, `markerDefaults`, `cluster`, `clusterColor`, `fitMarkers`, `tileUrl`, `height`. Marker shapes: `pin`, `dot`, `squircle`, `avatar`, or a `#marker` slot.

### Map setup
The map needs `maplibre-gl` (vector, default) or `leaflet` (`engine="raster"`). MapLibre loads a worker file that bundlers don't copy on their own; in Vite apps register it once:
```ts
import { setMapWorkerUrl } from '@squirkle-ui/map'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
setMapWorkerUrl(workerUrl)
```
The Nuxt module does this for you.

## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
