import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqBtn } from '@squirkle-ui/ui'

const meta: Meta<typeof SqBtn> = {
  title: 'Buttons/SqBtn',
  component: SqBtn,
  argTypes: {
    variant: { control: 'select', options: ['flat', 'elevated', 'tonal', 'outlined', 'text', 'plain'] },
    size: { control: 'select', options: ['x-small', 'small', 'default', 'large', 'x-large'] },
    color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] },
  },
  args: { variant: 'flat', size: 'default', color: 'primary', loading: false, disabled: false, block: false },
  render: (args) => ({ components: { SqBtn }, setup: () => ({ args }), template: '<SqBtn v-bind="args">Button</SqBtn>' }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Variants: Story = {
  render: () => ({
    components: { SqBtn },
    template: `<div style="display:flex;gap:8px;flex-wrap:wrap">
      <SqBtn v-for="v in ['flat','elevated','tonal','outlined','text','plain']" :key="v" :variant="v">{{ v }}</SqBtn>
    </div>`,
  }),
}
