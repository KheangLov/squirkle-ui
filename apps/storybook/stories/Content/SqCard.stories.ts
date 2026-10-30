import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqCard, SqCardTitle, SqCardText, SqCardActions } from '@squirkle-ui/ui'

const meta: Meta<typeof SqCard> = {
  title: 'Content/SqCard',
  component: SqCard,
  subcomponents: { SqCardTitle, SqCardText, SqCardActions },
  argTypes: { variant: { control: 'select', options: ['elevated', 'outlined', 'tonal', 'flat'] } },
  args: { title: 'Desert dunes', subtitle: 'Travel guide', image: 'https://images.unsplash.com/photo-1600520611035-84157ad4084d?w=800&q=60', variant: 'elevated', hover: false, loading: false },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqCard v-bind="args" style="max-width:340px">
      <SqCardText>Golden sand, open skies and the quiet of the desert at dawn.</SqCardText>
      <template #actions><SqBtn variant="text">Share</SqBtn><SqSpacer /><SqBtn variant="tonal">Explore</SqBtn></template>
    </SqCard>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Variants: Story = {
  render: () => ({
    template: `<div class="sq-d-grid sq-gap-3" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
      <SqCard v-for="v in ['elevated', 'outlined', 'tonal', 'flat']" :key="v" :variant="v" :title="v" text="Card body" hover />
    </div>`,
  }),
}
export const Composed: Story = {
  render: () => ({
    template: `<SqCard variant="outlined" style="max-width:340px">
      <SqCardTitle>Composed card</SqCardTitle>
      <SqCardText>Built from SqCardTitle, SqCardText and SqCardActions.</SqCardText>
      <SqCardActions><SqSpacer /><SqBtn variant="text">Cancel</SqBtn><SqBtn>Save</SqBtn></SqCardActions>
    </SqCard>`,
  }),
}
