import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { aliases } from '../../build/aliases'

// Stories run on the package sources (Vue 3 build only — Storybook has no Vue 2.7 renderer).
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: { exclude: ['maplibre-gl'] },
  resolve: {
    alias: {
      ...aliases,
      // Full build: stories use template strings compiled at runtime.
      vue: fileURLToPath(new URL('../../node_modules/vue/dist/vue.esm-bundler.js', import.meta.url)),
    },
  },
})
