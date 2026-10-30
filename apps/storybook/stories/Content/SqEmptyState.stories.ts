import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqEmptyState } from '@squirkle-ui/ui'

const meta: Meta<typeof SqEmptyState> = {
  title: 'Content/SqEmptyState',
  component: SqEmptyState,
  args: { title: 'No projects yet', text: 'Create your first project to get started.', icon: 'lucide:folder-open' },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqEmptyState v-bind="args"><template #actions><SqBtn prepend-icon="plus">New project</SqBtn></template></SqEmptyState>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
