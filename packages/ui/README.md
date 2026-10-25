# @squirkle-ui/ui

The core of [Squirkle UI](https://www.npmjs.com/package/squirkle-ui): **88 squircle-first Vue components** for Vue 2.7 and Vue 3, with theming, forms and validation, overlays and virtual scrolling. Add-ons (data grid, charts, map, …) are separate packages — or install everything at once with [`squirkle-ui`](https://www.npmjs.com/package/squirkle-ui).

## Install
```bash
npm i @squirkle-ui/ui vue
pnpm add @squirkle-ui/ui vue
```

## Setup

### Vue 3
```ts
import { createApp } from 'vue'
import { createSquirkle } from '@squirkle-ui/ui'
import '@squirkle-ui/ui/styles.css'
import App from './App.vue'

createApp(App).use(createSquirkle()).mount('#app')
```
`createSquirkle()` registers every component globally. To import them one by one instead, use `createSquirkle({ components: false })` and `import { SqBtn } from '@squirkle-ui/ui'`.

### Vue 2.7
```ts
import Vue from 'vue'
import { createSquirkle } from '@squirkle-ui/ui/vue2'
import '@squirkle-ui/ui/styles.css'

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
import { useTheme } from '@squirkle-ui/ui'

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

## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
