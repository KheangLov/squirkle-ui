import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqBarChart } from '@squirkle-ui/charts'

const meta: Meta<typeof SqBarChart> = {
  title: 'Add-ons/SqBarChart',
  component: SqBarChart,
  args: { title: 'Signups by region', stacked: false, horizontal: false, labels: ['APAC', 'EMEA', 'NA', 'LATAM'], series: [{ name: '2025', data: [420, 380, 510, 160] }, { name: '2026', data: [560, 410, 590, 240] }] },
  render: (args) => ({
    components: { SqBarChart },
    setup: () => ({ args }),
    template: `<SqBarChart v-bind="args" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Horizontal: Story = {
  render: () => ({
    components: { SqBarChart },
    template: `<SqBarChart title="Profit by product" horizontal :labels="['Lamp', 'Chair', 'Desk', 'Monitor', 'Mug']" :series="[{ name: 'Profit', data: [32, -8, 24, 41, 12] }]" :height="240" />`,
  }),
}
