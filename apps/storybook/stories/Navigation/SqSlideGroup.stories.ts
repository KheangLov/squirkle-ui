import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqSlideGroup } from '@squirkle-ui/ui'
import { fruits } from '../data'

const meta: Meta<typeof SqSlideGroup> = {
  title: 'Navigation/SqSlideGroup',
  component: SqSlideGroup,
  render: (args) => ({
    setup: () => ({ args, fruits }),
    template: `<SqSlideGroup v-bind="args" style="max-width:420px"><SqChip v-for="f in fruits" :key="f">{{ f }}</SqChip></SqSlideGroup>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
