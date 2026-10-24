// Shared Vite library config: one source tree, compiled once per Vue major.
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import vue3 from '@vitejs/plugin-vue'
import vue2 from '@vitejs/plugin-vue2'

const require = createRequire(import.meta.url)

const EXTERNAL = [/^vue$/, /^@squirkle\//, /^leaflet/, /^maplibre-gl/, /^supercluster/]

/**
 * @param {{ pkgDir: string, vue: 0 | 2 | 3 }} opts  vue: 0 = framework-agnostic package
 */
export function libConfig({ pkgDir, vue }) {
  const outDir = vue === 0 ? 'dist' : `dist/vue${vue}`
  const plugins = vue === 3 ? [vue3()] : vue === 2 ? [vue2({ compiler: require('vue2/compiler-sfc') })] : []
  return {
    configFile: false,
    root: pkgDir,
    logLevel: 'warn',
    plugins,
    build: {
      outDir,
      emptyOutDir: true,
      // Vue 2 consumers (Nuxt 2 / webpack 4) cannot parse ES2020 syntax such as `?.` and `??`.
      target: vue === 2 ? 'es2019' : 'es2020',
      minify: false,
      sourcemap: true,
      cssCodeSplit: false,
      lib: {
        entry: resolve(pkgDir, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
        cssFileName: 'styles',
      },
      rollupOptions: {
        external: (id) => EXTERNAL.some((re) => re.test(id)),
        output: {
          exports: 'named',
          // Vue 2 build of an add-on must import the Vue 2 build of @squirkle/ui.
          paths: vue === 2 ? (id) => (/^@squirkle\/(?!core)[a-z]+$/.test(id) ? `${id}/vue2` : id) : undefined,
        },
      },
    },
  }
}
