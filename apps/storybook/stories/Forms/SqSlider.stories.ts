import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqSlider } from '@squirkle-ui/ui'

const meta: Meta<typeof SqSlider> = {
  title: 'Forms/SqSlider',
  component: SqSlider,
  args: { label: 'Volume', min: 0, max: 100, step: 1, thumbLabel: true, showTicks: false },
  render: (args) => ({
    setup: () => ({ args, v: ref(40) }),
    template: `<SqSlider v-bind="args" v-model="v" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
