<template>
  <div class="doc-page" style="max-width:1200px">
    <h1>Charts</h1>
    <p class="lead"><code>@squirkle-ui/charts</code> — dependency-free SVG charts with squircle bar ends, a validated colorblind-safe palette (light &amp; dark), hover tooltips, legends and an accessible data table in every chart.</p>
    <SqRow>
      <SqCol cols="12" md="8"><SqLineChart title="Revenue" subtitle="Monthly, USD" area :labels="months" :series="[{ name: 'Subscriptions', data: subs }, { name: 'Services', data: services }]" :format="usd" /></SqCol>
      <SqCol cols="12" md="4"><SqDonutChart title="Traffic sources" :data="sources" total-label="Visits" /></SqCol>
      <SqCol cols="12" md="6"><SqBarChart title="Signups by region" :labels="['APAC','EMEA','NA','LATAM']" :series="[{ name: '2025', data: [420, 380, 510, 160] }, { name: '2026', data: [560, 410, 590, 240] }]" /></SqCol>
      <SqCol cols="12" md="6"><SqBarChart title="Tickets by channel" stacked :labels="['Mon','Tue','Wed','Thu','Fri']" :series="[{ name: 'Email', data: [40, 52, 38, 61, 48] }, { name: 'Chat', data: [22, 30, 41, 35, 28] }, { name: 'Phone', data: [12, 9, 14, 11, 8] }]" /></SqCol>
      <SqCol cols="12" md="6"><SqBarChart title="Profit by product" horizontal :labels="['Lamp','Chair','Desk','Monitor','Mug']" :series="[{ name: 'Profit', data: [32, -8, 24, 41, 12] }]" :height="240" /></SqCol>
      <SqCol cols="12" md="6">
        <SqCard title="Sparklines" variant="outlined">
          <div class="sq-pa-4 sq-d-flex sq-flex-column sq-gap-3">
            <div v-for="k in kpis" :key="k.name" class="sq-d-flex sq-align-center sq-justify-between"><div><div class="sq-text-muted" style="font-size:12px">{{ k.name }}</div><div class="doc-stat">{{ k.value }}</div></div><SqSparkline :data="k.data" :color="k.color" fill :width="140" :height="40" /></div>
          </div>
        </SqCard>
      </SqCol>
    </SqRow>
  </div>
</template>

<script setup lang="ts">
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
const subs = [42, 48, 51, 55, 62, 66, 71, 78, 84, 91].map((v) => v * 1000)
const services = [18, 21, 19, 24, 22, 27, 25, 30, 29, 33].map((v) => v * 1000)
const usd = (v: number) => `$${(v / 1000).toFixed(0)}k`
const sources = [{ label: 'Search', value: 4200 }, { label: 'Direct', value: 2600 }, { label: 'Social', value: 1700 }, { label: 'Referral', value: 900 }]
const kpis = [
  { name: 'MRR', value: '$91.2k', data: subs, color: 'success' },
  { name: 'Churn', value: '2.1%', data: [3.2, 3.0, 2.9, 2.7, 2.8, 2.5, 2.4, 2.3, 2.2, 2.1], color: 'primary' },
  { name: 'Latency p95', value: '182ms', data: [210, 230, 190, 205, 240, 200, 195, 188, 186, 182], color: 'warning' },
]
</script>
