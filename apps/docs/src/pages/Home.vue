<template>
  <div>
    <section class="doc-hero">
      <SqChip color="primary" prepend-icon="lucide:sparkles" class="sq-mb-4">Vue 2.7 · Vue 3 · Nuxt 2 / 3 / 4</SqChip>
      <h1>Every corner, <span>continuously curved.</span></h1>
      <p>Squirkle UI is a squircle-first component library — {{ count }} components, an enterprise data grid, virtual &amp; infinite scrolling for big data, and add-on packages for charts, swiper, calendar, maps and Iconify.</p>
      <div class="sq-d-flex sq-justify-center sq-gap-3 sq-flex-wrap">
        <SqBtn size="large" to="/guide/installation" append-icon="chevronRight">Get started</SqBtn>
        <SqBtn size="large" variant="tonal" to="/components">Browse components</SqBtn>
        <SqBtn size="large" variant="text" to="/playground">Playground</SqBtn>
      </div>
    </section>
    <div class="doc-page" style="padding-top:0">
      <SqRow>
        <SqCol cols="12" md="4"><SqCard title="Squircle engine" prepend-icon="lucide:squircle" text="Native CSS corner-shape where supported, Figma-accurate SVG squircles everywhere else — borders, fills and shadows included." /></SqCol>
        <SqCol cols="12" md="4"><SqCard title="Big data ready" prepend-icon="lucide:zap" text="Shared virtualization engine: 1M-row lists, 100k-option selects, and a grid with row + column virtualization and infinite server-side loading." /></SqCol>
        <SqCol cols="12" md="4"><SqCard title="One source, two Vues" prepend-icon="lucide:layers" text="Every component compiles for Vue 2.7 and Vue 3 from the same SFC. A Nuxt module auto-imports everything for Nuxt 2, 3 and 4." /></SqCol>
      </SqRow>
      <h2>Packages</h2>
      <div class="doc-pkgs">
        <SqCard v-for="p in pkgs" :key="p.name" :title="p.name" :subtitle="p.desc" :to="p.to" variant="outlined" hover />
      </div>
      <h2>A taste</h2>
      <SqRow>
        <SqCol cols="12" md="7">
          <SqLineChart title="Weekly active users" subtitle="Last 12 weeks" area :labels="weeks" :series="[{ name: 'Web', data: web }, { name: 'Mobile', data: mobile }]" />
        </SqCol>
        <SqCol cols="12" md="5">
          <SqCard title="Quick settings" variant="elevated">
            <div class="sq-pa-4 sq-d-flex sq-flex-column sq-gap-3">
              <SqSwitch v-model="notify" label="Push notifications" />
              <SqSlider v-model="volume" label="Volume" thumb-label />
              <SqBtnToggle v-model="plan" mandatory><SqBtn value="free" variant="text">Free</SqBtn><SqBtn value="pro" variant="text">Pro</SqBtn><SqBtn value="team" variant="text">Team</SqBtn></SqBtnToggle>
              <SqSelect v-model="fruit" label="Favourite" :items="['Mango', 'Durian', 'Lychee']" />
            </div>
          </SqCard>
        </SqCol>
      </SqRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { registry } from '../registry'

const count = registry.filter((r) => !r.pkg).length
const pkgs = [
  { name: '@squirkle/ui', desc: `${count} core components`, to: '/components' },
  { name: '@squirkle/datagrid', desc: 'AG Grid-style enterprise grid', to: '/datagrid' },
  { name: '@squirkle/charts', desc: 'Line, bar, donut, sparkline', to: '/charts' },
  { name: '@squirkle/swiper', desc: 'Touch carousel & effects', to: '/swiper' },
  { name: '@squirkle/calendar', desc: 'Month / week / day events', to: '/calendar' },
  { name: '@squirkle/map', desc: 'Leaflet with squircle pins', to: '/map' },
  { name: '@squirkle/icons', desc: 'Iconify picker & presets', to: '/icons' },
  { name: '@squirkle/nuxt', desc: 'Nuxt 2 / 3 / 4 module', to: '/guide/installation' },
]
const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`)
const web = [12, 14, 13, 17, 19, 18, 22, 25, 24, 27, 30, 33].map((v) => v * 1000)
const mobile = [8, 9, 11, 12, 12, 15, 16, 18, 21, 22, 25, 29].map((v) => v * 1000)
const notify = ref(true)
const volume = ref(60)
const plan = ref('pro')
const fruit = ref('Mango')
</script>
