import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqSparkline } from '@squirkle-ui/charts'

const meta: Meta<typeof SqSparkline> = {
  title: 'Add-ons/SqSparkline',
  component: SqSparkline,
  args: { data: [4, 6, 5, 8, 7, 10, 9, 12], color: 'success', fill: true, width: 160, height: 48 },
  render: (args) => ({
    components: { SqSparkline },
    setup: () => ({ args }),
    template: `<SqSparkline v-bind="args" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
