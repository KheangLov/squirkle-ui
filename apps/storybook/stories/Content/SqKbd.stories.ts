import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqKbd } from '@squirkle-ui/ui'

const meta: Meta<typeof SqKbd> = {
  title: 'Content/SqKbd',
  component: SqKbd,
  render: (args) => ({
    setup: () => ({ args }),
    template: `Press <SqKbd v-bind="args">⌘</SqKbd> + <SqKbd>K</SqKbd> to search`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
