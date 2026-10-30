import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqSheet } from '@squirkle-ui/ui'

const meta: Meta<typeof SqSheet> = {
  title: 'Content/SqSheet',
  component: SqSheet,
  argTypes: { elevation: { control: { type: 'range', min: 0, max: 5 } } },
  args: { elevation: 2, border: false, width: 160, height: 120 },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqSheet v-bind="args" class="sq-d-flex sq-align-center sq-justify-center">Sheet</SqSheet>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Elevation: Story = {
  render: () => ({
    template: `<div class="sq-d-flex sq-gap-4 sq-flex-wrap"><SqSheet v-for="e in 6" :key="e" :elevation="e - 1" width="96" height="96" class="sq-d-flex sq-align-center sq-justify-center">{{ e - 1 }}</SqSheet></div>`,
  }),
}
