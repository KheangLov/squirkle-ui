import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqExpansionPanels, SqExpansionPanel } from '@squirkle-ui/ui'

const meta: Meta<typeof SqExpansionPanels> = {
  title: 'Navigation/SqExpansionPanels',
  component: SqExpansionPanels,
  subcomponents: { SqExpansionPanel },
  argTypes: { variant: { control: 'inline-radio', options: ['default', 'separated', 'inset'] } },
  args: { variant: 'separated', multiple: false },
  render: (args) => ({
    setup: () => ({ args, open: ref(1) }),
    template: `<SqExpansionPanels v-bind="args" v-model="open"><SqExpansionPanel v-for="n in 3" :key="n" :value="n" :title="'Question ' + n" text="Squircles have continuous curvature, so corners look softer and more natural than circular arcs." /></SqExpansionPanels>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
