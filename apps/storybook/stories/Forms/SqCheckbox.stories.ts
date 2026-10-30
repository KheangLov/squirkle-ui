import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqCheckbox } from '@squirkle-ui/ui'

const meta: Meta<typeof SqCheckbox> = {
  title: 'Forms/SqCheckbox',
  component: SqCheckbox,
  argTypes: { color: { control: 'select', options: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'surface'] } },
  args: { label: 'Accept terms', color: 'primary', indeterminate: false, disabled: false },
  render: (args) => ({
    setup: () => ({ args, a: ref(true) }),
    template: `<SqCheckbox v-bind="args" v-model="a" /> <code>{{ a }}</code>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const ArrayModel: Story = {
  render: () => ({
    setup: () => ({ list: ref(['email']) }),
    template: `<SqCheckbox v-model="list" value="email" label="Email" /><SqCheckbox v-model="list" value="sms" label="SMS" color="success" /> <code>{{ list }}</code>`,
  }),
}
