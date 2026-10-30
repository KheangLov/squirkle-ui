import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqDatePicker } from '@squirkle-ui/ui'

const meta: Meta<typeof SqDatePicker> = {
  title: 'Forms/SqDatePicker',
  component: SqDatePicker,
  argTypes: { color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] } },
  args: { showHeader: true, title: 'Select date', range: false, multiple: false, color: 'primary' },
  render: (args) => ({
    setup: () => ({ args, d: ref('2026-10-25') }),
    template: `<SqDatePicker v-bind="args" v-model="d" /> <code>{{ d }}</code>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Range: Story = {
  render: () => ({
    setup: () => ({ r: ref([]) }),
    template: `<SqDatePicker v-model="r" range color="secondary" /> <code>{{ r }}</code>`,
  }),
}
