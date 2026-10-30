import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqDateTimePicker } from '@squirkle-ui/ui'

const meta: Meta<typeof SqDateTimePicker> = {
  title: 'Forms/SqDateTimePicker',
  component: SqDateTimePicker,
  args: { minuteStep: 1, useSeconds: false, flat: false },
  render: (args) => ({
    setup: () => ({ args, dt: ref('2026-10-25T09:00') }),
    template: `<SqDateTimePicker v-bind="args" v-model="dt" /><p>{{ dt }}</p>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
