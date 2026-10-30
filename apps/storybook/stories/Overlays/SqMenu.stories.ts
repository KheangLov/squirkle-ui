import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqMenu } from '@squirkle-ui/ui'

const meta: Meta<typeof SqMenu> = {
  title: 'Overlays/SqMenu',
  component: SqMenu,
  argTypes: { location: { control: 'select', options: ['bottom start', 'bottom', 'top start', 'right start', 'left start'] } },
  args: { location: 'bottom start', openOnHover: false, closeOnContentClick: true },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqMenu v-bind="args">
      <template #activator><SqBtn append-icon="chevronDown" variant="tonal">Options</SqBtn></template>
      <SqList nav density="compact" :items="[{ title: 'Edit', prependIcon: 'edit' }, { title: 'Duplicate', prependIcon: 'copy' }, { type: 'divider' }, { title: 'Delete', prependIcon: 'delete' }]" />
    </SqMenu>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
