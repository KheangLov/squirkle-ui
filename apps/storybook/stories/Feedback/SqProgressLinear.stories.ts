import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqProgressLinear } from '@squirkle-ui/ui'

const meta: Meta<typeof SqProgressLinear> = {
  title: 'Feedback/SqProgressLinear',
  component: SqProgressLinear,
  argTypes: { modelValue: { control: { type: 'range', min: 0, max: 100 } }, color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] } },
  args: { modelValue: 64, indeterminate: false, striped: false, height: 8, color: 'primary' },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqProgressLinear v-bind="args" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Kinds: Story = {
  render: () => ({
    template: `<div class="sq-d-flex sq-flex-column sq-gap-3"><SqProgressLinear :model-value="64" /><SqProgressLinear :model-value="40" :buffer-value="70" color="secondary" /><SqProgressLinear indeterminate color="success" /><SqProgressLinear :model-value="80" striped :height="14">80%</SqProgressLinear></div>`,
  }),
}
