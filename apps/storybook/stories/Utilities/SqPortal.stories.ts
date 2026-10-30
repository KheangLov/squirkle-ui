import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqPortal } from '@squirkle-ui/ui'

const meta: Meta<typeof SqPortal> = {
  title: 'Utilities/SqPortal',
  component: SqPortal,
  args: { target: '#sq-portal-story-target', disabled: false },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<div id="sq-portal-story-target" style="min-height:48px;border:1px dashed var(--sq-border);border-radius:12px;padding:12px">Portal target</div><SqPortal v-bind="args"><SqChip color="primary">Teleported into the target</SqChip></SqPortal>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
