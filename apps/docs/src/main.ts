import { createApp } from 'vue'
import { createSquirkle } from '@squirkle/ui'
import '@squirkle/ui/styles.css'
import { SqDataGrid } from '@squirkle/datagrid'
import { SqSwiper } from '@squirkle/swiper'
import { SqCalendar } from '@squirkle/calendar'
import { SqMap, setMapWorkerUrl } from '@squirkle/map'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { SqLineChart, SqBarChart, SqDonutChart, SqSparkline } from '@squirkle/charts'
import { SqIconPicker, useIconPreset } from '@squirkle/icons'
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
