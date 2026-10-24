import { createApp } from 'vue'
import { createSquirkle } from '@squirkle-ui/ui'
import '@squirkle-ui/ui/styles.css'
import { SqDataGrid } from '@squirkle-ui/datagrid'
import { SqSwiper } from '@squirkle-ui/swiper'
import { SqCalendar } from '@squirkle-ui/calendar'
import { SqMap, setMapWorkerUrl } from '@squirkle-ui/map'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { SqLineChart, SqBarChart, SqDonutChart, SqSparkline } from '@squirkle-ui/charts'
import { SqIconPicker, useIconPreset } from '@squirkle-ui/icons'
import App from './App.vue'
import { router } from './router'
import './docs.css'

const app = createApp(App)
app.use(createSquirkle({ theme: { defaultTheme: 'light' } }))
useIconPreset('lucide')
// Bundlers don't copy MapLibre's worker file; `?url` serves it in dev and emits it on build.
setMapWorkerUrl(mapWorkerUrl)
for (const [name, c] of Object.entries({ SqDataGrid, SqSwiper, SqCalendar, SqMap, SqLineChart, SqBarChart, SqDonutChart, SqSparkline, SqIconPicker })) app.component(name, c)
app.use(router)
app.mount('#app')
