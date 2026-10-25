# @squirkle-ui/swiper

Carousel / slider for [Squirkle UI](https://www.npmjs.com/package/squirkle-ui). Works with Vue 3 and Vue 2.7.

## Install
```bash
npm i @squirkle-ui/swiper @squirkle-ui/ui
pnpm add @squirkle-ui/swiper @squirkle-ui/ui
```
Or get every component and add-on with [`squirkle-ui`](https://www.npmjs.com/package/squirkle-ui) and import from `squirkle-ui/swiper`.

Peer dependencies: `vue`, `@squirkle-ui/ui`. Set up `@squirkle-ui/ui` first (`app.use(createSquirkle())` and `@squirkle-ui/ui/styles.css`).

## Usage
```ts
import { SqSwiper } from '@squirkle-ui/swiper'        // Vue 3
// import { SqSwiper } from '@squirkle-ui/swiper/vue2' // Vue 2.7
import '@squirkle-ui/swiper/styles.css'
```
```vue
<template>
  <SqSwiper v-model="index" :items="slides" :slides-per-view="1.2" :space-between="16" loop>
    <template #default="{ item }"><img :src="item.src" :alt="item.alt" /></template>
  </SqSwiper>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { SqSwiper } from '@squirkle-ui/swiper'
const index = ref(0)
const slides = [{ src: '/a.jpg', alt: 'A' }, { src: '/b.jpg', alt: 'B' }]
</script>
```
Key props: `items`, `itemKey`, `slidesPerView`, `spaceBetween`, `breakpoints`, `effect`, `loop`, `pagination` (`dots` · `fraction` · `progress` · `false`).


## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
