import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqBreadcrumbs } from '@squirkle-ui/ui'

const meta: Meta<typeof SqBreadcrumbs> = {
  title: 'Navigation/SqBreadcrumbs',
  component: SqBreadcrumbs,
  args: { items: [{ title: 'Home', href: '#', icon: 'home' }, { title: 'Library', href: '#' }, { title: 'Data' }] },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqBreadcrumbs v-bind="args" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
