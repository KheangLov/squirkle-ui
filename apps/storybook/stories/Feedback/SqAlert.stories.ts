import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqAlert } from '@squirkle-ui/ui'

const meta: Meta<typeof SqAlert> = {
  title: 'Feedback/SqAlert',
  component: SqAlert,
  argTypes: { type: { control: 'select', options: ['info', 'success', 'warning', 'error'] }, variant: { control: 'select', options: ['flat', 'elevated', 'tonal', 'outlined', 'text', 'plain'] } },
  args: { type: 'info', title: 'Heads up', text: 'A new version is available.', variant: 'tonal', closable: false, prominent: false },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqAlert v-bind="args" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Types: Story = {
  render: () => ({
    template: `<div class="sq-d-flex sq-flex-column sq-gap-2">
      <SqAlert type="info" title="Heads up" text="A new version is available." />
      <SqAlert type="success" text="Profile saved." closable />
      <SqAlert type="warning" variant="outlined" text="Your trial ends in 3 days." />
      <SqAlert type="error" variant="flat" prominent title="Payment failed" text="Check your card details." />
    </div>`,
  }),
}
