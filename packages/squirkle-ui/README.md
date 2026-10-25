# squirkle-ui

Squircle-first Vue component library — **one source, built for Vue 2.7 and Vue 3**, with a Nuxt 2 / 3 / 4 module. This package bundles everything: **88 components** plus the data grid, charts, carousel, calendar, map, icon picker and rich-text editor add-ons.

- **Squircles everywhere:** native CSS `corner-shape: squircle` where supported, Figma-accurate SVG squircles elsewhere.
- **Themeable:** light/dark, 7 colour presets, brand colours from one hex value, font and corner controls — all CSS variables.
- **Big data:** virtual lists for 1M rows, 100k-option selects, infinite loading, and an enterprise data grid.
- **TypeScript types** included for every entry.

## Install
```bash
npm i squirkle-ui vue
pnpm add squirkle-ui vue
```
Using the map? Also `npm i maplibre-gl` / `pnpm add maplibre-gl` (or `leaflet` for raster tiles).

## Setup

### Vue 3
```ts
import { createApp } from 'vue'
import { createSquirkle } from 'squirkle-ui'
import 'squirkle-ui/styles.css'
import App from './App.vue'

createApp(App).use(createSquirkle()).mount('#app')
```
`createSquirkle()` registers every component globally. To import them one by one instead, use `createSquirkle({ components: false })` and `import { SqBtn } from 'squirkle-ui'`.

### Vue 2.7
```ts
import Vue from 'vue'
import { createSquirkle } from 'squirkle-ui/vue2'
import 'squirkle-ui/styles.css'

Vue.use(createSquirkle())
```

### Nuxt 3 / 4 and Nuxt 2
Use the module [`@squirkle-ui/nuxt`](https://www.npmjs.com/package/@squirkle-ui/nuxt): it auto-imports components, adds the styles and renders the theme on the server.
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@squirkle-ui/nuxt'],
  squirkle: { addons: ['datagrid', 'map'], theme: { defaultTheme: 'light' } },
})
```

## Options
```ts
createSquirkle({
  theme: {
    defaultTheme: 'light',            // 'light' | 'dark' | any theme you add
    themes: { light: { colors: { primary: '#0bb5c4' } } },
  },
  squircle: { mode: 'auto', smoothing: 0.6 }, // 'auto' | 'native' | 'svg' | 'css'
  appearance: { font: "'Inter', sans-serif", radiusScale: 1, smoothing: 0.6 },
  icons: { aliases: { home: 'mdi:home' }, api: 'https://api.iconify.design' }, // api: false = offline
  locale: { code: 'en', messages: { close: 'Close' } },
})
```
- **Squircle modes:** `auto` uses native CSS `corner-shape: squircle` where the browser supports it and draws SVG squircles elsewhere; `native`, `svg` and `css` (plain border-radius) force one method.
- **Icons:** `<SqIcon icon="mdi:home" />` loads Iconify icons on demand; `<SqIcon icon="$home" />` uses an alias. For offline apps set `icons: { api: false }` and register icons with `addIcons` / `addCollection`.

## Theming
```ts
import { useTheme } from 'squirkle-ui'

const theme = useTheme()
theme.toggle()                    // switch light / dark
theme.applyPreset('ocean')        // iris (default), ocean, forest, sunset, rose, graphite, mint
theme.setBrand('#0bb5c4')         // light + dark palettes from one brand colour
theme.setColors({ primary: '#e11d48' })
theme.setAppearance({ font: "'Manrope', sans-serif", radiusScale: 1.2, smoothing: 0.8 })
theme.reset()
```
- `theme.name` and `theme.isDark` are reactive. Wrap any part of the page in `<SqThemeProvider theme="dark">` to theme it locally.
- Brand themes keep text on `primary`, `secondary` and `accent` at a 4.5:1 contrast ratio or better, in both light and dark.
- Everything is CSS variables (`--sq-primary`, `--sq-radius-md`, `--sq-font`, …), so you can also override them in plain CSS.
- The default font is **Geist** (load it from Google Fonts or self-host); system fonts are the fallback.

## Components
| Group | Components |
|---|---|
| Layout | SqApp, SqAppBar, SqNavigationDrawer, SqMain, SqContainer, SqRow, SqCol, SqToolbar, SqBottomNavigation, SqFooter, SqThemeProvider |
| Buttons | SqBtn, SqBtnGroup, SqBtnToggle, SqSpeedDial |
| Content | SqCard (+ SqCardTitle, SqCardText, SqCardActions), SqSheet, SqAvatar, SqBadge, SqChip, SqChipGroup, SqDivider, SqKbd, SqImg, SqTimeline, SqTimelineItem, SqEmptyState, SqTable, SqIcon |
| Forms | SqForm, SqField, SqTextField, SqTextarea, SqNumberInput, SqOtpInput, SqSelect, SqAutocomplete, SqCombobox, SqCheckbox, SqRadioGroup, SqRadio, SqSwitch, SqSlider, SqRangeSlider, SqFileInput, SqColorPicker, SqDatePicker, SqDateField, SqTimePicker, SqDateTimePicker, SqDateTimeField |
| Navigation | SqTabs, SqTab, SqWindow, SqWindowItem, SqBreadcrumbs, SqPagination, SqStepper, SqList, SqListItem, SqListSubheader, SqListGroup, SqTreeview, SqSlideGroup, SqExpansionPanels, SqExpansionPanel |
| Overlays | SqDialog, SqBottomSheet, SqMenu, SqTooltip, SqOverlay |
| Feedback | SqAlert, SqBanner, SqSnackbar, SqProgressLinear, SqProgressCircular, SqSkeleton, SqRating |
| Data | SqVirtualScroll, SqInfiniteScroll, SqLazy |
| Utilities | SqShape, SqPortal, SqExpandTransition, SqSpacer |

Every component has live examples in the [docs](https://kheanglov.github.io/squirkle-ui/), plus [Storybook](https://kheanglov.github.io/squirkle-ui/storybook/) and [one example app per framework](https://kheanglov.github.io/squirkle-ui/examples/).

## Example
```vue
<template>
  <SqApp>
    <SqAppBar title="Dashboard" />
    <SqMain>
      <SqContainer>
        <SqCard title="Sign in">
          <SqForm @submit="save">
            <SqTextField v-model="email" label="Email" type="email" />
            <SqSwitch v-model="remember" label="Remember me" />
            <SqBtn type="submit" color="primary">Continue</SqBtn>
          </SqForm>
        </SqCard>
      </SqContainer>
    </SqMain>
  </SqApp>
</template>
```

## Add-ons
Each add-on has its own entry, Vue 2.7 build and stylesheet:
```ts
import { SqDataGrid } from 'squirkle-ui/datagrid'        // Vue 3
// import { SqDataGrid } from 'squirkle-ui/datagrid/vue2' // Vue 2.7
import 'squirkle-ui/datagrid/styles.css'
```
| Import | Components | What it is |
|---|---|---|
| `squirkle-ui/datagrid` | SqDataGrid | Data grid: sort, filter, group, aggregate, pivot, tree data, master/detail, pinning, editing with undo, range selection, clipboard, CSV, virtual scroll, server-side model |
| `squirkle-ui/charts` | SqLineChart, SqBarChart, SqDonutChart, SqSparkline | SVG charts that follow the theme |
| `squirkle-ui/swiper` | SqSwiper | Carousel / slider |
| `squirkle-ui/calendar` | SqCalendar | Month / week / day calendar with events |
| `squirkle-ui/map` | SqMap | MapLibre vector maps (or Leaflet raster) with squircle markers and clustering |
| `squirkle-ui/icons` | SqIconPicker | Iconify icon picker and icon presets |
| `squirkle-ui/editor` | SqEditor | Rich-text editor (Tiptap) |

### Map setup
The map needs `maplibre-gl` (vector, default) or `leaflet` (`engine="raster"`). MapLibre loads a worker file that bundlers don't copy on their own; in Vite apps register it once:
```ts
import { setMapWorkerUrl } from 'squirkle-ui/map'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
setMapWorkerUrl(workerUrl)
```
The Nuxt module does this for you.

## Separate packages
Prefer smaller installs? Every part is also published on its own: [`@squirkle-ui/ui`](https://www.npmjs.com/package/@squirkle-ui/ui), [`@squirkle-ui/core`](https://www.npmjs.com/package/@squirkle-ui/core), [`@squirkle-ui/datagrid`](https://www.npmjs.com/package/@squirkle-ui/datagrid), [`@squirkle-ui/charts`](https://www.npmjs.com/package/@squirkle-ui/charts), [`@squirkle-ui/swiper`](https://www.npmjs.com/package/@squirkle-ui/swiper), [`@squirkle-ui/calendar`](https://www.npmjs.com/package/@squirkle-ui/calendar), [`@squirkle-ui/map`](https://www.npmjs.com/package/@squirkle-ui/map), [`@squirkle-ui/icons`](https://www.npmjs.com/package/@squirkle-ui/icons), [`@squirkle-ui/editor`](https://www.npmjs.com/package/@squirkle-ui/editor), [`@squirkle-ui/nuxt`](https://www.npmjs.com/package/@squirkle-ui/nuxt).

## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
