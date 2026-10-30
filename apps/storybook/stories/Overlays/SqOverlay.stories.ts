import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqOverlay } from '@squirkle-ui/ui'

function overlayDemo() {
  const o = ref(false)
  return { o, show: () => { o.value = true; setTimeout(() => (o.value = false), 1500) } }
}

const meta: Meta<typeof SqOverlay> = {
  title: 'Overlays/SqOverlay',
  component: SqOverlay,
  args: { persistent: false },
  render: (args) => ({
    setup: () => ({ args, ...overlayDemo() }),
    template: `<SqBtn @click="show">Show for 1.5 s</SqBtn><SqOverlay v-bind="args" v-model="o"><SqProgressCircular indeterminate :size="48" color="surface" /></SqOverlay>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
