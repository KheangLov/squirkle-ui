// @squirkle-ui/nuxt on Nuxt 3, using the built dist of each package (run `pnpm build` first).
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  modules: ['@squirkle-ui/nuxt'],
  squirkle: {
    addons: ['datagrid', 'charts', 'swiper', 'calendar', 'map', 'icons', 'editor'],
    theme: { defaultTheme: 'light' },
  },
  devtools: { enabled: false },
})
