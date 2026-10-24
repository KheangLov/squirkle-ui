<template>
  <div class="doc-page">
    <template v-if="page === 'installation'">
      <h1>Installation</h1>
      <p class="lead">One package per concern. The core is required; add-ons are optional and tree-shakeable.</p>
      <CodeBlock lang="bash" code="pnpm add @squirkle/ui
# optional add-ons
pnpm add @squirkle/datagrid @squirkle/charts @squirkle/swiper @squirkle/calendar @squirkle/icons
pnpm add @squirkle/map leaflet" />
      <h2>Vue 3</h2>
      <CodeBlock lang="ts" code="import { createApp } from 'vue'
import { createSquirkle } from '@squirkle/ui'
import '@squirkle/ui/styles.css'

createApp(App)
  .use(createSquirkle({ theme: { defaultTheme: 'light' }, squircle: { mode: 'auto', smoothing: 0.6 } }))
  .mount('#app')" />
      <h2>Vue 2.7</h2>
      <CodeBlock lang="ts" code="import Vue from 'vue'
import { createSquirkle } from '@squirkle/ui/vue2'
import '@squirkle/ui/styles.css'

Vue.use(createSquirkle())
new Vue({ render: (h) => h(App) }).$mount('#app')" />
      <h2>Nuxt 3 / Nuxt 4</h2>
      <CodeBlock lang="ts" code="// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@squirkle/nuxt'],
  squirkle: { addons: ['datagrid', 'charts'], theme: { defaultTheme: 'dark' } },
})" />
      <h2>Nuxt 2</h2>
      <CodeBlock lang="js" code="// nuxt.config.js
export default {
  buildModules: [['@squirkle/nuxt/nuxt2', { addons: ['datagrid'] }]],
}" />
      <h2>Tree-shaking</h2>
      <CodeBlock lang="ts" code="app.use(createSquirkle({ components: false }))   // no global registration
import { SqBtn, SqCard } from '@squirkle/ui'          // import what you use" />
    </template>

    <template v-else-if="page === 'theming'">
      <h1>Theming</h1>
      <p class="lead">Themes are CSS custom properties generated from a small color map. Light and dark are built in; add as many as you like.</p>
      <CodeBlock lang="ts" code="createSquirkle({
  theme: {
    defaultTheme: 'ocean',
    themes: { ocean: { dark: false, colors: { primary: '#0bb5c4', secondary: '#5b5bf0', background: '#f3fbfc' } } },
  },
})

const theme = useTheme()   // theme.name.value = 'dark' · theme.toggle()" />
      <h2>Presets &amp; brand colors</h2>
      <p>Pick a preset or any brand color — light and dark variants are generated with contrast checks (light ≥ 3:1 on the surface, dark lightened for dark backgrounds). Try the <b>palette button</b> in the app bar.</p>
      <div class="sq-d-flex sq-flex-wrap sq-gap-2 sq-mb-4">
        <SqBtn v-for="(p, key) in themePresets" :key="key" variant="tonal" size="small" @click="theme.applyPreset(String(key))"><span class="doc-dot" :style="{ background: p.primary }"></span>{{ p.label }}</SqBtn>
      </div>
      <CodeBlock lang="ts" code="import { useTheme, createBrandTheme, presetThemes } from '@squirkle/ui'

const theme = useTheme()
theme.applyPreset('ocean')                       // iris · ocean · forest · sunset · rose · graphite · mint
theme.setBrand('#0bb5c4', { accent: '#ff5c8a' })  // generate light + dark from one color
theme.setColors({ success: '#16a34a' }, 'dark')   // patch single tokens
theme.setAppearance({ font: &quot;'Manrope', sans-serif&quot;, radiusScale: 1.25, smoothing: 0.8 })
theme.reset()

// at install time
createSquirkle({ theme: { themes: createBrandTheme('#0bb5c4') }, appearance: { radiusScale: 0.8 } })" />
      <h2>Appearance</h2>
      <p>Fonts, corner radius and smoothing are CSS variables, so they change live without re-rendering. The default UI font is <b>Geist</b> (load it from Google Fonts or self-host); any font stack works.</p>
      <h2>Live theme colors</h2>
      <div class="doc-grid">
        <SqSheet v-for="c in colors" :key="c" border class="sq-pa-4 sq-d-flex sq-align-center sq-gap-3">
          <SqSheet :color="`var(--sq-${c})`" width="40" height="40" rounded="md" border /><div><b>{{ c }}</b><br /><code>--sq-{{ c }}</code></div>
        </SqSheet>
      </div>
      <h2>Tokens</h2>
      <SqTable density="compact">
        <thead><tr><th>Group</th><th>Pattern</th><th>Example</th></tr></thead>
        <tbody>
          <tr v-for="t in tokens" :key="t[0]"><td>{{ t[0] }}</td><td><code>{{ t[1] }}</code></td><td>{{ t[2] }}</td></tr>
        </tbody>
      </SqTable>
    </template>

    <template v-else-if="page === 'squircle'">
      <h1>Squircle engine</h1>
      <p class="lead">A squircle replaces a circular corner arc with a continuous-curvature curve. Squirkle draws it three ways and picks the best one per browser.</p>
      <SqTable density="compact">
        <thead><tr><th>Mode</th><th>How</th><th>Cost</th></tr></thead>
        <tbody>
          <tr><td><code>native</code></td><td>CSS <code>corner-shape: squircle</code> — borders, shadows and clipping are exact</td><td>zero JS</td></tr>
          <tr><td><code>svg</code></td><td><code>&lt;SqShape&gt;</code> measures the surface and paints a Figma-accurate path (fill, inner stroke, drop-shadow)</td><td>one ResizeObserver per surface</td></tr>
          <tr><td><code>css</code></td><td>plain border-radius — used for dense cells in grids / lists</td><td>zero JS</td></tr>
          <tr><td><code>auto</code> (default)</td><td>native when supported, otherwise svg</td><td>—</td></tr>
        </tbody>
      </SqTable>
      <p>Your browser {{ native ? 'supports' : 'does not support' }} native <code>corner-shape</code>. Switch modes from the app bar to compare.</p>
      <h2>Try it</h2>
      <div class="sq-d-flex sq-gap-6 sq-flex-wrap sq-align-center">
        <div class="sq-surface" :style="{ '--sq-r': r + 'px', '--sq-smoothing': s, '--sq-bg': 'var(--sq-primary)', '--sq-shadow': 'var(--sq-elevation-3)', '--sq-shadow-filter': 'var(--sq-elevation-3-filter)', width: '200px', height: '200px' }"><SqShape :watch-key="`${r}${s}`" /></div>
        <svg width="200" height="200" viewBox="0 0 200 200"><path :d="path" fill="none" stroke="var(--sq-primary)" stroke-width="2" /><rect x="1" y="1" width="198" height="198" :rx="r" fill="none" stroke="var(--sq-muted)" stroke-dasharray="4 4" /></svg>
        <div style="flex:1;min-width:220px"><SqSlider v-model="r" :min="0" :max="100" label="Radius" thumb-label /><SqSlider v-model="s" :min="0" :max="1" :step="0.05" label="Smoothing" thumb-label /></div>
      </div>
      <p class="sq-text-muted">Dashed: circular border-radius. Solid: squircle with the same radius.</p>
      <CodeBlock lang="ts" code="import { getSquirclePath } from '@squirkle/core'
getSquirclePath({ width: 200, height: 120, radius: 32, smoothing: 0.6 })  // → SVG path d" />
    </template>

    <template v-else>
      <h1>Vue 2, Vue 3 &amp; Nuxt</h1>
      <p class="lead">Every SFC is compiled twice — once with the Vue 3 compiler, once with the Vue 2.7 compiler — from the same source.</p>
      <SqTable density="compact">
        <thead><tr><th>Target</th><th>Import</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Vue 3.3+</td><td><code>@squirkle/ui</code></td><td>ESM + CJS</td></tr>
          <tr><td>Vue 2.7</td><td><code>@squirkle/ui/vue2</code></td><td>ES2019 output for webpack 4</td></tr>
          <tr><td>Nuxt 3 / 4</td><td><code>@squirkle/nuxt</code></td><td>auto-imported components, SSR theme CSS</td></tr>
          <tr><td>Nuxt 2.17</td><td><code>@squirkle/nuxt/nuxt2</code></td><td>plugin + transpile config</td></tr>
        </tbody>
      </SqTable>
      <h2>v-model in both versions</h2>
      <CodeBlock lang="vue" code="<!-- Vue 3 -->            <SqTextField v-model=&quot;name&quot; />   <SqDataGrid v-model:selected=&quot;ids&quot; />
<!-- Vue 2.7 -->          <SqTextField v-model=&quot;name&quot; />   <SqDataGrid :selected.sync=&quot;ids&quot; />" />
      <p>Overlays use <code>SqPortal</code> (a Teleport replacement that works in Vue 2), and no component relies on fragments, so behavior is identical.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSquirclePath, supportsNativeSquircle } from '@squirkle/core'
import { themePresets, useTheme } from '@squirkle/ui'
import CodeBlock from '../components/CodeBlock.vue'

const route = useRoute()
const theme = useTheme()
const page = computed(() => String(route.params.page))
const colors = ['primary', 'secondary', 'accent', 'success', 'info', 'warning', 'error', 'background', 'surface', 'surface-variant', 'border', 'muted']
const tokens = [
  ['Radius', '--sq-radius-{xs|sm|md|lg|xl|2xl|pill}', '6 · 10 · 14 · 20 · 28 · 36px × --sq-radius-scale'],
  ['Font', '--sq-font, --sq-font-mono', 'Geist / Geist Mono'],
  ['Smoothing', '--sq-smoothing', '0.6 (iOS-like)'],
  ['Spacing', '--sq-space-{0..12}', '4px scale'],
  ['Type', '--sq-text-{2xs..4xl}, --sq-weight-*', '11 → 36px'],
  ['Elevation', '--sq-elevation-{0..4}[-filter]', 'box-shadow + drop-shadow pairs'],
  ['Motion', '--sq-ease, --sq-ease-spring, --sq-duration-*', '120 / 200 / 320ms'],
  ['Controls', '--sq-control-{xs..xl}', '24 → 56px'],
]
const r = ref(48)
const s = ref(0.6)
const path = computed(() => getSquirclePath({ width: 198, height: 198, radius: r.value, smoothing: s.value, offset: 1 }))
const native = supportsNativeSquircle()
</script>
