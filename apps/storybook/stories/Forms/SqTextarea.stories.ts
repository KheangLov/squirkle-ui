import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqTextarea } from '@squirkle-ui/ui'

const meta: Meta<typeof SqTextarea> = {
  title: 'Forms/SqTextarea',
  component: SqTextarea,
  args: { label: 'Notes', autoGrow: true, counter: true, rows: 2 },
  render: (args) => ({
    setup: () => ({ args, t: ref('Squircles everywhere.') }),
    template: `<SqTextarea v-bind="args" v-model="t" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
