import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqList, SqListItem, SqListSubheader, SqListGroup } from '@squirkle-ui/ui'
import { people } from '../data'

const meta: Meta<typeof SqList> = {
  title: 'Navigation/SqList',
  component: SqList,
  subcomponents: { SqListItem, SqListSubheader, SqListGroup },
  args: { selectable: true, nav: true, bordered: true, items: [{ type: 'subheader', title: 'Mail' }, { title: 'Inbox', value: 'inbox', prependIcon: 'lucide:inbox' }, { title: 'Sent', value: 'sent', prependIcon: 'lucide:send' }, { type: 'divider' }, { title: 'Trash', value: 'trash', prependIcon: 'delete' }] },
  render: (args) => ({
    setup: () => ({ args, sel: ref('inbox') }),
    template: `<SqList v-bind="args" v-model="sel" style="max-width:300px" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Composed: Story = {
  render: () => ({
    template: `<SqList nav bordered style="max-width:280px">
      <SqListSubheader>Account</SqListSubheader>
      <SqListItem title="Dara Sok" subtitle="dara@example.com" prepend-avatar="https://i.pravatar.cc/60?img=12" />
      <SqListGroup title="Settings" prepend-icon="lucide:settings" :model-value="true"><SqListItem title="Profile" link /><SqListItem title="Security" link /></SqListGroup>
    </SqList>`,
  }),
}
export const Virtual100k: Story = {
  render: () => ({
    setup: () => ({ items: Array.from({ length: 100_000 }, (_, i) => ({ title: `${people[i % 8]} #${i + 1}`, subtitle: `user${i}@example.com`, value: i })) }),
    template: `<SqList virtual :height="300" :item-height="56" bordered :items="items" />`,
  }),
}
