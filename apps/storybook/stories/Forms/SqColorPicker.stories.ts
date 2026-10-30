import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqColorPicker } from '@squirkle-ui/ui'

const meta: Meta<typeof SqColorPicker> = {
  title: 'Forms/SqColorPicker',
  component: SqColorPicker,
  args: { alpha: true, flat: false },
  render: (args) => ({
    setup: () => ({ args, c: ref('#5b5bd6') }),
    template: `<div class="sq-d-flex sq-gap-4 sq-flex-wrap"><SqColorPicker v-bind="args" v-model="c" /><SqSheet :color="c" width="120" height="120" elevation="2" /></div>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
