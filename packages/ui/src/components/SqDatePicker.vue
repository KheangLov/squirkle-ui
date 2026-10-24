<template>
  <div class="sq-date-picker sq-surface" :class="{ 'sq-date-picker--flat': flat }" :style="{ '--sq-c': colorValue(color) }">
    <SqShape v-if="!flat" />
    <div v-if="title || showHeader" class="sq-date-picker__header">
      <div class="sq-date-picker__header-label">{{ title }}</div>
      <div class="sq-date-picker__header-value">{{ headerText }}</div>
    </div>
    <div class="sq-date-picker__controls">
      <button type="button" class="sq-date-picker__month-btn" @click="view = view === 'month' ? 'year' : 'month'">{{ monthLabel }} <SqIcon icon="chevronDown" size="16px" /></button>
      <span class="sq-spacer"></span>
      <SqBtn icon="chevronLeft" variant="text" color="surface" size="small" :aria-label="messages.previous" @click="shift(-1)" />
      <SqBtn icon="chevronRight" variant="text" color="surface" size="small" :aria-label="messages.next" @click="shift(1)" />
    </div>
    <div v-if="view === 'year'" class="sq-date-picker__years">
      <button v-for="y in years" :key="y" type="button" class="sq-date-picker__year sq-squircle" :class="{ 'sq-date-picker__year--active': y === cursor.getFullYear() }" @click="pickYear(y)">{{ y }}</button>
    </div>
    <div v-else class="sq-date-picker__grid" role="grid" @keydown="onKeydown">
      <div v-for="(w, wi) in weekdays" :key="wi" class="sq-date-picker__weekday" role="columnheader">{{ w }}</div>
      <button
        v-for="d in days"
        :key="d.key"
        type="button"
        class="sq-date-picker__day sq-squircle"
        :class="dayClass(d.date)"
        :disabled="isDisabled(d.date)"
        :tabindex="isSameDay(d.date, focusDate) ? 0 : -1"
        :data-date="d.key"
        role="gridcell"
        :aria-selected="isSelectedDay(d.date) ? 'true' : 'false'"
        @click="pick(d.date)"
      >{{ d.date.getDate() }}<span v-if="hasEvent(d.date)" class="sq-date-picker__event"></span></button>
    </div>
    <div v-if="has('actions')" class="sq-date-picker__actions"><slot name="actions" /></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, getCurrentInstance, ref, type PropType } from 'vue'
import { addDays, addMonths, isSameDay, isSameMonth, monthGrid, startOfDay, toDate, toISODate, weekdayNames, type DateLike } from '@squirkle-ui/core'
import SqShape from './SqShape.vue'
import SqBtn from './SqBtn.vue'
import SqIcon from './SqIcon.vue'
import { useProxiedModel, vModel } from '../composables/model'
import { colorValue } from '../composables/style'
import { config } from '../config'

/** v-model: ISO date string `YYYY-MM-DD`, or [start, end] with `range`, or string[] with `multiple`. */
export default defineComponent({
  name: 'SqDatePicker',
  components: { SqShape, SqBtn, SqIcon },
  model: vModel,
  props: {
    modelValue: { type: [String, Array, Date] as PropType<string | string[] | Date | null>, default: undefined },
    range: Boolean,
    multiple: Boolean,
    min: { type: [String, Date] as PropType<DateLike>, default: undefined },
    max: { type: [String, Date] as PropType<DateLike>, default: undefined },
    allowedDates: { type: Function as PropType<(d: Date) => boolean>, default: undefined },
    events: { type: Array as PropType<string[]>, default: () => [] },
    firstDayOfWeek: { type: Number, default: 0 },
    color: { type: String, default: 'primary' },
    title: { type: String, default: undefined },
    showHeader: Boolean,
    flat: Boolean,
    locale: { type: String, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const model = useProxiedModel<string | string[] | Date | null | undefined>(props, emit)
    const loc = computed(() => props.locale ?? config.locale.code)
    const selected = computed<Date[]>(() => {
      const v = model.value
      return (Array.isArray(v) ? v : v ? [v] : []).map((x) => toDate(x)).filter(Boolean) as Date[]
    })
    const cursor = ref(selected.value[0] ?? new Date())
    const focusDate = ref(startOfDay(cursor.value))
    const view = ref<'month' | 'year'>('month')
    const inst = getCurrentInstance()
    const weekdays = computed(() => weekdayNames(loc.value, props.firstDayOfWeek, 'narrow'))
    const days = computed(() => monthGrid(cursor.value, props.firstDayOfWeek).map((date) => ({ date, key: toISODate(date) })))
    const monthLabel = computed(() => new Intl.DateTimeFormat(loc.value, { month: 'long', year: 'numeric' }).format(cursor.value))
    const headerText = computed(() => {
      const fmt = new Intl.DateTimeFormat(loc.value, { month: 'short', day: 'numeric', weekday: 'short' })
      return selected.value.length ? selected.value.map((d) => fmt.format(d)).join(' – ') : '—'
    })
    const years = computed(() => Array.from({ length: 24 }, (_, i) => cursor.value.getFullYear() - 12 + i))
    const minD = computed(() => toDate(props.min ?? null))
    const maxD = computed(() => toDate(props.max ?? null))
    const isDisabled = (d: Date) => (minD.value && d < startOfDay(minD.value)) || (maxD.value && d > maxD.value) || (props.allowedDates ? !props.allowedDates(d) : false)
    const isSelectedDay = (d: Date) => selected.value.some((s) => isSameDay(s, d))
    const inRange = (d: Date) => props.range && selected.value.length === 2 && d > selected.value[0] && d < selected.value[1]
    const eventSet = computed(() => new Set(props.events))
    const hasEvent = (d: Date) => eventSet.value.has(toISODate(d))
    const dayClass = (d: Date) => ({
      'sq-date-picker__day--outside': !isSameMonth(d, cursor.value),
      'sq-date-picker__day--today': isSameDay(d, new Date()),
      'sq-date-picker__day--selected': isSelectedDay(d),
      'sq-date-picker__day--in-range': inRange(d),
    })
    const emitDates = (dates: Date[]) => {
      const iso = dates.map(toISODate)
      model.value = props.range || props.multiple ? iso : iso[0]
    }
    const pick = (d: Date) => {
      focusDate.value = d
      if (!isSameMonth(d, cursor.value)) cursor.value = d
      if (props.range) {
        const s = selected.value
        emitDates(s.length !== 1 ? [d] : d < s[0] ? [d, s[0]] : [s[0], d])
      } else if (props.multiple) emitDates(isSelectedDay(d) ? selected.value.filter((x) => !isSameDay(x, d)) : [...selected.value, d])
      else emitDates([d])
    }
    const shift = (n: number) => (cursor.value = view.value === 'year' ? addMonths(cursor.value, n * 12 * 24) : addMonths(cursor.value, n))
    const pickYear = (y: number) => {
      cursor.value = new Date(y, cursor.value.getMonth(), 1)
      view.value = 'month'
    }
    const onKeydown = (e: KeyboardEvent) => {
      const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
      if (!delta) return
      e.preventDefault()
      focusDate.value = addDays(focusDate.value, delta)
      if (!isSameMonth(focusDate.value, cursor.value)) cursor.value = focusDate.value
      nextTick(() => (inst!.proxy!.$el as HTMLElement).querySelector<HTMLElement>(`[data-date="${toISODate(focusDate.value)}"]`)?.focus())
    }
    return { view, cursor, focusDate, weekdays, days, monthLabel, headerText, years, isDisabled, isSelectedDay, hasEvent, dayClass, pick, shift, pickYear, onKeydown, isSameDay, colorValue, has: (n: string) => !!slots[n], messages: computed(() => config.locale.messages) }
  },
})
</script>

<style>
.sq-date-picker { --sq-bg: var(--sq-surface-raised); --sq-r: var(--sq-radius-xl); --sq-bd: var(--sq-border); --sq-bw: 1px; display: inline-flex; flex-direction: column; width: 320px; max-width: 100%; padding: var(--sq-space-3); color: var(--sq-on-surface); }
.sq-date-picker--flat { --sq-bw: 0px; --sq-bg: transparent; padding: 0; }
.sq-date-picker__header { padding: var(--sq-space-2) var(--sq-space-2) var(--sq-space-3); border-bottom: 1px solid var(--sq-border); margin-bottom: var(--sq-space-2); }
.sq-date-picker__header-label { font-size: var(--sq-text-xs); color: var(--sq-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.sq-date-picker__header-value { font-size: var(--sq-text-2xl); font-weight: var(--sq-weight-semibold); }
.sq-date-picker__controls { display: flex; align-items: center; padding: 0 var(--sq-space-1) var(--sq-space-2); }
.sq-date-picker__month-btn { display: inline-flex; align-items: center; gap: 2px; border: 0; background: none; color: inherit; font: inherit; font-weight: var(--sq-weight-semibold); padding: 4px 8px; border-radius: var(--sq-radius-sm); cursor: pointer; text-transform: capitalize; }
.sq-date-picker__month-btn:hover { background: color-mix(in srgb, var(--sq-on-surface) 6%, transparent); }
.sq-date-picker__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.sq-date-picker__weekday { text-align: center; font-size: var(--sq-text-2xs); font-weight: var(--sq-weight-semibold); color: var(--sq-muted); padding: 4px 0; }
.sq-date-picker__day { --sq-r: var(--sq-radius-sm); position: relative; aspect-ratio: 1; border: 0; background: none; color: inherit; font: inherit; font-size: var(--sq-text-sm); cursor: pointer; font-variant-numeric: tabular-nums; outline: none; }
.sq-date-picker__day:hover:not(:disabled) { background: color-mix(in srgb, var(--sq-c) 10%, transparent); }
.sq-date-picker__day:focus-visible { box-shadow: var(--sq-focus-ring); }
.sq-date-picker__day:disabled { opacity: 0.3; cursor: default; }
.sq-date-picker__day--outside { color: var(--sq-muted); opacity: 0.55; }
.sq-date-picker__day--today { font-weight: var(--sq-weight-bold); color: var(--sq-c); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--sq-c) 40%, transparent); }
.sq-date-picker__day--in-range { background: color-mix(in srgb, var(--sq-c) 12%, transparent); --sq-r: 0px; }
.sq-date-picker__day--selected, .sq-date-picker__day--selected:hover { background: var(--sq-c) !important; color: #fff; font-weight: var(--sq-weight-semibold); opacity: 1; }
.sq-date-picker__event { position: absolute; bottom: 4px; left: 50%; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: currentColor; opacity: 0.7; }
.sq-date-picker__years { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; max-height: 260px; overflow-y: auto; }
.sq-date-picker__year { --sq-r: var(--sq-radius-sm); border: 0; background: none; color: inherit; font: inherit; padding: 10px 0; cursor: pointer; }
.sq-date-picker__year:hover { background: color-mix(in srgb, var(--sq-c) 10%, transparent); }
.sq-date-picker__year--active { background: var(--sq-c); color: #fff; }
.sq-date-picker__actions { display: flex; justify-content: flex-end; gap: var(--sq-space-2); padding-top: var(--sq-space-2); }
</style>
