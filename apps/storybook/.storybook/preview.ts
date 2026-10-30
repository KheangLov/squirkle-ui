import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { config, createSquirkle } from '@squirkle-ui/ui'
import '@squirkle-ui/ui/styles.css'
import { setMapWorkerUrl } from '@squirkle-ui/map'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'

// Bundlers don't copy MapLibre's worker file; `?url` serves it in dev and emits it on build.
setMapWorkerUrl(mapWorkerUrl)

setup((app) => {
  app.use(createSquirkle({ theme: { defaultTheme: 'light' } }))
})

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Squirkle theme',
      toolbar: { title: 'Theme', icon: 'mirror', items: [{ value: 'light', title: 'Light' }, { value: 'dark', title: 'Dark' }], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (story, context) => {
      config.theme.name = context.globals.theme ?? 'light'
      return {
        components: { story },
        // `sq-root` + theme class give the story the theme variables without SqApp's app-shell grid.
        template: '<div :class="[\'sq-root\', \'sq-theme--\' + theme]" style="min-height: 100vh; padding: 24px; box-sizing: border-box; background: var(--sq-background); color: var(--sq-on-background)"><story /></div>',
        setup: () => ({ theme: config.theme.name }),
      }
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  tags: ['autodocs'],
}
export default preview
