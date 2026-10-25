# @squirkle-ui/calendar

Month / week / day calendar with events for [Squirkle UI](https://www.npmjs.com/package/squirkle-ui). Works with Vue 3 and Vue 2.7.

## Install
```bash
npm i @squirkle-ui/calendar @squirkle-ui/ui
```
Or get every component and add-on with [`squirkle-ui`](https://www.npmjs.com/package/squirkle-ui) and import from `squirkle-ui/calendar`.

Peer dependencies: `vue`, `@squirkle-ui/ui`. Set up `@squirkle-ui/ui` first (`app.use(createSquirkle())` and `@squirkle-ui/ui/styles.css`).

## Usage
```ts
import { SqCalendar } from '@squirkle-ui/calendar'        // Vue 3
// import { SqCalendar } from '@squirkle-ui/calendar/vue2' // Vue 2.7
import '@squirkle-ui/calendar/styles.css'
```
```vue
<template>
  <SqCalendar v-model="date" view="month" :events="events" editable />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { SqCalendar, type CalendarEvent } from '@squirkle-ui/calendar'
const date = ref(new Date())
const events: CalendarEvent[] = [{ id: 1, title: 'Launch', start: '2026-11-10T09:00', end: '2026-11-10T10:00' }]
</script>
```
Key props: `view`, `views`, `events`, `firstDayOfWeek`, `editable`, `snap`, `hourHeight`. Events: `id`, `title`, `start`, `end`, `color`, `allDay`.


## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
