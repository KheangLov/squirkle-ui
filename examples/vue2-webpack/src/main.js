import Vue from 'vue'
import { createSquirkle } from '@squirkle-ui/ui/vue2'
import '@squirkle-ui/ui/styles.css'
import '@squirkle-ui/datagrid/styles.css'
import '@squirkle-ui/charts/styles.css'
import '@squirkle-ui/swiper/styles.css'
import '@squirkle-ui/calendar/styles.css'
import '@squirkle-ui/map/styles.css'
import '@squirkle-ui/icons/styles.css'
import '@squirkle-ui/editor/styles.css'
import { SqDataGrid } from '@squirkle-ui/datagrid/vue2'
import { SqLineChart, SqBarChart, SqDonutChart, SqSparkline } from '@squirkle-ui/charts/vue2'
import { SqSwiper } from '@squirkle-ui/swiper/vue2'
import { SqCalendar } from '@squirkle-ui/calendar/vue2'
import { SqMap, setMapWorkerUrl } from '@squirkle-ui/map/vue2'
import { SqIconPicker } from '@squirkle-ui/icons/vue2'
import { SqEditor } from '@squirkle-ui/editor/vue2'
// Emitted as a file by the `maplibre-worker` rule in vue.config.js.
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs'
import App from './App.vue'

setMapWorkerUrl(mapWorkerUrl)
Vue.use(createSquirkle())
for (const [name, c] of Object.entries({ SqDataGrid, SqLineChart, SqBarChart, SqDonutChart, SqSparkline, SqSwiper, SqCalendar, SqMap, SqIconPicker, SqEditor })) Vue.component(name, c)
new Vue({ render: (h) => h(App) }).$mount('#app')
