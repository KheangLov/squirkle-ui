# @squirkle-ui/icons

Iconify icon picker and icon presets for [Squirkle UI](https://www.npmjs.com/package/squirkle-ui). Works with Vue 3 and Vue 2.7.

## Install
```bash
npm i @squirkle-ui/icons @squirkle-ui/ui
```
Or get every component and add-on with [`squirkle-ui`](https://www.npmjs.com/package/squirkle-ui) and import from `squirkle-ui/icons`.

Peer dependencies: `vue`, `@squirkle-ui/ui`. Set up `@squirkle-ui/ui` first (`app.use(createSquirkle())` and `@squirkle-ui/ui/styles.css`).

## Usage
```ts
import { SqIconPicker } from '@squirkle-ui/icons'        // Vue 3
// import { SqIconPicker } from '@squirkle-ui/icons/vue2' // Vue 2.7
import '@squirkle-ui/icons/styles.css'
```
```vue
<template>
  <SqIconPicker v-model="icon" :prefixes="['lucide', 'mdi']" />
  <SqIcon :icon="icon" />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { SqIconPicker, useIconPreset } from '@squirkle-ui/icons'
useIconPreset('lucide') // or 'mdi': built-in icon aliases from that set
const icon = ref('lucide:star')
</script>
```
Key props: `prefixes`, `columns`, `height`, `limit`, `placeholder`. Also exports `addIcons` / `addCollection` for offline icon sets and `preloadIcons`.


## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
