<template>
  <SqContainer>
    <div id="ssr-buttons" class="sq-d-flex sq-gap-2 sq-flex-wrap sq-mb-4">
      <SqBtn>Flat</SqBtn><SqBtn variant="tonal">Tonal</SqBtn><SqBtn variant="outlined" color="success">Outlined</SqBtn>
      <SqChip color="primary">Chip</SqChip><SqBadge content="3"><SqAvatar name="Nuxt User" /></SqBadge>
    </div>
    <SqRow>
      <SqCol cols="12" md="6">
        <SqCard title="Form">
          <div class="sq-pa-4 sq-d-flex sq-flex-column sq-gap-3">
            <SqTextField id="name" v-model="name" label="Name" clearable />
            <SqSelect v-model="fruit" label="Fruit" :items="['Apple', 'Mango', 'Durian']" />
            <SqSwitch v-model="on" label="Switch" />
            <div id="state">{{ name }} | {{ fruit }} | {{ on }}</div>
            <SqDialog v-model="dialog" title="Nuxt dialog" closable>
              <template #activator><SqBtn id="open-dialog">Open dialog</SqBtn></template>
              Rendered through SqPortal after hydration.
            </SqDialog>
          </div>
        </SqCard>
      </SqCol>
      <SqCol cols="12" md="6">
        <SqLineChart id="chart" title="Line chart" area :labels="['A', 'B', 'C', 'D']" :series="[{ name: 'X', data: [3, 5, 4, 7] }, { name: 'Y', data: [2, 3, 6, 5] }]" />
      </SqCol>
    </SqRow>
    <SqSwiper class="sq-mt-4" :items="[1, 2, 3]" loop :height="140">
      <template #default="{ item }"><div class="slide">Slide {{ item }}</div></template>
    </SqSwiper>
    <SqCalendar class="sq-mt-4" view="month" :events="events" />
    <SqMap id="map" class="sq-mt-4" :markers="[{ lat: 11.5636, lng: 104.9312, title: 'Royal Palace' }]" :height="260" />
  </SqContainer>
</template>

<script setup lang="ts">
const name = ref('Nuxt')
const fruit = ref('Mango')
const on = ref(true)
const dialog = ref(false)
const events = [{ id: 1, title: 'Demo', start: new Date(2026, 9, 24, 10), color: 'primary' }]
</script>

<style>
.slide { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 28px; }
</style>
