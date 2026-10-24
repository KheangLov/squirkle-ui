/** Engine-independent marker clustering (supercluster). Pure functions — unit-tested in test/cluster.test.ts. */
import Supercluster from 'supercluster'

export interface ClusterOptions {
  /** Cluster radius in screen pixels (default 60). */
  radius?: number
  /** Zoom level above which points are never clustered (default 16). */
  maxZoom?: number
  /** Minimum points to form a cluster (default 2). */
  minPoints?: number
}

export type ClusterIndex = Supercluster<{ i: number }>

export type ClusterItem =
  | { kind: 'cluster'; id: number; lat: number; lng: number; count: number }
  | { kind: 'point'; index: number; lat: number; lng: number }

/** West, south, east, north in degrees. */
export type BBox = [number, number, number, number]

/** `tileSize` is the engine's tile size in px (MapLibre 512, Leaflet 256) so `radius` stays in screen pixels. */
export function createClusterIndex(points: { lat: number; lng: number }[], opts: ClusterOptions = {}, tileSize = 512): ClusterIndex {
  const index: ClusterIndex = new Supercluster({ radius: opts.radius ?? 60, maxZoom: opts.maxZoom ?? 16, minPoints: opts.minPoints ?? 2, extent: tileSize })
  index.load(points.map((p, i) => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] }, properties: { i } })))
  return index
}

/** Clusters and single points visible in `bbox` at `zoom`. */
export function clustersFor(index: ClusterIndex, bbox: BBox, zoom: number): ClusterItem[] {
  return index.getClusters(bbox, Math.floor(zoom)).map((f) => {
    const [lng, lat] = f.geometry.coordinates
    const p = f.properties as { cluster?: boolean; cluster_id?: number; point_count?: number; i?: number }
    return p.cluster
      ? { kind: 'cluster' as const, id: p.cluster_id!, lat, lng, count: p.point_count! }
      : { kind: 'point' as const, index: p.i!, lat, lng }
  })
}

/** Zoom level at which a cluster splits apart. */
export const expansionZoom = (index: ClusterIndex, clusterId: number) => index.getClusterExpansionZoom(clusterId)

/** Indices (into the original points array) of every point inside a cluster. */
export const clusterLeaves = (index: ClusterIndex, clusterId: number) =>
  index.getLeaves(clusterId, Infinity).map((f) => (f.properties as { i: number }).i)

/** Grows a bbox by `ratio` on each side so markers just outside the view are ready before they scroll in. */
export function padBBox([w, s, e, n]: BBox, ratio = 0.25): BBox {
  const dx = (e - w) * ratio
  const dy = (n - s) * ratio
  return [Math.max(-180, w - dx), Math.max(-85, s - dy), Math.min(180, e + dx), Math.min(85, n + dy)]
}
