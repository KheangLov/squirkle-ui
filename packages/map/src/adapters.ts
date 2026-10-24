/**
 * Thin engine adapters so SqMap renders markers, clusters and popups the same way on
 * MapLibre GL (vector tiles) and Leaflet (raster tiles). Engines are imported lazily (browser only).
 */
import type * as ML from 'maplibre-gl'
import type * as Leaflet from 'leaflet'
import type { BBox } from './cluster'

export type LatLng = [number, number]

export interface MarkerHandle {
  remove: () => void
}

export interface MapAdapter {
  readonly engine: 'vector' | 'raster'
  /** The underlying maplibregl.Map or L.Map. */
  readonly native: unknown
  getCenter: () => LatLng
  getZoom: () => number
  getBounds: () => BBox
  setView: (center: LatLng, zoom: number, animate?: boolean) => void
  fitPoints: (points: LatLng[], padding: number, maxZoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  addMarker: (el: HTMLElement, at: LatLng, anchor: 'bottom' | 'center') => MarkerHandle
  openPopup: (at: LatLng, content: HTMLElement, offset: number) => void
  setStyle: (style: string | object) => void
  on: (event: 'moveend' | 'click' | 'error', cb: (payload?: unknown) => void) => void
  destroy: () => void
}

let workerUrl: string | null = null

/**
 * Where MapLibre loads its web worker from. Bundlers don't copy `maplibre-gl-worker.mjs` on their own, so apps pass
 * a bundler-resolved URL, e.g. `import url from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'` (Vite). Applied lazily.
 */
export function setMapWorkerUrl(url: string | null) {
  workerUrl = url
}

/** Keyless vector styles (verified 2026-10-24). */
export const MAP_STYLES: Record<string, string> = {
  positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  'dark-matter': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  bright: 'https://tiles.openfreemap.org/styles/bright',
  'openfreemap-dark': 'https://tiles.openfreemap.org/styles/dark',
  fiord: 'https://tiles.openfreemap.org/styles/fiord',
}

/** `auto` follows the app theme; names map to MAP_STYLES; anything else is passed through (URL or style object). */
export function resolveMapStyle(style: string | object, dark: boolean): string | object {
  if (typeof style !== 'string') return style
  if (style === 'auto') return dark ? MAP_STYLES['dark-matter'] : MAP_STYLES.positron
  return MAP_STYLES[style] ?? style
}

const defaultOf = <T>(mod: unknown): T => ((mod as { default?: T }).default ?? mod) as T

export async function createVectorAdapter(el: HTMLElement, opts: { center: LatLng; zoom: number; style: string | object; scrollZoom: boolean }): Promise<MapAdapter> {
  const [mod] = await Promise.all([import('maplibre-gl'), import('maplibre-gl/dist/maplibre-gl.css')])
  const ml = defaultOf<typeof ML>(mod)
  if (workerUrl) ml.setWorkerUrl(workerUrl)
  const map = new ml.Map({
    container: el,
    style: opts.style as ML.StyleSpecification | string,
    center: [opts.center[1], opts.center[0]],
    zoom: opts.zoom,
    attributionControl: { compact: true },
    scrollZoom: opts.scrollZoom,
    cooperativeGestures: false,
  })
  let popup: ML.Popup | null = null
  return {
    engine: 'vector',
    native: map,
    getCenter: () => { const c = map.getCenter(); return [c.lat, c.lng] },
    getZoom: () => map.getZoom(),
    getBounds: () => { const b = map.getBounds(); return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] },
    setView: (c, z, animate) => (animate ? map.easeTo({ center: [c[1], c[0]], zoom: z, duration: 450 }) : map.jumpTo({ center: [c[1], c[0]], zoom: z })),
    fitPoints: (pts, padding, maxZoom) => {
      if (!pts.length) return
      const b = new ml.LngLatBounds([pts[0][1], pts[0][0]], [pts[0][1], pts[0][0]])
      pts.forEach((p) => b.extend([p[1], p[0]]))
      map.fitBounds(b, { padding, maxZoom, duration: 0 })
    },
    zoomIn: () => map.zoomIn(),
    zoomOut: () => map.zoomOut(),
    addMarker: (element, at, anchor) => {
      const m = new ml.Marker({ element, anchor }).setLngLat([at[1], at[0]]).addTo(map)
      return { remove: () => m.remove() }
    },
    openPopup: (at, content, offset) => {
      popup?.remove()
      popup = new ml.Popup({ offset, closeButton: false, className: 'sq-map__popup', maxWidth: '280px' }).setLngLat([at[1], at[0]]).setDOMContent(content).addTo(map)
    },
    setStyle: (style) => map.setStyle(style as ML.StyleSpecification | string),
    on: (event, cb) => {
      if (event === 'click') map.on('click', (e) => cb({ lat: e.lngLat.lat, lng: e.lngLat.lng }))
      else if (event === 'error') map.on('error', (e) => cb(e.error ?? e))
      else map.on('moveend', () => cb())
    },
    destroy: () => map.remove(),
  }
}

export async function createRasterAdapter(el: HTMLElement, opts: { center: LatLng; zoom: number; tileUrl: string; attribution: string; scrollZoom: boolean }): Promise<MapAdapter> {
  const [mod] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])
  const L = defaultOf<typeof Leaflet>(mod)
  const map = L.map(el, { center: opts.center, zoom: opts.zoom, zoomControl: false, scrollWheelZoom: opts.scrollZoom })
  const tiles = L.tileLayer(opts.tileUrl, { attribution: opts.attribution, maxZoom: 19 }).addTo(map)
  return {
    engine: 'raster',
    native: map,
    getCenter: () => { const c = map.getCenter(); return [c.lat, c.lng] },
    getZoom: () => map.getZoom(),
    getBounds: () => { const b = map.getBounds(); return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] },
    setView: (c, z, animate) => map.setView(c, z, { animate: !!animate }),
    fitPoints: (pts, padding, maxZoom) => pts.length && map.fitBounds(L.latLngBounds(pts), { padding: [padding, padding], maxZoom }),
    zoomIn: () => map.zoomIn(),
    zoomOut: () => map.zoomOut(),
    addMarker: (element, at, anchor) => {
      const wrap = document.createElement('div')
      wrap.className = `sq-map__anchor sq-map__anchor--${anchor}`
      wrap.appendChild(element)
      const m = L.marker(at, { icon: L.divIcon({ html: wrap, className: 'sq-map__marker-wrap', iconSize: [0, 0] }), keyboard: false }).addTo(map)
      return { remove: () => m.remove() }
    },
    openPopup: (at, content, offset) => {
      L.popup({ className: 'sq-map__popup', offset: [0, -offset], closeButton: false }).setLatLng(at).setContent(content).openOn(map)
    },
    setStyle: (style) => typeof style === 'string' && tiles.setUrl(style),
    on: (event, cb) => {
      if (event === 'click') map.on('click', (e: Leaflet.LeafletMouseEvent) => cb({ lat: e.latlng.lat, lng: e.latlng.lng }))
      else if (event === 'error') tiles.on('tileerror', (e) => cb(e))
      else map.on('moveend', () => cb())
    },
    destroy: () => map.remove(),
  }
}
