import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqTable } from '@squirkle-ui/ui'
import { people } from '../data'

const meta: Meta<typeof SqTable> = {
  title: 'Content/SqTable',
  component: SqTable,
  argTypes: { density: { control: 'inline-radio', options: ['default', 'comfortable', 'compact'] } },
  args: { striped: true, hover: true, density: 'default' },
  render: (args) => ({
    setup: () => ({ args, people }),
    template: `<SqTable v-bind="args"><thead><tr><th>Name</th><th>Role</th><th style="text-align:right">Score</th></tr></thead>
      <tbody><tr v-for="(p, i) in people.slice(0, 5)" :key="p"><td>{{ p }}</td><td>{{ ['Admin', 'Editor', 'Viewer'][i % 3] }}</td><td style="text-align:right">{{ 70 + i * 3 }}</td></tr></tbody></SqTable>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
