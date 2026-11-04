import SqCalendar from './SqCalendar.vue'

export { SqCalendar }
export { normalizeEvent, layoutDay, eventsOnDay } from './layout'
export type { CalendarEvent, NormEvent, Placed } from './layout'
export const componentNames = ['SqCalendar'] as const
export default SqCalendar
