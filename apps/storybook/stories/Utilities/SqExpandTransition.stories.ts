import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqExpandTransition } from '@squirkle-ui/ui'

const meta: Meta<typeof SqExpandTransition> = {
  title: 'Utilities/SqExpandTransition',
  component: SqExpandTransition,
  render: (args) => ({
    setup: () => ({ args, open: ref(true) }),
    template: `<SqBtn variant="tonal" @click="open = !open">Toggle</SqBtn><SqExpandTransition><div v-if="open"><SqSheet border class="sq-pa-4 sq-mt-2">Collapsible content with a height transition.</SqSheet></div></SqExpandTransition>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
