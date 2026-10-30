import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqAvatar } from '@squirkle-ui/ui'

const meta: Meta<typeof SqAvatar> = {
  title: 'Content/SqAvatar',
  component: SqAvatar,
  argTypes: { size: { control: 'select', options: ['x-small', 'small', 'default', 'large', 'x-large'] }, color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] } },
  args: { name: 'Dara Sok', size: 'large', color: 'primary' },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqAvatar v-bind="args" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Kinds: Story = {
  render: () => ({
    template: `<div class="sq-d-flex sq-align-center sq-gap-3">
      <SqAvatar image="https://i.pravatar.cc/120?img=12" size="x-large" /><SqAvatar name="Dara Sok" size="large" /><SqAvatar icon="lucide:user" color="secondary" />
      <SqAvatar name="Eva" variant="flat" color="success" size="small" /><SqAvatar name="Pill" rounded="pill" />
    </div>`,
  }),
}
