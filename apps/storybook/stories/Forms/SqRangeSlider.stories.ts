import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqRangeSlider } from '@squirkle-ui/ui'

const meta: Meta<typeof SqRangeSlider> = {
  title: 'Forms/SqRangeSlider',
  component: SqRangeSlider,
  render: (args) => ({
    setup: () => ({ args, r: ref([200, 640]) }),
    template: `<SqRangeSlider v-bind="args" v-model="r" label="Price" :max="1000" :step="10" thumb-label /> {{ r }}`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
