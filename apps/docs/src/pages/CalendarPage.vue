<template>
  <div class="doc-page" style="max-width:1200px">
    <h1>Calendar</h1>
    <p class="lead"><code>@squirkle/calendar</code> — month, week and day views with overlapping-event layout, all-day lane, live "now" line, and drag to move / resize (snaps to 15 min).</p>
    <SqCalendar v-model="date" v-model:view="view" :events="events" editable @event-change="onChange" @click:time="add" @click:event="picked = $event.title" />
    <div class="sq-mt-2 sq-text-muted">Click an empty time slot (week/day view) to add an event · Last clicked: {{ picked }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CalendarEvent } from '@squirkle/calendar'

const today = new Date()
const at = (d: number, h: number, m = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + d, h, m)
const date = ref(today.toISOString().slice(0, 10))
const view = ref<'month' | 'week' | 'day'>('week')
const picked = ref('—')
const events = ref<CalendarEvent[]>([
  { id: 1, title: 'Design review', start: at(0, 10), end: at(0, 11, 30), color: 'primary' },
  { id: 2, title: 'Standup', start: at(0, 9), end: at(0, 9, 30), color: 'success' },
  { id: 3, title: 'Customer call', start: at(0, 10, 30), end: at(0, 12), color: 'accent' },
  { id: 4, title: 'Lunch', start: at(1, 12), end: at(1, 13), color: 'warning' },
  { id: 5, title: 'Sprint planning', start: at(2, 14), end: at(2, 16), color: 'secondary' },
  { id: 6, title: 'Conference', start: at(3, 0), end: at(5, 0), allDay: true, color: 'info' },
  { id: 7, title: 'Gym', start: at(-1, 18), end: at(-1, 19), color: 'error' },
])
let next = 100
const onChange = ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
  events.value = events.value.map((e) => (e.id === event.id ? { ...e, start, end } : e))
}
const add = (start: Date) => {
  events.value = [...events.value, { id: next++, title: 'New event', start, end: new Date(start.getTime() + 36e5), color: 'primary' }]
}
</script>
