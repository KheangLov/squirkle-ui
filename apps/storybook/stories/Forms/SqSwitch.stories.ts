import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqSwitch } from '@squirkle-ui/ui'

const meta: Meta<typeof SqSwitch> = {
  title: 'Forms/SqSwitch',
  component: SqSwitch,
  argTypes: { color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] } },
  args: { label: 'Notifications', inset: false, loading: false, color: 'primary' },
  render: (args) => ({
    setup: () => ({ args, on: ref(true) }),
    template: `<SqSwitch v-bind="args" v-model="on" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
