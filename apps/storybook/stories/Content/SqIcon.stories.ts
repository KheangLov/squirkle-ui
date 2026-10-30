import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqIcon } from '@squirkle-ui/ui'

const meta: Meta<typeof SqIcon> = {
  title: 'Content/SqIcon',
  component: SqIcon,
  argTypes: { size: { control: 'select', options: ['x-small', 'small', 'default', 'large', 'x-large'] }, color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] } },
  args: { icon: 'lucide:rocket', size: 'x-large', color: 'primary' },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqIcon v-bind="args" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Sources: Story = {
  render: () => ({
    template: `<div class="sq-d-flex sq-gap-3 sq-align-center"><SqIcon icon="check" size="large" /><SqIcon icon="lucide:rocket" size="x-large" color="primary" /><SqIcon icon="mdi:github" size="x-large" /><SqIcon icon="$heart" size="x-large" color="error" /><SqIcon icon="M12 2 2 22h20z" size="large" color="warning" /></div>`,
  }),
}
