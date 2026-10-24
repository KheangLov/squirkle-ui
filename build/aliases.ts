import { fileURLToPath } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(`../packages/${p}`, import.meta.url))

/** Source aliases so docs, tests and type-check use package sources instead of dist. */
export const aliases = {
  '@squirkle/core': r('core/src/index.ts'),
  '@squirkle/ui/styles.css': r('ui/src/styles/index.css'),
  '@squirkle/ui': r('ui/src/index.ts'),
  '@squirkle/datagrid': r('datagrid/src/index.ts'),
  '@squirkle/swiper': r('swiper/src/index.ts'),
  '@squirkle/calendar': r('calendar/src/index.ts'),
  '@squirkle/map': r('map/src/index.ts'),
  '@squirkle/charts': r('charts/src/index.ts'),
  '@squirkle/icons': r('icons/src/index.ts'),
}
