import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqStepper } from '@squirkle-ui/ui'

const meta: Meta<typeof SqStepper> = {
  title: 'Navigation/SqStepper',
  component: SqStepper,
  args: { items: ['Cart', { title: 'Shipping', subtitle: 'Address' }, 'Payment', 'Review'], vertical: false, editable: false },
  render: (args) => ({
    setup: () => ({ args, s: ref(1), done: ref(false) }),
    template: `<SqStepper v-bind="args" v-model="s" @finish="done = true">
      <template #default="{ step }"><SqSheet border class="sq-pa-6">Step {{ step }} content</SqSheet></template>
    </SqStepper><SqAlert v-if="done" type="success" text="Order placed!" class="sq-mt-2" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
