import Vue from 'vue'
import { createSquirkle } from '@squirkle-ui/ui/vue2'
import '@squirkle-ui/ui/styles.css'
import '@squirkle-ui/charts/styles.css'
import '@squirkle-ui/datagrid/styles.css'
import '@squirkle-ui/swiper/styles.css'
import '@squirkle-ui/calendar/styles.css'
import App from './App.vue'

Vue.use(createSquirkle())
new Vue({ render: (h) => h(App) }).$mount('#app')
