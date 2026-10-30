import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqProgressCircular } from '@squirkle-ui/ui'

const meta: Meta<typeof SqProgressCircular> = {
  title: 'Feedback/SqProgressCircular',
  component: SqProgressCircular,
  argTypes: { modelValue: { control: { type: 'range', min: 0, max: 100 } }, color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] } },
  args: { modelValue: 72, indeterminate: false, size: 56, width: 6, color: 'success' },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqProgressCircular v-bind="args">{{ args.indeterminate ? '' : args.modelValue }}</SqProgressCircular>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
