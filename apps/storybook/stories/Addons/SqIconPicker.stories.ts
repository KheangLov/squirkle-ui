import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqIconPicker } from '@squirkle-ui/icons'

const meta: Meta<typeof SqIconPicker> = {
  title: 'Add-ons/SqIconPicker',
  component: SqIconPicker,
  render: (args) => ({
    components: { SqIconPicker },
    setup: () => ({ args, icon: ref('lucide:rocket') }),
    template: `<SqIconPicker v-bind="args" v-model="icon" /><p>Selected: <code>{{ icon }}</code></p>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
