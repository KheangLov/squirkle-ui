import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqDonutChart } from '@squirkle-ui/charts'

const meta: Meta<typeof SqDonutChart> = {
  title: 'Add-ons/SqDonutChart',
  component: SqDonutChart,
  args: { title: 'Traffic sources', totalLabel: 'Visits', data: [{ label: 'Search', value: 4200 }, { label: 'Direct', value: 2600 }, { label: 'Social', value: 1800 }, { label: 'Email', value: 900 }] },
  render: (args) => ({
    components: { SqDonutChart },
    setup: () => ({ args }),
    template: `<SqDonutChart v-bind="args" style="max-width:420px" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
