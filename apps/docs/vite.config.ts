import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { aliases } from '../../build/aliases'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      ...aliases,
      // Full build: docs examples are template strings compiled at runtime.
      vue: fileURLToPath(new URL('../../node_modules/vue/dist/vue.esm-bundler.js', import.meta.url)),
    },
  },
  // Safety net only: src/main.ts sets the worker URL; without it, pre-bundled MapLibre would lose its default worker path.
  optimizeDeps: { exclude: ['maplibre-gl'] },
  server: { port: 5180, strictPort: true },
})
