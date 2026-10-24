<template>
  <div class="sq-calendar sq-surface" :style="{ '--sq-r': 'var(--sq-radius-xl)', '--sq-bg': 'var(--sq-surface)', '--sq-bd': 'var(--sq-border)', '--sq-bw': '1px' }">
    <SqShape clip />
    <div class="sq-calendar__toolbar">
      <SqBtn variant="tonal" size="small" @click="today">{{ messages.today }}</SqBtn>
      <SqBtn icon="chevronLeft" variant="text" color="surface" size="small" :aria-label="messages.previous" @click="shift(-1)" />
      <SqBtn icon="chevronRight" variant="text" color="surface" size="small" :aria-label="messages.next" @click="shift(1)" />
      <div class="sq-calendar__title">{{ title }}</div>
      <span class="sq-spacer"></span>
      <SqBtnToggle v-model="viewModel" mandatory>
        <SqBtn v-for="v in views" :key="v" :value="v" size="small" variant="text" color="surface">{{ viewLabels[v] }}</SqBtn>
      </SqBtnToggle>
    </div>

    <!-- month -->
    <div v-if="viewModel === 'month'" class="sq-calendar__month">
      <div v-for="(w, wi) in weekdays" :key="wi" class="sq-calendar__weekday">{{ w }}</div>
      <div
        v-for="d in monthDays"
        :key="d.key"
        class="sq-calendar__day"
        :class="{ 'sq-calendar__day--outside': !d.inMonth, 'sq-calendar__day--today': d.today, 'sq-calendar__day--drop': dropKey === d.key }"
        @click="$emit('click:date', d.key)"
        @dragover.prevent="dropKey = d.key"
        @dragleave="dropKey === d.key && (dropKey = '')"
        @drop.prevent="onMonthDrop(d.date)"
      >
        <span class="sq-calendar__date sq-squircle">{{ d.date.getDate() }}</span>
        <div
          v-for="e in d.events.slice(0, maxEvents)"
          :key="String(e.ev.id)"
          class="sq-calendar__chip sq-squircle"
          :class="{ 'sq-calendar__chip--allday': e.ev.allDay }"
          :style="{ '--sq-ev': colorOf(e.ev) }"
          :draggable="editable"
          :title="e.ev.title"
          @dragstart="dragId = e.ev.id"
          @click.stop="$emit('click:event', e.ev)"
        >
          <span v-if="!e.ev.allDay" class="sq-calendar__chip-time">{{ time(e.start) }}</span>{{ e.ev.title }}
        </div>
        <button v-if="d.events.length > maxEvents" type="button" class="sq-calendar__more" @click.stop="goDay(d.date)">+{{ d.events.length - maxEvents }} more</button>
      </div>
    </div>

    <!-- week / day -->
    <div v-else class="sq-calendar__time" :style="{ '--sq-cal-cols': columns.length }">
      <div class="sq-calendar__time-head">
        <div class="sq-calendar__gutter"></div>
        <div v-for="c in columns" :key="c.key" class="sq-calendar__col-head" :class="{ 'sq-calendar__col-head--today': c.today }">
          <span>{{ c.weekday }}</span><b class="sq-squircle">{{ c.date.getDate() }}</b>
        </div>
      </div>
      <div class="sq-calendar__allday">
        <div class="sq-calendar__gutter">all-day</div>
        <div v-for="c in columns" :key="c.key" class="sq-calendar__allday-col">
          <div v-for="e in c.allDay" :key="String(e.ev.id)" class="sq-calendar__chip sq-calendar__chip--allday sq-squircle" :style="{ '--sq-ev': colorOf(e.ev) }" @click="$emit('click:event', e.ev)">{{ e.ev.title }}</div>
        </div>
      </div>
      <div ref="scroller" class="sq-calendar__scroll" :style="{ height: toUnit(height) }">
        <div class="sq-calendar__grid" :style="{ height: 24 * hourHeight + 'px' }">
          <div class="sq-calendar__gutter sq-calendar__hours">
            <div v-for="h in 24" :key="h" class="sq-calendar__hour" :style="{ height: hourHeight + 'px' }"><span v-if="h > 1">{{ hourLabel(h - 1) }}</span></div>
          </div>
          <div v-for="c in columns" :key="c.key" class="sq-calendar__col" @click="onSlotClick($event, c.date)">
            <div v-for="h in 24" :key="h" class="sq-calendar__slot" :style="{ height: hourHeight + 'px' }"></div>
            <div v-if="c.today" class="sq-calendar__now" :style="{ top: nowTop + 'px' }"></div>
            <div
              v-for="p in c.placed"
              :key="String(p.ev.id)"
              class="sq-calendar__event sq-squircle"
              :class="{ 'sq-calendar__event--dragging': dragState && dragState.id === p.ev.id }"
              :style="eventStyle(p)"
              @pointerdown.stop="startDrag($event, p, 'move')"
              @click.stop="!moved && $emit('click:event', p.ev)"
            >
              <div class="sq-calendar__event-title">{{ p.ev.title }}</div>
              <div class="sq-calendar__event-time">{{ time(previewStart(p)) }} – {{ time(previewEnd(p)) }}</div>
              <div v-if="editable" class="sq-calendar__resize" @pointerdown.stop="startDrag($event, p, 'resize')"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import { addDays, addMonths, isSameDay, isSameMonth, monthGrid, startOfWeek, toISODate, toUnit, weekdayNames } from '@squirkle-ui/core'
import { SqBtn, SqBtnToggle, SqShape, colorValue, config, useProxiedModel, vModel } from '@squirkle-ui/ui'
import { eventsOnDay, layoutDay, normalizeEvent, type CalendarEvent, type Placed } from './layout'

type View = 'month' | 'week' | 'day'

/** Event calendar: month / week / day views, overlapping-event layout, drag to move & resize (editable). */
export default defineComponent({
  name: 'SqCalendar',
  components: { SqBtn, SqBtnToggle, SqShape },
  model: vModel,
  props: {
    /** Focused date (ISO `YYYY-MM-DD`). */
    modelValue: { type: String, default: undefined },
    view: { type: String as PropType<View>, default: 'month' },
    views: { type: Array as PropType<View[]>, default: () => ['month', 'week', 'day'] },
    events: { type: Array as PropType<CalendarEvent[]>, default: () => [] },
    firstDayOfWeek: { type: Number, default: 0 },
    editable: Boolean,
    /** Minutes the drag snaps to. */
    snap: { type: Number, default: 15 },
    hourHeight: { type: Number, default: 48 },
    height: { type: [Number, String], default: 560 },
    maxEvents: { type: Number, default: 3 },
    locale: { type: String, default: undefined },
    hour12: { type: Boolean, default: undefined },
  },
  emits: ['update:modelValue', 'update:view', 'click:event', 'click:date', 'click:time', 'event-change'],
  setup(props, { emit }) {
    const dateModel = useProxiedModel<string | undefined>(props, emit, 'modelValue', () => toISODate(new Date()))
    const viewModel = useProxiedModel<View>(props, emit, 'view')
    const loc = computed(() => props.locale ?? config.locale.code)
    const focus = computed(() => {
      const [y, m, d] = (dateModel.value ?? toISODate(new Date())).split('-').map(Number)
      return new Date(y, m - 1, d)
    })
    const norm = computed(() => props.events.map(normalizeEvent))
    const weekdays = computed(() => weekdayNames(loc.value, props.firstDayOfWeek, 'short'))
    const viewLabels: Record<View, string> = { month: 'Month', week: 'Week', day: 'Day' }
    const now = ref(new Date())
    // Started on mount so server rendering never creates a timer.
    let timer: ReturnType<typeof setInterval> | undefined
    onMounted(() => (timer = setInterval(() => (now.value = new Date()), 60_000)))
    onBeforeUnmount(() => clearInterval(timer))

    const title = computed(() => {
      const f = focus.value
      if (viewModel.value === 'day') return new Intl.DateTimeFormat(loc.value, { dateStyle: 'full' }).format(f)
      if (viewModel.value === 'week') {
        const a = startOfWeek(f, props.firstDayOfWeek)
        const b = addDays(a, 6)
        const fmt = new Intl.DateTimeFormat(loc.value, { month: 'short', day: 'numeric' })
        return `${fmt.format(a)} – ${fmt.format(b)}, ${b.getFullYear()}`
      }
      return new Intl.DateTimeFormat(loc.value, { month: 'long', year: 'numeric' }).format(f)
    })
    const monthDays = computed(() =>
      monthGrid(focus.value, props.firstDayOfWeek).map((date) => ({ date, key: toISODate(date), inMonth: isSameMonth(date, focus.value), today: isSameDay(date, now.value), events: eventsOnDay(norm.value, date) })),
    )
    const columns = computed(() => {
      const start = viewModel.value === 'day' ? focus.value : startOfWeek(focus.value, props.firstDayOfWeek)
      const count = viewModel.value === 'day' ? 1 : 7
      const wfmt = new Intl.DateTimeFormat(loc.value, { weekday: 'short' })
      return Array.from({ length: count }, (_, i) => {
        const date = addDays(start, i)
        return { date, key: toISODate(date), weekday: wfmt.format(date), today: isSameDay(date, now.value), placed: layoutDay(norm.value, date), allDay: eventsOnDay(norm.value, date).filter((e) => e.ev.allDay) }
      })
    })

    const shift = (d: number) => {
      const f = focus.value
      dateModel.value = toISODate(viewModel.value === 'month' ? addMonths(f, d) : addDays(f, d * (viewModel.value === 'week' ? 7 : 1)))
    }
    const today = () => (dateModel.value = toISODate(new Date()))
    const goDay = (d: Date) => { dateModel.value = toISODate(d); viewModel.value = 'day' }
    const colorOf = (ev: CalendarEvent) => colorValue(ev.color ?? 'primary')
    const time = (d: Date) => new Intl.DateTimeFormat(loc.value, { hour: 'numeric', minute: '2-digit', hour12: props.hour12 }).format(d)
    const hourLabel = (h: number) => new Intl.DateTimeFormat(loc.value, { hour: 'numeric', hour12: props.hour12 }).format(new Date(2024, 0, 1, h))
    const nowTop = computed(() => ((now.value.getHours() * 60 + now.value.getMinutes()) / 60) * props.hourHeight)

    // month drag (HTML5)
    const dragId = ref<string | number | null>(null)
    const dropKey = ref('')
    const onMonthDrop = (date: Date) => {
      dropKey.value = ''
      const e = norm.value.find((x) => x.ev.id === dragId.value)
      dragId.value = null
      if (!e || !props.editable) return
      const delta = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate()).getTime()) / 864e5)
      if (delta) emit('event-change', { event: e.ev, start: addDays(e.start, delta), end: addDays(e.end, delta) })
    }

    // week/day pointer drag
    const scroller = ref<HTMLElement | null>(null)
    const dragState = ref<{ id: string | number; mode: 'move' | 'resize'; dMin: number; dDay: number } | null>(null)
    const moved = ref(false)
    let origin = { x: 0, y: 0, colWidth: 1, placed: null as Placed | null }
    const snapMin = (m: number) => Math.round(m / props.snap) * props.snap
    const onDragMove = (e: PointerEvent) => {
      if (!dragState.value) return
      const dy = e.clientY - origin.y
      const dx = e.clientX - origin.x
      if (Math.abs(dy) + Math.abs(dx) > 4) moved.value = true
      dragState.value = { ...dragState.value, dMin: snapMin((dy / props.hourHeight) * 60), dDay: dragState.value.mode === 'move' ? Math.round(dx / origin.colWidth) : 0 }
    }
    const onDragEnd = () => {
      window.removeEventListener('pointermove', onDragMove)
      window.removeEventListener('pointerup', onDragEnd)
      const s = dragState.value
      const p = origin.placed
      dragState.value = null
      if (!s || !p || !moved.value) return
      const start = new Date(p.start.getTime() + (s.mode === 'move' ? s.dMin * 6e4 : 0) + s.dDay * 864e5)
      const end = new Date(p.end.getTime() + s.dMin * 6e4 + s.dDay * 864e5)
      if (end > start) emit('event-change', { event: p.ev, start, end })
      setTimeout(() => (moved.value = false), 0)
    }
    const startDrag = (e: PointerEvent, p: Placed, mode: 'move' | 'resize') => {
      if (!props.editable || e.button !== 0) return
      const col = (e.currentTarget as HTMLElement).closest('.sq-calendar__col') as HTMLElement
      origin = { x: e.clientX, y: e.clientY, colWidth: col?.offsetWidth || 1, placed: p }
      moved.value = false
      dragState.value = { id: p.ev.id, mode, dMin: 0, dDay: 0 }
      window.addEventListener('pointermove', onDragMove)
      window.addEventListener('pointerup', onDragEnd)
    }
    onBeforeUnmount(onDragEnd)
    const previewStart = (p: Placed) => (dragState.value?.id === p.ev.id && dragState.value.mode === 'move' ? new Date(p.start.getTime() + dragState.value.dMin * 6e4) : p.start)
    const previewEnd = (p: Placed) => (dragState.value?.id === p.ev.id ? new Date(p.end.getTime() + dragState.value.dMin * 6e4) : p.end)
    const eventStyle = (p: Placed) => {
      const ds = dragState.value?.id === p.ev.id ? dragState.value : null
      const top = (p.top + (ds && ds.mode === 'move' ? ds.dMin : 0)) / 60 * props.hourHeight
      const height = Math.max(18, ((p.height + (ds && ds.mode === 'resize' ? ds.dMin : 0)) / 60) * props.hourHeight - 2)
      return {
        top: `${top}px`, height: `${height}px`,
        left: `calc(${(p.col / p.cols) * 100}% + 2px)`, width: `calc(${100 / p.cols}% - 4px)`,
        transform: ds && ds.dDay ? `translateX(${ds.dDay * 100}%)` : undefined,
        '--sq-ev': colorOf(p.ev),
      }
    }
    const onSlotClick = (e: MouseEvent, date: Date) => {
      const col = e.currentTarget as HTMLElement
      const minutes = snapMin(((e.clientY - col.getBoundingClientRect().top) / props.hourHeight) * 60)
      emit('click:time', new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, minutes))
    }
    const scrollToNow = () => nextTick(() => scroller.value && (scroller.value.scrollTop = Math.max(0, nowTop.value - 120)))
    onMounted(scrollToNow)
    watch(viewModel, (v) => v !== 'month' && scrollToNow())

    return {
      viewModel, viewLabels, weekdays, title, monthDays, columns, shift, today, goDay, colorOf, time, hourLabel, nowTop, dragId, dropKey, onMonthDrop,
      scroller, dragState, moved, startDrag, previewStart, previewEnd, eventStyle, onSlotClick, toUnit, messages: computed(() => config.locale.messages),
    }
  },
})
</script>

<style>
.sq-calendar { display: flex; flex-direction: column; overflow: hidden; color: var(--sq-on-surface); font-size: var(--sq-text-sm); min-width: 0; }
.sq-calendar__toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: var(--sq-space-2); padding: var(--sq-space-3); border-bottom: 1px solid var(--sq-border); }
.sq-calendar__title { font-size: var(--sq-text-lg); font-weight: var(--sq-weight-semibold); margin-inline-start: var(--sq-space-2); text-transform: capitalize; }
.sq-calendar__month { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); grid-template-rows: auto; grid-auto-rows: minmax(104px, 1fr); }
.sq-calendar__weekday { padding: 8px; text-align: center; font-size: var(--sq-text-2xs); font-weight: var(--sq-weight-bold); text-transform: uppercase; letter-spacing: 0.05em; color: var(--sq-muted); border-bottom: 1px solid var(--sq-border); min-height: 0; }
.sq-calendar__month > .sq-calendar__weekday { grid-row: 1; }
.sq-calendar__day { display: flex; flex-direction: column; gap: 2px; min-width: 0; padding: 4px; border-inline-end: 1px solid var(--sq-border); border-bottom: 1px solid var(--sq-border); cursor: pointer; transition: background var(--sq-duration-fast); }
.sq-calendar__day:nth-child(7n) { border-inline-end: 0; }
.sq-calendar__day:hover { background: color-mix(in srgb, var(--sq-primary) 3%, transparent); }
.sq-calendar__day--outside { background: color-mix(in srgb, var(--sq-surface-variant) 40%, transparent); color: var(--sq-muted); }
.sq-calendar__day--drop { background: color-mix(in srgb, var(--sq-primary) 10%, transparent) !important; }
.sq-calendar__date { --sq-r: var(--sq-radius-sm); align-self: flex-end; display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; font-weight: var(--sq-weight-medium); font-variant-numeric: tabular-nums; }
.sq-calendar__day--today .sq-calendar__date { background: var(--sq-primary); color: var(--sq-on-primary); }
.sq-calendar__chip { --sq-r: var(--sq-radius-xs); display: block; padding: 2px 6px; font-size: var(--sq-text-xs); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--sq-on-surface); background: color-mix(in srgb, var(--sq-ev) 14%, transparent); border-inline-start: 3px solid var(--sq-ev); cursor: pointer; }
.sq-calendar__chip--allday { background: var(--sq-ev); color: #fff; border: 0; }
.sq-calendar__chip-time { margin-inline-end: 4px; color: var(--sq-muted); font-variant-numeric: tabular-nums; }
.sq-calendar__more { align-self: flex-start; padding: 0 6px; border: 0; background: none; color: var(--sq-primary); font: inherit; font-size: var(--sq-text-xs); font-weight: var(--sq-weight-semibold); cursor: pointer; }
.sq-calendar__time-head, .sq-calendar__allday { display: grid; grid-template-columns: 56px repeat(var(--sq-cal-cols), minmax(0, 1fr)); border-bottom: 1px solid var(--sq-border); }
.sq-calendar__col-head { display: flex; flex-direction: column; align-items: center; padding: 6px 0; font-size: var(--sq-text-2xs); color: var(--sq-muted); text-transform: uppercase; }
.sq-calendar__col-head b { --sq-r: var(--sq-radius-sm); display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 32px; font-size: var(--sq-text-lg); color: var(--sq-on-surface); }
.sq-calendar__col-head--today b { background: var(--sq-primary); color: var(--sq-on-primary); }
.sq-calendar__gutter { font-size: var(--sq-text-2xs); color: var(--sq-muted); text-align: end; padding-inline-end: 8px; }
.sq-calendar__allday .sq-calendar__gutter { padding-top: 6px; }
.sq-calendar__allday-col { display: flex; flex-direction: column; gap: 2px; padding: 3px; min-height: 28px; border-inline-start: 1px solid var(--sq-border); }
.sq-calendar__scroll { overflow-y: auto; }
.sq-calendar__grid { display: grid; grid-template-columns: 56px repeat(var(--sq-cal-cols), minmax(0, 1fr)); position: relative; }
.sq-calendar__hour { position: relative; }
.sq-calendar__hour span { position: absolute; top: -7px; right: 8px; }
.sq-calendar__col { position: relative; border-inline-start: 1px solid var(--sq-border); }
.sq-calendar__slot { border-bottom: 1px solid var(--sq-border); }
.sq-calendar__slot:nth-child(odd) { border-bottom-style: solid; }
.sq-calendar__now { position: absolute; left: 0; right: 0; height: 2px; background: var(--sq-error); z-index: 3; }
.sq-calendar__now::before { content: ''; position: absolute; left: -5px; top: -4px; width: 10px; height: 10px; border-radius: 50%; background: var(--sq-error); }
.sq-calendar__event { --sq-r: var(--sq-radius-sm); position: absolute; z-index: 2; overflow: hidden; padding: 4px 6px; background: color-mix(in srgb, var(--sq-ev) 18%, var(--sq-surface)); border-inline-start: 3px solid var(--sq-ev); color: var(--sq-on-surface); font-size: var(--sq-text-xs); cursor: pointer; touch-action: none; transition: box-shadow var(--sq-duration-fast); }
.sq-calendar__event:hover { box-shadow: var(--sq-elevation-2); z-index: 4; }
.sq-calendar__event--dragging { opacity: 0.85; box-shadow: var(--sq-elevation-3); z-index: 5; cursor: grabbing; }
.sq-calendar__event-title { font-weight: var(--sq-weight-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sq-calendar__event-time { color: var(--sq-on-surface-variant); font-variant-numeric: tabular-nums; }
.sq-calendar__resize { position: absolute; left: 0; right: 0; bottom: 0; height: 6px; cursor: ns-resize; }
</style>
