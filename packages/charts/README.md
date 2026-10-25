# @squirkle-ui/charts

SVG charts that follow the theme for [Squirkle UI](https://www.npmjs.com/package/squirkle-ui). Works with Vue 3 and Vue 2.7.

## Install
```bash
npm i @squirkle-ui/charts @squirkle-ui/ui
```
Or get every component and add-on with [`squirkle-ui`](https://www.npmjs.com/package/squirkle-ui) and import from `squirkle-ui/charts`.

Peer dependencies: `vue`, `@squirkle-ui/ui`. Set up `@squirkle-ui/ui` first (`app.use(createSquirkle())` and `@squirkle-ui/ui/styles.css`).

## Usage
```ts
import { SqLineChart } from '@squirkle-ui/charts'        // Vue 3
// import { SqLineChart } from '@squirkle-ui/charts/vue2' // Vue 2.7
import '@squirkle-ui/charts/styles.css'
```
```vue
<template>
  <SqLineChart :labels="['Q1', 'Q2', 'Q3', 'Q4']" :series="[{ name: 'Revenue', data: [12, 18, 15, 22] }]" area smooth />
  <SqBarChart :labels="['A', 'B']" :series="[{ name: 'Units', data: [4, 7] }]" stacked />
  <SqDonutChart :data="[{ label: 'Web', value: 60 }, { label: 'App', value: 40 }]" />
  <SqSparkline :data="[3, 5, 4, 8]" />
</template>
<script setup lang="ts">
import { SqLineChart, SqBarChart, SqDonutChart, SqSparkline } from '@squirkle-ui/charts'
</script>
```
Series colours come from the theme (`--sq-series-1` … `--sq-series-8`) and switch with light/dark.


## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
