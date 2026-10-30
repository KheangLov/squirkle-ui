import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqContainer, SqRow, SqCol } from '@squirkle-ui/ui'

const meta: Meta<typeof SqContainer> = {
  title: 'Layout/SqContainer',
  component: SqContainer,
  subcomponents: { SqRow, SqCol },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqContainer v-bind="args">
      <SqRow dense>
        <SqCol v-for="n in 3" :key="n" cols="12" md="4"><SqSheet border class="sq-pa-4">md=4 · #{{ n }}</SqSheet></SqCol>
        <SqCol cols="12" md="8"><SqSheet border class="sq-pa-4">md=8</SqSheet></SqCol>
        <SqCol cols="12" md="4"><SqSheet border class="sq-pa-4">md=4</SqSheet></SqCol>
      </SqRow>
    </SqContainer>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const RowAlignment: Story = {
  render: () => ({
    template: `<SqRow align="center" justify="space-between"><SqCol cols="auto"><SqChip>start</SqChip></SqCol><SqCol cols="auto"><SqChip>end</SqChip></SqCol></SqRow>`,
  }),
}
export const ColOffset: Story = {
  render: () => ({
    template: `<SqRow><SqCol cols="6" offset="3"><SqSheet border class="sq-pa-4 sq-text-center">cols=6 offset=3</SqSheet></SqCol></SqRow>`,
  }),
}
