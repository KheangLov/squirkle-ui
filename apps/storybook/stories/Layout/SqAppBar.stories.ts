import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqAppBar } from '@squirkle-ui/ui'

const meta: Meta<typeof SqAppBar> = {
  title: 'Layout/SqAppBar',
  component: SqAppBar,
  args: { title: 'Dashboard', floating: true, flat: false, blur: true },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqAppBar v-bind="args" style="position:relative">
      <template #prepend><SqBtn icon="menu" variant="text" color="surface" /></template>
      <template #append><SqAvatar name="Dara Sok" size="small" /></template>
    </SqAppBar>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
