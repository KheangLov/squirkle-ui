import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqDataGrid } from '@squirkle-ui/datagrid'
import { gridRows, gridColumns } from '../data'

const meta: Meta<typeof SqDataGrid> = {
  title: 'Add-ons/SqDataGrid',
  component: SqDataGrid,
  args: { rows: gridRows, columns: gridColumns, height: 420, toolbar: true, rowSelection: 'multiple', pagination: false },
  render: (args) => ({
    components: { SqDataGrid },
    setup: () => ({ args, selected: ref([]) }),
    template: `<SqDataGrid v-bind="args" v-model:selected="selected" /><div class="sq-mt-2">Selected: {{ selected.length }}</div>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Grouped: Story = {
  render: () => ({
    components: { SqDataGrid },
    setup: () => ({ gridRows, gridColumns }),
    template: `<SqDataGrid :rows="gridRows" :columns="gridColumns" :group-by="['department']" :height="420" />`,
  }),
}
