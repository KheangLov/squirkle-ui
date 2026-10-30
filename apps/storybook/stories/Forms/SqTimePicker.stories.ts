import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqTimePicker } from '@squirkle-ui/ui'

const meta: Meta<typeof SqTimePicker> = {
  title: 'Forms/SqTimePicker',
  component: SqTimePicker,
  argTypes: { format: { control: 'inline-radio', options: ['24hr', 'ampm'] } },
  args: { format: '24hr', useSeconds: false, minuteStep: 1 },
  render: (args) => ({
    setup: () => ({ args, t: ref('14:30') }),
    template: `<SqTimePicker v-bind="args" v-model="t" /> {{ t }}`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
