import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqVirtualScroll } from '@squirkle-ui/ui'

const meta: Meta<typeof SqVirtualScroll> = {
  title: 'Data/SqVirtualScroll',
  component: SqVirtualScroll,
  args: { itemHeight: 44, height: 320 },
  render: (args) => ({
    setup: () => ({ args, rows: Array.from({ length: 1_000_000 }, (_, i) => i + 1) }),
    template: `<SqVirtualScroll v-bind="args" :items="rows" style="border:1px solid var(--sq-border);border-radius:16px">
      <template #default="{ item }"><div style="display:flex;align-items:center;height:44px;padding:0 16px;border-bottom:1px solid var(--sq-border)">Row #{{ item }}</div></template>
    </SqVirtualScroll>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
