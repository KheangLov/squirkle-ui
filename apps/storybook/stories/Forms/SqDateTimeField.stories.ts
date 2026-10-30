import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqDateTimeField } from '@squirkle-ui/ui'

const meta: Meta<typeof SqDateTimeField> = {
  title: 'Forms/SqDateTimeField',
  component: SqDateTimeField,
  argTypes: { timeFormat: { control: 'inline-radio', options: ['24hr', 'ampm'] } },
  args: { label: 'Meeting', clearable: true, timeFormat: '24hr', minuteStep: 1 },
  render: (args) => ({
    setup: () => ({ args, dt: ref('2026-10-25T14:30') }),
    template: `<SqDateTimeField v-bind="args" v-model="dt" style="max-width:320px" /><p>{{ dt }}</p>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
