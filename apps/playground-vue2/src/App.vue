<template>
  <SqApp>
    <SqAppBar title="Squirkle UI · Vue 2.7">
      <template #append><SqBtn :icon="dark ? 'sun' : 'moon'" variant="text" color="surface" @click="toggleTheme" /></template>
    </SqAppBar>
    <SqMain padded>
      <SqContainer>
        <div id="checks" class="sq-d-flex sq-flex-wrap sq-gap-2 sq-mb-4">
          <SqBtn>Flat</SqBtn><SqBtn variant="tonal">Tonal</SqBtn><SqBtn variant="outlined" color="success">Outlined</SqBtn>
          <SqBtn prepend-icon="lucide:heart" color="accent">Iconify</SqBtn>
          <SqBadge content="3"><SqBtn icon="info" variant="tonal" /></SqBadge>
        </div>
        <SqRow>
          <SqCol cols="12" md="6">
            <SqCard title="Form (v-model in Vue 2)">
              <div class="sq-pa-4 sq-d-flex sq-flex-column sq-gap-3">
                <SqTextField id="name" v-model="name" label="Name" clearable />
                <SqSelect v-model="fruits" label="Fruits" :items="['Apple', 'Mango', 'Durian']" multiple chips />
                <SqSwitch v-model="on" label="Switch" />
                <SqSlider v-model="vol" label="Volume" thumb-label />
                <SqCheckbox v-model="agree" label="Agree" />
                <SqDatePicker v-model="date" flat />
                <div id="state">{{ name }} | {{ fruits.join(',') }} | {{ on }} | {{ vol }} | {{ agree }} | {{ date }}</div>
              </div>
            </SqCard>
          </SqCol>
          <SqCol cols="12" md="6">
            <SqTabs v-model="tab" :items="['Overlays', 'Chart']" />
            <div v-if="tab === 'Overlays'" class="sq-d-flex sq-gap-2 sq-mt-4 sq-flex-wrap">
              <SqDialog v-model="dialog" title="Vue 2 dialog" closable>
                <template #activator><SqBtn id="open-dialog">Open dialog</SqBtn></template>
                Portals work without Teleport.
              </SqDialog>
              <SqMenu>
                <template #activator><SqBtn id="open-menu" variant="tonal">Menu</SqBtn></template>
                <SqList nav :items="['One', 'Two']" />
              </SqMenu>
              <SqTooltip text="Tooltip"><SqBtn variant="text">Hover</SqBtn></SqTooltip>
            </div>
            <SqBarChart v-else class="sq-mt-4" title="Bars" :labels="['A', 'B', 'C']" :series="[{ name: 'X', data: [3, 5, 2] }, { name: 'Y', data: [4, 1, 6] }]" />
            <SqSwiper class="sq-mt-4" :items="[1, 2, 3]" loop :height="140">
              <template #default="{ item }"><div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:32px">Slide {{ item }}</div></template>
            </SqSwiper>
          </SqCol>
        </SqRow>
        <h3>DataGrid (10,000 rows, :selected.sync)</h3>
        <SqDataGrid :rows="rows" :columns="cols" row-selection="multiple" :selected.sync="selected" :group-by.sync="groupBy" toolbar group-panel :height="360" />
        <div id="selected">Selected: {{ selected.length }}</div>
        <SqCalendar class="sq-mt-4" view="month" :events="events" />
      </SqContainer>
    </SqMain>
  </SqApp>
</template>

<script>
import { config } from '@squirkle/ui/vue2'
import { SqDataGrid } from '@squirkle/datagrid/vue2'
import { SqBarChart } from '@squirkle/charts/vue2'
import { SqSwiper } from '@squirkle/swiper/vue2'
import { SqCalendar } from '@squirkle/calendar/vue2'

// Freezing the array (not the rows) stops Vue 2 from observing 10k objects while keeping cells editable.
const rows = Object.freeze(Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, name: 'User ' + (i + 1), team: ['Core', 'Web', 'Ops'][i % 3], score: (i * 37) % 100 })))

export default {
  components: { SqDataGrid, SqBarChart, SqSwiper, SqCalendar },
  data: () => ({
    name: 'Dara', fruits: ['Mango'], on: true, vol: 30, agree: false, date: '2026-10-24', tab: 'Overlays', dialog: false, selected: [], groupBy: [],
    rows,
    cols: [{ field: 'id', type: 'number', width: 90 }, { field: 'name', flex: 1, editable: true }, { field: 'team', filter: 'set' }, { field: 'score', type: 'number', aggFunc: 'avg' }],
    events: [{ id: 1, title: 'Demo', start: new Date(), color: 'primary' }],
  }),
  computed: { dark: () => config.theme.name === 'dark' },
  methods: { toggleTheme() { config.theme.name = config.theme.name === 'dark' ? 'light' : 'dark' } },
}
</script>
