import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqBtnToggle } from '@squirkle-ui/ui'

const meta: Meta<typeof SqBtnToggle> = {
  title: 'Buttons/SqBtnToggle',
  component: SqBtnToggle,
  args: { mandatory: true, divided: false },
  render: (args) => ({
    setup: () => ({ args, align: ref('center') }),
    template: `<SqBtnToggle v-bind="args" v-model="align">
      <SqBtn value="left" icon="chevronLeft" variant="text" /><SqBtn value="center" icon="menu" variant="text" /><SqBtn value="right" icon="chevronRight" variant="text" />
    </SqBtnToggle> <code>{{ align }}</code>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
