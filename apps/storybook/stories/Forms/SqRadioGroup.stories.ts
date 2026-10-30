import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqRadioGroup, SqRadio } from '@squirkle-ui/ui'

const meta: Meta<typeof SqRadioGroup> = {
  title: 'Forms/SqRadioGroup',
  component: SqRadioGroup,
  subcomponents: { SqRadio },
  args: { label: 'Plan', inline: true, items: ['Free', 'Pro', 'Team'] },
  render: (args) => ({
    setup: () => ({ args, plan: ref('Pro') }),
    template: `<SqRadioGroup v-bind="args" v-model="plan" /> <code>{{ plan }}</code>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const RadioSlots: Story = {
  render: () => ({
    setup: () => ({ plan: ref('pro') }),
    template: `<SqRadioGroup v-model="plan" label="Plan"><SqRadio value="free" label="Free" /><SqRadio value="pro" label="Pro" color="success" /><SqRadio value="team" label="Team" disabled /></SqRadioGroup>`,
  }),
}
