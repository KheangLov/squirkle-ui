import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqOtpInput } from '@squirkle-ui/ui'

const meta: Meta<typeof SqOtpInput> = {
  title: 'Forms/SqOtpInput',
  component: SqOtpInput,
  args: { length: 6, masked: false },
  render: (args) => ({
    setup: () => ({ args, code: ref(''), done: ref('—') }),
    template: `<SqOtpInput v-bind="args" v-model="code" @finish="done = $event" /><div class="sq-mt-2">Finished: {{ done }}</div>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
