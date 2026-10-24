import Vue from 'vue'
import { createSquirkle } from '@squirkle/ui/vue2'
import '@squirkle/ui/styles.css'
import '@squirkle/charts/styles.css'
import '@squirkle/datagrid/styles.css'
import '@squirkle/swiper/styles.css'
import '@squirkle/calendar/styles.css'
import App from './App.vue'

Vue.use(createSquirkle())
new Vue({ render: (h) => h(App) }).$mount('#app')
