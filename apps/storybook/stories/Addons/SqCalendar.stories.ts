import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqCalendar } from '@squirkle-ui/calendar'
import { sampleEvents } from '../data'

/** Controlled calendar: the story applies `event-change` (drag / resize) to its own events. */
function calendarDemo() {
  const events = ref(sampleEvents())
  const move = ({ event, start, end }: { event: { id: unknown }; start: Date; end: Date }) => {
    events.value = events.value.map((e) => (e.id === event.id ? { ...e, start, end } : e))
  }
  return { date: ref(new Date()), view: ref('month'), events, move }
}

const meta: Meta<typeof SqCalendar> = {
  title: 'Add-ons/SqCalendar',
  component: SqCalendar,
  args: { editable: true },
  render: (args) => ({
    components: { SqCalendar },
    setup: () => ({ args, ...calendarDemo() }),
    template: `<SqCalendar v-bind="args" v-model="date" v-model:view="view" :events="events" @event-change="move" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Week: Story = {
  render: () => ({
    components: { SqCalendar },
    setup: () => ({ date: ref(new Date()), events: sampleEvents() }),
    template: `<SqCalendar v-model="date" view="week" :events="events" />`,
  }),
}
