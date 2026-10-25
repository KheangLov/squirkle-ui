import { createApp } from 'vue'
import { createSquirkle } from 'squirkle-ui'
import 'squirkle-ui/styles.css'
import 'squirkle-ui/datagrid/styles.css'
import 'squirkle-ui/charts/styles.css'
import 'squirkle-ui/swiper/styles.css'
import 'squirkle-ui/calendar/styles.css'
import 'squirkle-ui/map/styles.css'
import 'squirkle-ui/icons/styles.css'
import 'squirkle-ui/editor/styles.css'
import { SqDataGrid } from 'squirkle-ui/datagrid'
import { SqLineChart, SqBarChart, SqDonutChart, SqSparkline } from 'squirkle-ui/charts'
import { SqSwiper } from 'squirkle-ui/swiper'
import { SqCalendar } from 'squirkle-ui/calendar'
import { SqMap, setMapWorkerUrl } from 'squirkle-ui/map'
import { SqIconPicker } from 'squirkle-ui/icons'
import { SqEditor } from 'squirkle-ui/editor'
// Bundlers don't copy MapLibre's worker file; `?url` serves it in dev and emits it on build.
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import App from './App.vue'

setMapWorkerUrl(mapWorkerUrl)
const app = createApp(App).use(createSquirkle())
for (const [name, c] of Object.entries({ SqDataGrid, SqLineChart, SqBarChart, SqDonutChart, SqSparkline, SqSwiper, SqCalendar, SqMap, SqIconPicker, SqEditor })) app.component(name, c)
app.mount('#app')
