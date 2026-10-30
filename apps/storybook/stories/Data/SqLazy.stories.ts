import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqLazy } from '@squirkle-ui/ui'

const meta: Meta<typeof SqLazy> = {
  title: 'Data/SqLazy',
  component: SqLazy,
  args: { minHeight: 80 },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqLazy v-bind="args"><SqAlert type="success" text="I was rendered lazily." /></SqLazy>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
