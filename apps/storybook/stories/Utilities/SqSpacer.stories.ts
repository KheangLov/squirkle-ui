import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqSpacer } from '@squirkle-ui/ui'

const meta: Meta<typeof SqSpacer> = {
  title: 'Utilities/SqSpacer',
  component: SqSpacer,
  render: (args) => ({
    setup: () => ({ args }),
    template: `<div class="sq-d-flex"><SqChip>Start</SqChip><SqSpacer /><SqChip>End</SqChip></div>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
