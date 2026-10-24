import { describe, expect, it } from 'vitest'
import { createClusterIndex, clustersFor, clusterLeaves, expansionZoom, padBBox } from '../src/cluster'
import { resolveMapStyle, MAP_STYLES } from '../src/adapters'

// 2,000 points spread around Phnom Penh (deterministic)
let seed = 3
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const points = Array.from({ length: 2000 }, () => ({ lat: 11.55 + (rnd() - 0.5) * 0.3, lng: 104.92 + (rnd() - 0.5) * 0.3 }))
const world: [number, number, number, number] = [-180, -85, 180, 85]

describe('clustering', () => {
  const index = createClusterIndex(points)
  it('groups points into a few clusters at low zoom', () => {
    const items = clustersFor(index, world, 5)
    expect(items.length).toBeLessThan(5)
    expect(items.every((i) => i.kind === 'cluster')).toBe(true)
    expect(items.reduce((s, i) => s + (i.kind === 'cluster' ? i.count : 1), 0)).toBe(2000)
  })
  it('returns individual points above maxZoom', () => {
    const items = clustersFor(index, world, 17)
    expect(items).toHaveLength(2000)
    expect(items.every((i) => i.kind === 'point')).toBe(true)
  })
  it('expands clusters to a deeper zoom and lists their leaves', () => {
    const [c] = clustersFor(index, world, 6)
    expect(c.kind).toBe('cluster')
    if (c.kind !== 'cluster') return
    expect(expansionZoom(index, c.id)).toBeGreaterThan(6)
    expect(clusterLeaves(index, c.id)).toHaveLength(c.count)
  })
  it('reclusters 2,000 points well under 30 ms', () => {
    const t0 = performance.now()
    for (let z = 8; z <= 15; z++) clustersFor(index, [104.7, 11.4, 105.1, 11.7], z)
    expect((performance.now() - t0) / 8).toBeLessThan(30)
  })
  it('keeps the radius in screen pixels on 256 px raster tiles', () => {
    // Leaflet zoom z shows the world at the same pixel size as MapLibre zoom z - 1.
    const raster = createClusterIndex(points, {}, 256)
    for (let z = 9; z <= 14; z++) expect(clustersFor(raster, world, z).length).toBe(clustersFor(index, world, z - 1).length)
  })
  it('pads and clamps bounding boxes', () => {
    expect(padBBox([0, 0, 10, 10], 0.1)).toEqual([-1, -1, 11, 11])
    expect(padBBox([-179, -84, 179, 84])[0]).toBe(-180)
  })
})

describe('map styles', () => {
  it('follows light/dark for auto and passes custom URLs through', () => {
    expect(resolveMapStyle('auto', false)).toBe(MAP_STYLES.positron)
    expect(resolveMapStyle('auto', true)).toBe(MAP_STYLES['dark-matter'])
    expect(resolveMapStyle('liberty', false)).toBe(MAP_STYLES.liberty)
    expect(resolveMapStyle('https://example.com/style.json', true)).toBe('https://example.com/style.json')
  })
})
