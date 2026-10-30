import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqToolbar } from '@squirkle-ui/ui'

const meta: Meta<typeof SqToolbar> = {
  title: 'Layout/SqToolbar',
  component: SqToolbar,
  args: { floating: true, dense: true },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqToolbar v-bind="args">
      <SqBtn icon="edit" variant="text" color="surface" /><SqBtn icon="copy" variant="text" color="surface" /><SqDivider vertical /><SqBtn icon="delete" variant="text" color="error" />
    </SqToolbar>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
