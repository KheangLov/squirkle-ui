import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqPagination } from '@squirkle-ui/ui'

const meta: Meta<typeof SqPagination> = {
  title: 'Navigation/SqPagination',
  component: SqPagination,
  args: { length: 24, totalVisible: 7 },
  render: (args) => ({
    setup: () => ({ args, p: ref(6) }),
    template: `<SqPagination v-bind="args" v-model="p" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
