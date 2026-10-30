import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqCombobox } from '@squirkle-ui/ui'

const meta: Meta<typeof SqCombobox> = {
  title: 'Forms/SqCombobox',
  component: SqCombobox,
  render: (args) => ({
    setup: () => ({ args, tags: ref(['vue']) }),
    template: `<SqCombobox v-bind="args" v-model="tags" label="Tags" :items="['vue', 'nuxt', 'squircle']" multiple chips closable-chips style="max-width:360px" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
