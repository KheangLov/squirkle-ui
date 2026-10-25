// Nuxt 2 (webpack 4) cannot parse MapLibre GL 6, so the `map` add-on aliases `maplibre-gl` here. Use `engine="raster"` (Leaflet).
const unsupported = () => {
  throw new Error('[squirkle] SqMap engine="vector" (MapLibre GL) needs webpack 5 or Vite; on Nuxt 2 use engine="raster" (Leaflet).')
}
export const Map = unsupported
export default { Map: unsupported, setWorkerUrl: unsupported }
