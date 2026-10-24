import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { aliases } from './build/aliases'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: aliases },
  test: {
    environment: 'happy-dom',
    include: ['packages/*/test/**/*.test.ts'],
  },
})
