import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqBtnGroup } from '@squirkle-ui/ui'

const meta: Meta<typeof SqBtnGroup> = {
  title: 'Buttons/SqBtnGroup',
  component: SqBtnGroup,
  args: { divided: false },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqBtnGroup v-bind="args"><SqBtn variant="text" color="surface">Day</SqBtn><SqBtn variant="text" color="surface">Week</SqBtn><SqBtn variant="text" color="surface">Month</SqBtn></SqBtnGroup>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
