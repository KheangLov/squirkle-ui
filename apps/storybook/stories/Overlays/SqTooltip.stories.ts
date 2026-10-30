import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqTooltip } from '@squirkle-ui/ui'

const meta: Meta<typeof SqTooltip> = {
  title: 'Overlays/SqTooltip',
  component: SqTooltip,
  argTypes: { location: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] } },
  args: { text: 'Save (⌘S)', location: 'top' },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqTooltip v-bind="args"><SqBtn icon="download" variant="tonal" /></SqTooltip>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
