import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Uses the all-in-one `squirkle-ui` package only (`pnpm build` first).
export default defineConfig({
  base: process.env.BASE_PATH || '/', // sub-path when built for GitHub Pages (scripts/pages.mjs)
  plugins: [vue()],
  // Monorepo only: the linked packages and this app must share one Vue copy.
  resolve: { dedupe: ['vue'] },
  // Safety net: src/main.js sets the MapLibre worker URL.
  optimizeDeps: { exclude: ['maplibre-gl'] },
  server: { port: 5186, strictPort: true },
})
