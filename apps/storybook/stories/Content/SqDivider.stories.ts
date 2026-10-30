import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqDivider } from '@squirkle-ui/ui'

const meta: Meta<typeof SqDivider> = {
  title: 'Content/SqDivider',
  component: SqDivider,
  render: (args) => ({
    setup: () => ({ args }),
    template: `<div>Above</div><SqDivider v-bind="args" /><div>Below</div>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Labelled: Story = {
  render: () => ({
    template: `<SqDivider /><SqDivider>OR</SqDivider>`,
  }),
}
export const Vertical: Story = {
  render: () => ({
    template: `<div class="sq-d-flex sq-align-center sq-gap-3" style="height:32px">Left<SqDivider vertical />Right</div>`,
  }),
}
