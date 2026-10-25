import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Uses the built packages (`pnpm build` first), resolved through their `exports` like any app.
export default defineConfig({
  plugins: [vue()],
  // Monorepo only: the linked packages and this app must share one Vue copy.
  resolve: { dedupe: ['vue'] },
  // Safety net: src/main.js sets the MapLibre worker URL.
  optimizeDeps: { exclude: ['maplibre-gl'] },
  server: { port: 5185, strictPort: true },
})
