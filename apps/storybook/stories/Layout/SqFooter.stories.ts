import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqFooter } from '@squirkle-ui/ui'

const meta: Meta<typeof SqFooter> = {
  title: 'Layout/SqFooter',
  component: SqFooter,
  args: { app: false },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqFooter v-bind="args">© 2026 Squirkle · <a href="#">Privacy</a></SqFooter>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
