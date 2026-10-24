<template>
  <div class="sq-map sq-surface" :style="{ height: toUnit(height), '--sq-r': radiusValue(rounded), '--sq-bg': 'var(--sq-surface-variant)', '--sq-bd': 'var(--sq-border)', '--sq-bw': '1px' }">
    <SqShape clip />
    <div ref="el" class="sq-map__canvas" role="application" :aria-label="label"></div>
    <div v-if="!ready" class="sq-map__loading"><SqProgressCircular indeterminate :size="24" :width="3" /></div>
    <div class="sq-map__controls">
      <SqBtn icon="plus" color="surface" variant="elevated" size="small" aria-label="Zoom in" @click="adapter && adapter.zoomIn()" />
      <SqBtn icon="minus" color="surface" variant="elevated" size="small" aria-label="Zoom out" @click="adapter && adapter.zoomOut()" />
      <SqBtn v-if="markers.length > 1" icon="place" color="surface" variant="elevated" size="small" aria-label="Fit markers" @click="fit" />
    </div>
    <!-- Slot templates: cloned into popups / marker elements by the engine. -->
    <div class="sq-map__templates" aria-hidden="true">
      <div v-for="(m, i) in markers" :key="'p' + keyOf(m, i)" :data-popup="keyOf(m, i)"><slot name="popup" :marker="m"><b v-if="m.title">{{ m.title }}</b><div v-if="m.popup">{{ m.popup }}</div></slot></div>
      <template v-if="has('marker')">
        <div v-for="(m, i) in markers" :key="'m' + keyOf(m, i)" :data-marker="keyOf(m, i)"><slot name="marker" :marker="m" /></div>
      </template>
    </div>
    <slot :map="adapter ? adapter.native : null" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, markRaw, onBeforeUnmount, onMounted, ref, shallowRef, watch, type PropType } from 'vue'
import { toUnit } from '@squirkle/core'
import { SqBtn, SqProgressCircular, SqShape, config, iconStoreVersion, radiusValue } from '@squirkle/ui'
import { createRasterAdapter, createVectorAdapter, resolveMapStyle, type LatLng, type MapAdapter, type MarkerHandle } from './adapters'
import { clusterElement, markerAnchor, markerElement, type MapMarker, type MarkerShape } from './markers'
import { clusterLeaves, clustersFor, createClusterIndex, expansionZoom, padBBox, type ClusterIndex, type ClusterOptions } from './cluster'

/**
 * Squircle map. `engine="vector"` (default) renders vector tiles with MapLibre GL; `engine="raster"` uses Leaflet.
 * Both are optional peer dependencies loaded on mount, so the component is SSR-safe.
 * Markers: shapes pin / dot / squircle / avatar, icons, labels, or a `#marker` slot. `cluster` groups dense markers.
 */
export default defineComponent({
  name: 'SqMap',
  components: { SqBtn, SqProgressCircular, SqShape },
  props: {
    engine: { type: String as PropType<'vector' | 'raster'>, default: 'vector' },
    /** Vector style: `auto` (follows light/dark), a preset name (positron, voyager, dark-matter, liberty, bright, openfreemap-dark, fiord), a style URL or a style object. */
    mapStyle: { type: [String, Object] as PropType<string | object>, default: 'auto' },
    center: { type: Array as unknown as PropType<LatLng>, default: () => [11.5564, 104.9282] },
    zoom: { type: Number, default: 12 },
    markers: { type: Array as PropType<MapMarker[]>, default: () => [] },
    /** Defaults merged into every marker (shape, color, size, icon…). */
    markerDefaults: { type: Object as PropType<Partial<MapMarker>>, default: () => ({}) },
    cluster: { type: [Boolean, Object] as PropType<boolean | ClusterOptions>, default: false },
    clusterColor: { type: String, default: 'primary' },
    /** Raster engine tile template. */
    tileUrl: { type: String, default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    attribution: { type: String, default: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors' },
    height: { type: [Number, String], default: 400 },
    rounded: { type: [String, Number], default: 'xl' },
    fitMarkers: Boolean,
    scrollWheelZoom: { type: Boolean, default: false },
    label: { type: String, default: 'Map' },
  },
  emits: ['update:center', 'update:zoom', 'click', 'marker-click', 'cluster-click', 'ready', 'error'],
  setup(props, { emit, slots }) {
    const el = ref<HTMLElement | null>(null)
    const adapter = shallowRef<MapAdapter | null>(null)
    const ready = ref(false)
    const inst = getCurrentInstance()
    const handles = new Map<string, MarkerHandle>()
    let index: ClusterIndex | null = null
    let epoch = 0
    const keyOf = (m: MapMarker, i: number) => String(m.id ?? i)
    const isDark = computed(() => !!config.theme.themes[config.theme.name]?.dark)
    const root = () => inst?.proxy?.$el as HTMLElement

    const clearMarkers = () => {
      handles.forEach((h) => h.remove())
      handles.clear()
    }
    const pointElement = (m: MapMarker, i: number) => {
      const tpl = slots.marker ? root().querySelector<HTMLElement>(`[data-marker="${CSS.escape(keyOf(m, i))}"]`)?.firstElementChild : null
      const node = tpl ? (tpl.cloneNode(true) as HTMLElement) : markerElement(m, props.markerDefaults)
      if (tpl) node.classList.add('sq-map-marker', 'sq-map-marker--custom')
      const open = (e: Event) => {
        e.stopPropagation()
        emit('marker-click', m)
        const popup = root().querySelector<HTMLElement>(`[data-popup="${CSS.escape(keyOf(m, i))}"]`)
        if (popup && popup.textContent?.trim()) adapter.value?.openPopup([m.lat, m.lng], popup.cloneNode(true) as HTMLElement, (m.size ?? props.markerDefaults.size ?? 30) + 4)
      }
      node.addEventListener('click', open)
      node.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && open(e))
      return node
    }
    const shapeOf = (m: MapMarker) => (slots.marker ? 'center' : markerAnchor((m.shape ?? props.markerDefaults.shape ?? 'pin') as MarkerShape))

    /** Adds/removes DOM markers so only visible points and clusters exist. */
    const render = () => {
      const a = adapter.value
      if (!a) return
      const want = new Map<string, () => MarkerHandle>()
      if (index) {
        for (const item of clustersFor(index, padBBox(a.getBounds()), a.getZoom())) {
          if (item.kind === 'cluster') {
            const key = `c${item.id}`
            want.set(key, () => {
              const node = clusterElement(item.count, props.clusterColor)
              const zoomIn = (e: Event) => {
                e.stopPropagation()
                const idx = index!
                emit('cluster-click', { count: item.count, markers: clusterLeaves(idx, item.id).map((i) => props.markers[i]) })
                a.setView([item.lat, item.lng], Math.min(expansionZoom(idx, item.id), 20), true)
              }
              node.addEventListener('click', zoomIn)
              node.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && zoomIn(e))
              return a.addMarker(node, [item.lat, item.lng], 'center')
            })
          } else {
            const m = props.markers[item.index]
            want.set(`p${item.index}`, () => a.addMarker(pointElement(m, item.index), [m.lat, m.lng], shapeOf(m)))
          }
        }
      } else {
        props.markers.forEach((m, i) => want.set(`p${i}`, () => a.addMarker(pointElement(m, i), [m.lat, m.lng], shapeOf(m))))
      }
      for (const [k, h] of handles) if (!want.has(k)) { h.remove(); handles.delete(k) }
      for (const [k, make] of want) if (!handles.has(k)) handles.set(k, make())
    }
    const rebuild = () => {
      clearMarkers()
      index = props.cluster ? createClusterIndex(props.markers, typeof props.cluster === 'object' ? props.cluster : {}, props.engine === 'raster' ? 256 : 512) : null
      render()
    }
    const fit = () => adapter.value?.fitPoints(props.markers.map((m) => [m.lat, m.lng]), 48, 15)

    const mount = async () => {
      const my = ++epoch
      if (!el.value) return
      ready.value = false
      const a = props.engine === 'raster'
        ? await createRasterAdapter(el.value, { center: props.center, zoom: props.zoom, tileUrl: props.tileUrl, attribution: props.attribution, scrollZoom: props.scrollWheelZoom })
        : await createVectorAdapter(el.value, { center: props.center, zoom: props.zoom, style: resolveMapStyle(props.mapStyle, isDark.value), scrollZoom: props.scrollWheelZoom })
      if (my !== epoch) return a.destroy()
      adapter.value = markRaw(a)
      a.on('moveend', () => {
        const c = a.getCenter()
        emit('update:center', c)
        emit('update:zoom', Math.round(a.getZoom() * 100) / 100)
        if (index) render()
      })
      a.on('click', (p) => emit('click', p))
      a.on('error', (e) => emit('error', e))
      if (props.fitMarkers) fit()
      rebuild()
      ready.value = true
      emit('ready', a.native)
    }
    const unmountMap = () => {
      clearMarkers()
      adapter.value?.destroy()
      adapter.value = null
    }

    // Nuxt client-only components render a placeholder while hydrating, so the canvas ref can still be empty here.
    onMounted(() => {
      if (el.value) return mount()
      const stop = watch(el, (node) => { if (node) { stop(); return mount() } })
    })
    onBeforeUnmount(() => { epoch++; unmountMap() })
    watch(() => props.engine, () => { unmountMap(); mount() })
    watch(() => props.markers, () => { if (!adapter.value) return; if (props.fitMarkers) fit(); requestAnimationFrame(rebuild) }, { deep: true, flush: 'post' })
    watch(() => [props.cluster, props.markerDefaults, props.clusterColor], () => adapter.value && rebuild(), { deep: true })
    // Iconify icons arrive asynchronously; rebuild markers that use them.
    watch(iconStoreVersion, () => adapter.value && props.markers.some((m) => m.icon || props.markerDefaults.icon) && rebuild())
    watch([() => props.mapStyle, isDark], () => {
      const a = adapter.value
      if (a && a.engine === 'vector') a.setStyle(resolveMapStyle(props.mapStyle, isDark.value))
    })
    watch(() => props.tileUrl, (url) => adapter.value?.engine === 'raster' && adapter.value.setStyle(url))
    watch(() => [props.center[0], props.center[1], props.zoom], () => {
      const a = adapter.value
      if (!a) return
      const c = a.getCenter()
      if (Math.abs(c[0] - props.center[0]) > 1e-6 || Math.abs(c[1] - props.center[1]) > 1e-6 || Math.abs(a.getZoom() - props.zoom) > 0.01) a.setView(props.center, props.zoom)
    })
    return { el, adapter, ready, keyOf, fit, toUnit, radiusValue, has: (n: string) => !!slots[n] }
  },
})
</script>

<style>
.sq-map { position: relative; overflow: hidden; isolation: isolate; }
/* Two classes: MapLibre's lazily loaded CSS sets `.maplibregl-map { position: relative }` and would collapse the canvas to 0 px. */
.sq-map .sq-map__canvas { position: absolute; inset: 0; z-index: 0; border-radius: inherit; background: var(--sq-surface-variant); font: inherit; }
.sq-map__loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 1; }
.sq-map__controls { position: absolute; top: var(--sq-space-3); right: var(--sq-space-3); z-index: 500; display: flex; flex-direction: column; gap: 6px; }
.sq-map__templates { display: none; }

/* markers */
.sq-map-marker { --sq-pin: var(--sq-primary); --sq-pin-size: 30px; position: relative; cursor: pointer; outline: none; transition: transform var(--sq-duration-fast) var(--sq-ease-spring); }
.sq-map-marker:hover, .sq-map-marker:focus-visible { transform: scale(1.12); z-index: 2; }
.sq-map-marker__body { display: flex; align-items: center; justify-content: center; width: var(--sq-pin-size); height: var(--sq-pin-size); background: var(--sq-pin); color: #fff; box-shadow: 0 3px 10px rgb(0 0 0 / 0.28), inset 0 0 0 2px rgb(255 255 255 / 0.92); }
.sq-map-marker__content { display: flex; align-items: center; justify-content: center; font: 700 calc(var(--sq-pin-size) * 0.38) / 1 var(--sq-font); }
.sq-map-marker__content svg { width: calc(var(--sq-pin-size) * 0.52); height: calc(var(--sq-pin-size) * 0.52); fill: currentColor; }
.sq-map-marker__content--empty::after { content: ''; display: block; width: 30%; height: 30%; min-width: 8px; min-height: 8px; border-radius: 30%; background: #fff; }
.sq-map-marker--pin .sq-map-marker__body { border-radius: 38% 38% 38% 10%; transform: rotate(-45deg); margin-bottom: calc(var(--sq-pin-size) * 0.2); }
.sq-map-marker--pin .sq-map-marker__content { transform: rotate(45deg); }
.sq-map-marker--squircle .sq-map-marker__body { border-radius: 32%; }
.sq-map-marker--avatar .sq-map-marker__body { border-radius: 34%; overflow: hidden; padding: 2px; background: #fff; box-shadow: 0 3px 10px rgb(0 0 0 / 0.28), 0 0 0 2px var(--sq-pin); }
.sq-map-marker--avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 30%; }
.sq-map-marker--dot .sq-map-marker__body { width: calc(var(--sq-pin-size) * 0.5); height: calc(var(--sq-pin-size) * 0.5); border-radius: 50%; box-shadow: 0 0 0 3px #fff, 0 0 0 7px color-mix(in srgb, var(--sq-pin) 28%, transparent), 0 2px 6px rgb(0 0 0 / 0.3); }
@supports (corner-shape: squircle) {
  .sq-map-marker--pin .sq-map-marker__body { border-radius: 58% 58% 58% 14%; corner-shape: squircle; }
  .sq-map-marker--squircle .sq-map-marker__body, .sq-map-marker--avatar .sq-map-marker__body, .sq-map-marker--avatar img, .sq-map-cluster { corner-shape: squircle; }
  .sq-map-marker--squircle .sq-map-marker__body, .sq-map-marker--avatar .sq-map-marker__body { border-radius: 50%; }
  .sq-map-marker--avatar img { border-radius: 46%; }
  .sq-map-cluster { border-radius: 50%; }
  .sq-map__canvas { corner-shape: inherit; }
}
.sq-map-cluster { --sq-cluster-size: 40px; display: flex; align-items: center; justify-content: center; width: var(--sq-cluster-size); height: var(--sq-cluster-size); border-radius: 34%; background: var(--sq-pin); color: #fff; font: 700 13px/1 var(--sq-font); cursor: pointer; outline: none; box-shadow: 0 0 0 5px color-mix(in srgb, var(--sq-pin) 26%, transparent), 0 4px 12px rgb(0 0 0 / 0.25); transition: transform var(--sq-duration-fast) var(--sq-ease-spring); }
.sq-map-cluster:hover, .sq-map-cluster:focus-visible { transform: scale(1.1); }

/* Leaflet marker anchoring (MapLibre anchors natively) */
.sq-map__marker-wrap { background: none; border: 0; }
.sq-map__anchor { position: absolute; left: 0; top: 0; }
.sq-map__anchor--center { transform: translate(-50%, -50%); }
.sq-map__anchor--bottom { transform: translate(-50%, -100%); }

/* popups (both engines) */
.sq-map .maplibregl-popup-content, .sq-map .leaflet-popup-content-wrapper { border-radius: var(--sq-radius-lg); background: var(--sq-surface-raised); color: var(--sq-on-surface); box-shadow: var(--sq-elevation-3); padding: 10px 14px; font: var(--sq-text-sm) / 1.5 var(--sq-font); }
.sq-map .leaflet-popup-content { margin: 0; }
.sq-map .maplibregl-popup-tip { border-top-color: var(--sq-surface-raised) !important; border-bottom-color: var(--sq-surface-raised) !important; }
.sq-map .leaflet-popup-tip { background: var(--sq-surface-raised); }
.sq-map .maplibregl-ctrl-attrib, .sq-map .leaflet-control-attribution { border-radius: var(--sq-radius-sm); font-size: 10px; background: color-mix(in srgb, var(--sq-surface) 82%, transparent); color: var(--sq-muted); }
.sq-map .maplibregl-ctrl-attrib a, .sq-map .leaflet-control-attribution a { color: var(--sq-primary); }
</style>
