import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqSpeedDial } from '@squirkle-ui/ui'

const meta: Meta<typeof SqSpeedDial> = {
  title: 'Buttons/SqSpeedDial',
  component: SqSpeedDial,
  argTypes: { direction: { control: 'select', options: ['up', 'down', 'left', 'right'] } },
  args: { direction: 'up', openOnHover: false, actions: [{ icon: 'edit', label: 'Edit' }, { icon: 'copy', label: 'Duplicate' }, { icon: 'delete', label: 'Delete', color: 'error' }] },
  render: (args) => ({
    setup: () => ({ args, last: ref('—') }),
    template: `<div style="height:220px;display:flex;align-items:flex-end;justify-content:flex-end">
      <SqSpeedDial v-bind="args" @action="last = $event.label" />
    </div><div>Last action: {{ last }}</div>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
