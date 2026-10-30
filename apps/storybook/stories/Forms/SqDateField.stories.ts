import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqDateField } from '@squirkle-ui/ui'

const meta: Meta<typeof SqDateField> = {
  title: 'Forms/SqDateField',
  component: SqDateField,
  args: { label: 'Due date', clearable: true, range: false },
  render: (args) => ({
    setup: () => ({ args, d: ref('') }),
    template: `<SqDateField v-bind="args" v-model="d" style="max-width:320px" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
