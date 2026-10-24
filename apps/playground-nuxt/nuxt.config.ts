// Smoke test of @squirkle-ui/nuxt on Nuxt 4 (uses the built dist of each package — run `pnpm build` first).
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  modules: ['@squirkle-ui/nuxt'],
  squirkle: {
    addons: ['datagrid', 'charts', 'swiper', 'calendar', 'map', 'icons'],
    theme: { defaultTheme: 'light' },
    appearance: { radiusScale: 1.1 },
  },
  devtools: { enabled: false },
})
