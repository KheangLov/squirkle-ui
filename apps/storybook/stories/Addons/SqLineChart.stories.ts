import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqLineChart } from '@squirkle-ui/charts'
import { months } from '../data'

const meta: Meta<typeof SqLineChart> = {
  title: 'Add-ons/SqLineChart',
  component: SqLineChart,
  args: { title: 'Revenue', subtitle: 'Monthly, USD', area: true, labels: months, series: [{ name: 'Subscriptions', data: [12, 15, 14, 18, 22, 25, 24, 28, 31, 29, 34, 38] }, { name: 'Services', data: [6, 7, 9, 8, 10, 12, 11, 13, 12, 15, 16, 18] }] },
  render: (args) => ({
    components: { SqLineChart },
    setup: () => ({ args }),
    template: `<SqLineChart v-bind="args" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
