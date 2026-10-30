import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqSkeleton } from '@squirkle-ui/ui'

const meta: Meta<typeof SqSkeleton> = {
  title: 'Feedback/SqSkeleton',
  component: SqSkeleton,
  argTypes: { type: { control: 'select', options: ['text', 'avatar', 'button', 'card', 'image'] } },
  args: { type: 'text', lines: 3 },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqSkeleton v-bind="args" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const ListItem: Story = {
  render: () => ({
    template: `<div class="sq-d-flex sq-gap-4"><SqSkeleton type="avatar" :lines="1" /><div style="flex:1"><SqSkeleton :lines="3" /></div></div>`,
  }),
}
