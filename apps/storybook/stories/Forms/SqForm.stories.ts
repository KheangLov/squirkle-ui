import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqForm } from '@squirkle-ui/ui'

const meta: Meta<typeof SqForm> = {
  title: 'Forms/SqForm',
  component: SqForm,
  render: (args) => ({
    setup: () => ({ args, result: ref(null), required: (v: unknown) => !!v || 'Required', email: (v: string) => /.+@.+/.test(v || '') || 'Valid email required' }),
    template: `<SqForm v-bind="args" style="max-width:360px" @submit="result = $event">
      <SqTextField label="Name" :rules="[required]" />
      <SqTextField label="Email" :rules="[email]" />
      <SqCheckbox label="I agree" :rules="[required]" />
      <SqBtn type="submit" block>Create account</SqBtn>
    </SqForm><pre>{{ result }}</pre>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
