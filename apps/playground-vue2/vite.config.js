import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import { fileURLToPath } from 'node:url'

// Smoke test of the built Vue 2 bundles (packages/*/dist/vue2). Run `pnpm build` first.
// `vue` is pinned to this app's Vue 2.7 so library dist files never pick up the workspace's Vue 3.
export default defineConfig({
  plugins: [vue2()],
  resolve: {
    alias: [{ find: /^vue$/, replacement: fileURLToPath(new URL('./node_modules/vue/dist/vue.runtime.esm.js', import.meta.url)) }],
  },
  server: { port: 5181, strictPort: true },
})
