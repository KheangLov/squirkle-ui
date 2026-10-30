import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqBadge } from '@squirkle-ui/ui'

const meta: Meta<typeof SqBadge> = {
  title: 'Content/SqBadge',
  component: SqBadge,
  argTypes: { color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] } },
  args: { content: '3', dot: false, max: 99, color: 'error' },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqBadge v-bind="args"><SqBtn icon="info" variant="tonal" /></SqBadge>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Kinds: Story = {
  render: () => ({
    template: `<div class="sq-d-flex sq-gap-6"><SqBadge content="3"><SqBtn icon="info" variant="tonal" /></SqBadge><SqBadge dot color="success"><SqAvatar name="Ann" /></SqBadge><SqBadge content="120" :max="99"><SqIcon icon="lucide:bell" size="large" /></SqBadge></div>`,
  }),
}
