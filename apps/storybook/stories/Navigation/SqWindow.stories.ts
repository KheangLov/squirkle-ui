import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqWindow, SqWindowItem } from '@squirkle-ui/ui'

const meta: Meta<typeof SqWindow> = {
  title: 'Navigation/SqWindow',
  component: SqWindow,
  subcomponents: { SqWindowItem },
  args: { showArrows: true, continuous: true },
  render: (args) => ({
    setup: () => ({ args, w: ref(1) }),
    template: `<SqWindow v-bind="args" v-model="w"><SqWindowItem v-for="n in 3" :key="n" :value="n"><SqSheet color="surface-variant" height="140" class="sq-d-flex sq-align-center sq-justify-center">Slide {{ n }}</SqSheet></SqWindowItem></SqWindow>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
