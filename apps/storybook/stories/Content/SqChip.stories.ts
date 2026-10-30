import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqChip } from '@squirkle-ui/ui'

const meta: Meta<typeof SqChip> = {
  title: 'Content/SqChip',
  component: SqChip,
  argTypes: { color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] }, variant: { control: 'select', options: ['flat', 'elevated', 'tonal', 'outlined', 'text', 'plain'] }, size: { control: 'select', options: ['x-small', 'small', 'default', 'large', 'x-large'] } },
  args: { color: 'primary', variant: 'tonal', size: 'default', closable: false, filter: false, prependIcon: 'check' },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqChip v-bind="args">Chip</SqChip>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Kinds: Story = {
  render: () => ({
    template: `<div class="sq-d-flex sq-flex-wrap sq-gap-2">
      <SqChip>Default</SqChip><SqChip color="primary" variant="flat">Flat</SqChip><SqChip color="success" prepend-icon="check">Done</SqChip>
      <SqChip variant="outlined" color="warning">Outlined</SqChip><SqChip closable avatar="https://i.pravatar.cc/60?img=5">Closable</SqChip><SqChip size="small">Small</SqChip>
    </div>`,
  }),
}
