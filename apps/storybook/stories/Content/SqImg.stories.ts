import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqImg } from '@squirkle-ui/ui'

const meta: Meta<typeof SqImg> = {
  title: 'Content/SqImg',
  component: SqImg,
  args: { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&q=60', aspectRatio: '16/9', rounded: '2xl', cover: true },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqImg v-bind="args" style="max-width:420px" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
