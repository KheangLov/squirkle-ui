import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqRating } from '@squirkle-ui/ui'

const meta: Meta<typeof SqRating> = {
  title: 'Feedback/SqRating',
  component: SqRating,
  argTypes: { color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] } },
  args: { length: 5, clearable: true, readonly: false, color: 'warning' },
  render: (args) => ({
    setup: () => ({ args, r: ref(3) }),
    template: `<SqRating v-bind="args" v-model="r" /> {{ r }} / {{ args.length }}`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
