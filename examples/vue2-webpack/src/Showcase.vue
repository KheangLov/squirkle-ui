<!--
  One showcase for every example (Vue 2.7, Vue 3, Nuxt 2/3/4). Each example keeps an identical copy at
  `src/Showcase.vue` (Nuxt: `components/Showcase.vue`); `pnpm examples:build` fails if a copy drifts.
  Plain JS + Options API so the same file compiles everywhere; components are registered globally by each example.
-->
<template>
  <SqContainer class="ex">
    <h1 class="ex__title">Squirkle UI · {{ framework }}</h1>

    <section id="ui">
      <h2>@squirkle-ui/ui</h2>
      <div class="sq-d-flex sq-gap-2 sq-flex-wrap sq-mb-4">
        <SqBtn>Flat</SqBtn>
        <SqBtn variant="tonal">Tonal</SqBtn>
        <SqBtn variant="outlined" color="success">Outlined</SqBtn>
        <SqChip color="accent">Chip</SqChip>
        <SqBadge content="3"><SqAvatar name="Squirkle User" /></SqBadge>
      </div>
      <SqRow>
        <SqCol cols="12" md="6">
          <SqCard title="Form">
            <div class="sq-pa-4 sq-d-flex sq-flex-column sq-gap-3">
              <SqTextField id="ex-name" v-model="name" label="Name" clearable />
              <SqSelect id="ex-fruit" v-model="fruit" :items="fruits" placeholder="Pick a fruit" />
              <SqDateTimeField id="ex-when" v-model="when" label="Meeting" clearable />
              <SqSwitch v-model="on" label="Notifications" />
              <div id="ex-state">{{ name }} | {{ fruit || '—' }} | {{ when }} | {{ on }}</div>
              <SqDialog v-model="dialog" title="Dialog" closable>
                <template #activator><SqBtn id="ex-open-dialog" variant="tonal">Open dialog</SqBtn></template>
                Rendered through SqPortal.
              </SqDialog>
            </div>
          </SqCard>
        </SqCol>
        <SqCol cols="12" md="6">
          <SqTimeline>
            <SqTimelineItem title="Order placed" time="09:12" icon="check" color="success">Payment confirmed</SqTimelineItem>
            <SqTimelineItem title="Shipped" time="13:40" icon="arrowUp">Courier picked up the parcel</SqTimelineItem>
            <SqTimelineItem title="Out for delivery" time="—" small color="warning" />
          </SqTimeline>
        </SqCol>
      </SqRow>
    </section>

    <section id="datagrid">
      <h2>@squirkle-ui/datagrid</h2>
      <SqDataGrid :rows="rows" :columns="columns" row-selection="multiple" :height="300" />
    </section>

    <section id="charts">
      <h2>@squirkle-ui/charts</h2>
      <SqRow>
        <SqCol cols="12" md="8"><SqLineChart title="Visitors" area :labels="weeks" :series="series" :height="220" /></SqCol>
        <SqCol cols="12" md="4"><SqDonutChart title="Devices" :data="devices" :size="180" /></SqCol>
      </SqRow>
    </section>

    <section id="swiper">
      <h2>@squirkle-ui/swiper</h2>
      <SqSwiper v-model="slide" :items="slides" item-key="id" loop :height="160">
        <template #default="{ item }"><div class="ex__slide" :style="{ background: item.color }">{{ item.title }}</div></template>
      </SqSwiper>
    </section>

    <section id="calendar">
      <h2>@squirkle-ui/calendar</h2>
      <SqCalendar view="month" :events="events" />
    </section>

    <section id="map">
      <h2>@squirkle-ui/map</h2>
      <SqMap :engine="mapEngine" :markers="markers" :zoom="12" :height="260" />
    </section>

    <section id="icons">
      <h2>@squirkle-ui/icons</h2>
      <SqIconPicker v-model="icon" :prefixes="['lucide']" :height="200" />
      <p>Picked: <code>{{ icon || '—' }}</code></p>
    </section>

    <section id="editor">
      <h2>@squirkle-ui/editor</h2>
      <SqEditor v-model="html" label="Notes" placeholder="Write something…" :min-height="120" />
      <pre id="ex-html" class="ex__code">{{ html }}</pre>
    </section>
  </SqContainer>
</template>

<script>
const teams = ['Core', 'Web', 'Ops']

export default {
  name: 'Showcase',
  props: {
    framework: { type: String, required: true },
    /** Nuxt 2 (webpack 4) only supports the raster engine. */
    mapEngine: { type: String, default: 'vector' },
  },
  data: () => ({
    name: 'Squirkle',
    fruit: '',
    fruits: ['Apple', 'Mango', 'Durian'],
    when: '2026-10-25T14:30',
    on: true,
    dialog: false,
    // Freezing the array (not the rows) keeps Vue 2 from observing every row.
    rows: Object.freeze(Array.from({ length: 1000 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}`, team: teams[i % 3], score: (i * 37) % 100 }))),
    columns: [{ field: 'id', type: 'number', width: 90 }, { field: 'name', flex: 1, editable: true }, { field: 'team', filter: 'set' }, { field: 'score', type: 'number' }],
    weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    series: [{ name: 'Web', data: [12, 15, 14, 19, 22, 25] }, { name: 'Mobile', data: [8, 9, 12, 13, 16, 18] }],
    devices: [{ label: 'Desktop', value: 58 }, { label: 'Mobile', value: 34 }, { label: 'Tablet', value: 8 }],
    slide: 0,
    slides: [{ id: 1, title: 'One', color: '#5b5bd6' }, { id: 2, title: 'Two', color: '#1f9d63' }, { id: 3, title: 'Three', color: '#e8920c' }],
    events: [{ id: 1, title: 'Release', start: new Date(2026, 9, 24, 10), end: new Date(2026, 9, 24, 11), color: 'primary' }],
    markers: [{ id: 1, lat: 11.5636, lng: 104.9312, title: 'Royal Palace' }],
    icon: '',
    html: '<p>Hello <strong>Squirkle</strong></p>',
  }),
}
</script>

<style>
.ex { padding-block: 24px 64px; }
.ex__title { margin: 0 0 8px; font-size: 28px; letter-spacing: -0.02em; }
.ex section { margin-top: 32px; }
.ex h2 { margin: 0 0 12px; font-size: 16px; font-family: var(--sq-font-mono); color: var(--sq-on-surface-variant); }
.ex__slide { display: flex; align-items: center; justify-content: center; height: 100%; border-radius: inherit; color: #fff; font-size: 28px; font-weight: 700; }
.ex__code { white-space: pre-wrap; font-size: 12px; color: var(--sq-muted); }
</style>
