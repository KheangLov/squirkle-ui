import { fileURLToPath } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(`../packages/${p}`, import.meta.url))

/** Source aliases so docs, tests and type-check use package sources instead of dist. */
export const aliases = {
  '@squirkle-ui/core': r('core/src/index.ts'),
  '@squirkle-ui/ui/styles.css': r('ui/src/styles/index.css'),
  '@squirkle-ui/ui': r('ui/src/index.ts'),
  '@squirkle-ui/datagrid': r('datagrid/src/index.ts'),
  '@squirkle-ui/swiper': r('swiper/src/index.ts'),
  '@squirkle-ui/calendar': r('calendar/src/index.ts'),
  '@squirkle-ui/map': r('map/src/index.ts'),
  '@squirkle-ui/charts': r('charts/src/index.ts'),
  '@squirkle-ui/icons': r('icons/src/index.ts'),
}
