import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqBanner } from '@squirkle-ui/ui'

const meta: Meta<typeof SqBanner> = {
  title: 'Feedback/SqBanner',
  component: SqBanner,
  args: { icon: 'lucide:wifi-off', text: 'You are offline. Changes will sync when you reconnect.' },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqBanner v-bind="args"><template #actions><SqBtn variant="text">Retry</SqBtn></template></SqBanner>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
