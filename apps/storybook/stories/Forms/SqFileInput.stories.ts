import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqFileInput } from '@squirkle-ui/ui'

const meta: Meta<typeof SqFileInput> = {
  title: 'Forms/SqFileInput',
  component: SqFileInput,
  args: { multiple: true, hint: 'PNG, JPG up to 2 MB', maxSize: 2097152 },
  render: (args) => ({
    setup: () => ({ args, files: ref([]) }),
    template: `<SqFileInput v-bind="args" v-model="files" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
