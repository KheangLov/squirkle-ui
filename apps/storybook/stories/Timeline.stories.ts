import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqTimeline, SqTimelineItem } from '@squirkle-ui/ui'

const meta: Meta<typeof SqTimeline> = {
  title: 'Content/SqTimeline',
  component: SqTimeline,
  argTypes: { align: { control: 'inline-radio', options: ['start', 'alternate'] } },
  args: { align: 'start', dense: false },
  render: (args) => ({
    components: { SqTimeline, SqTimelineItem },
    setup: () => ({ args }),
    template: `<SqTimeline v-bind="args" style="max-width:640px">
      <SqTimelineItem title="Order placed" time="09:12" icon="check" color="success"><template #opposite>Mon</template>Payment confirmed</SqTimelineItem>
      <SqTimelineItem title="Shipped" time="13:40" icon="arrowUp"><template #opposite>Tue</template>Courier picked up the parcel</SqTimelineItem>
      <SqTimelineItem title="Out for delivery" time="—" small color="warning"><template #opposite>Wed</template></SqTimelineItem>
    </SqTimeline>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Start: Story = {}
export const Alternate: Story = { args: { align: 'alternate' } }
