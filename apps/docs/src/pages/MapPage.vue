<template>
  <div class="doc-page" style="max-width:1200px">
    <h1>Map</h1>
    <p class="lead"><code>@squirkle-ui/map</code> — vector tiles with MapLibre GL (default) or raster tiles with Leaflet, squircle markers, clustering and themed popups. Both engines are optional peer dependencies loaded on demand (SSR-safe).</p>

    <div class="sq-d-flex sq-flex-wrap sq-gap-3 sq-align-center sq-mb-4">
      <SqBtnToggle v-model="engine" mandatory><SqBtn value="vector" variant="text">Vector</SqBtn><SqBtn value="raster" variant="text">Raster</SqBtn></SqBtnToggle>
      <SqSelect v-if="engine === 'vector'" v-model="style" :items="styles" aria-label="Map style" prepend-inner-icon="lucide:layers" density="compact" hide-details style="width:240px" />
      <SqSwitch v-model="cluster" label="Cluster 2,000 points" />
    </div>

    <h2>Clustering</h2>
    <SqMap :engine="engine" :map-style="style" :markers="cluster ? many : []" :marker-defaults="{ shape: 'dot', color: 'secondary' }" cluster :zoom="11" :height="440" @cluster-click="last = `Cluster of ${$event.count}`" />
    <div class="sq-mt-2 sq-text-muted">{{ last }}</div>

    <h2>Custom markers</h2>
    <SqRow>
      <SqCol cols="12" md="8">
        <SqMap :engine="engine" :map-style="style" :markers="places" fit-markers :height="420" @marker-click="last = $event.title">
          <template #popup="{ marker }"><b>{{ marker.title }}</b><br />{{ marker.popup }}</template>
        </SqMap>
      </SqCol>
      <SqCol cols="12" md="4">
        <SqList bordered :items="places.map((p) => ({ title: p.title, subtitle: `shape: ${p.shape}`, prependIcon: p.icon ?? 'place' }))" />
      </SqCol>
    </SqRow>

    <h2>Slot markers</h2>
    <SqMap :engine="engine" :map-style="style" :markers="prices" :zoom="14" :center="[11.565, 104.925]" :height="320">
      <template #marker="{ marker }"><span class="doc-price-pin">${{ marker.price }}</span></template>
    </SqMap>

    <h2>Usage</h2>
    <pre class="doc-code" style="padding:16px;border-radius:16px">&lt;SqMap map-style="auto" :markers="markers" cluster fit-markers /&gt;   &lt;!-- auto = Positron / Dark Matter by theme --&gt;
&lt;SqMap map-style="liberty" /&gt;  &lt;SqMap map-style="https://…/style.json" /&gt;  &lt;SqMap engine="raster" tile-url="…" /&gt;
markers: { lat, lng, title, popup, color, shape: 'pin' | 'dot' | 'squircle' | 'avatar', icon: 'lucide:coffee', image, label, size }</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MapMarker } from '@squirkle-ui/map'

const engine = ref<'vector' | 'raster'>('vector')
const style = ref('auto')
const cluster = ref(true)
const last = ref('Click a marker or cluster')
const styles = [
  { title: 'Auto (follows theme)', value: 'auto' }, { title: 'Positron', value: 'positron' }, { title: 'Voyager', value: 'voyager' },
  { title: 'Dark Matter', value: 'dark-matter' }, { title: 'Liberty (OpenFreeMap)', value: 'liberty' }, { title: 'Bright (OpenFreeMap)', value: 'bright' },
  { title: 'Dark (OpenFreeMap)', value: 'openfreemap-dark' }, { title: 'Fiord (OpenFreeMap)', value: 'fiord' },
]
let seed = 11
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const many: MapMarker[] = Array.from({ length: 2000 }, (_, i) => ({ id: i, lat: 11.56 + (rnd() - 0.5) * 0.25, lng: 104.92 + (rnd() - 0.5) * 0.3, title: `Point ${i + 1}`, popup: 'Clustered marker' }))
const places: MapMarker[] = [
  { id: 1, lat: 11.5636, lng: 104.9312, title: 'Royal Palace', popup: 'Pin with label', shape: 'pin', label: '1', color: 'primary' },
  { id: 2, lat: 11.5577, lng: 104.9271, title: 'National Museum', popup: 'Squircle with icon', shape: 'squircle', icon: 'lucide:landmark', color: 'secondary' },
  { id: 3, lat: 11.5696, lng: 104.9211, title: 'Wat Phnom', popup: 'Avatar marker', shape: 'avatar', image: 'https://i.pravatar.cc/80?img=12', color: 'accent' },
  { id: 4, lat: 11.5449, lng: 104.9212, title: 'Independence Monument', popup: 'Dot marker', shape: 'dot', color: 'success' },
  { id: 5, lat: 11.5502, lng: 104.9349, title: 'Coffee', popup: 'Pin with Iconify icon', shape: 'pin', icon: 'lucide:coffee', color: 'warning', size: 36 },
]
const prices = [
  { id: 'a', lat: 11.566, lng: 104.92, price: 120 },
  { id: 'b', lat: 11.561, lng: 104.928, price: 85 },
  { id: 'c', lat: 11.569, lng: 104.93, price: 240 },
]
</script>

<style>
.doc-price-pin { display: inline-block; padding: 4px 10px; border-radius: 999px; background: var(--sq-surface-raised); color: var(--sq-on-surface); font: 700 12px/1.2 var(--sq-font); box-shadow: 0 2px 8px rgb(0 0 0 / 0.25); border: 1px solid var(--sq-border); }
.doc-price-pin:hover { background: var(--sq-primary); color: var(--sq-on-primary); }
</style>
