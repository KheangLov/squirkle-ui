import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/guide/:page', component: () => import('./pages/Guide.vue') },
    { path: '/components', component: () => import('./pages/ComponentIndex.vue') },
    { path: '/components/:slug', component: () => import('./pages/ComponentPage.vue') },
    { path: '/playground', component: () => import('./pages/Playground.vue') },
    { path: '/datagrid', component: () => import('./pages/DataGridPage.vue') },
    { path: '/charts', component: () => import('./pages/ChartsPage.vue') },
    { path: '/swiper', component: () => import('./pages/SwiperPage.vue') },
    { path: '/calendar', component: () => import('./pages/CalendarPage.vue') },
    { path: '/map', component: () => import('./pages/MapPage.vue') },
    { path: '/icons', component: () => import('./pages/IconsPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
