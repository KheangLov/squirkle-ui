import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqBottomNavigation } from '@squirkle-ui/ui'

const meta: Meta<typeof SqBottomNavigation> = {
  title: 'Layout/SqBottomNavigation',
  component: SqBottomNavigation,
  args: { floating: true, items: [{ title: 'Home', icon: 'home' }, { title: 'Search', icon: 'search' }, { title: 'Alerts', icon: 'info' }] },
  render: (args) => ({
    setup: () => ({ args, tab: ref(0) }),
    template: `<SqBottomNavigation v-bind="args" v-model="tab" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
