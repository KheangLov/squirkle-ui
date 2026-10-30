import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqTextField, SqField } from '@squirkle-ui/ui'

const meta: Meta<typeof SqTextField> = {
  title: 'Forms/SqTextField',
  component: SqTextField,
  subcomponents: { SqField },
  argTypes: { variant: { control: 'select', options: ['outlined', 'filled', 'solo', 'underlined', 'plain'] } },
  args: { label: 'Name', placeholder: 'Ada Lovelace', variant: 'outlined', clearable: true, disabled: false, hint: 'Your full name' },
  render: (args) => ({
    setup: () => ({ args, v: ref('') }),
    template: `<SqTextField v-bind="args" v-model="v" style="max-width:320px" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Variants: Story = {
  render: () => ({
    template: `<div class="sq-d-grid sq-gap-3" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
      <SqTextField v-for="v in ['outlined', 'filled', 'solo', 'underlined']" :key="v" :variant="v" :label="v" placeholder="Type…" clearable />
    </div>`,
  }),
}
export const ValidationAndExtras: Story = {
  render: () => ({
    setup: () => ({ email: ref(''), rules: [(v: string) => !!v || 'Required', (v: string) => /.+@.+/.test(v) || 'Invalid email'] }),
    template: `<div class="sq-d-grid sq-gap-3" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
      <SqTextField v-model="email" label="Email" prepend-inner-icon="lucide:mail" :rules="rules" required />
      <SqTextField label="Password" type="password" hint="At least 8 characters" persistent-hint />
      <SqTextField label="Price" prefix="$" suffix="USD" type="number" />
      <SqTextField label="Bio" :counter="40" :maxlength="40" />
    </div>`,
  }),
}
