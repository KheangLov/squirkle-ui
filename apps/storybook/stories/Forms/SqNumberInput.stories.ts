import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqNumberInput } from '@squirkle-ui/ui'

const meta: Meta<typeof SqNumberInput> = {
  title: 'Forms/SqNumberInput',
  component: SqNumberInput,
  argTypes: { controlVariant: { control: 'inline-radio', options: ['default', 'split'] } },
  args: { label: 'Quantity', min: 0, max: 10, step: 1, controlVariant: 'default' },
  render: (args) => ({
    setup: () => ({ args, n: ref(2) }),
    template: `<SqNumberInput v-bind="args" v-model="n" style="max-width:220px" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
