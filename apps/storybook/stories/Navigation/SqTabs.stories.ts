import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqTabs, SqTab } from '@squirkle-ui/ui'

const meta: Meta<typeof SqTabs> = {
  title: 'Navigation/SqTabs',
  component: SqTabs,
  subcomponents: { SqTab },
  argTypes: { variant: { control: 'inline-radio', options: ['pill', 'segmented', 'underline'] } },
  args: { items: ['Overview', 'Analytics', 'Reports', 'Settings'], variant: 'pill', grow: false },
  render: (args) => ({
    setup: () => ({ args, t: ref('Overview') }),
    template: `<SqTabs v-bind="args" v-model="t" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const WithTabSlots: Story = {
  render: () => ({
    setup: () => ({ t: ref('a') }),
    template: `<SqTabs v-model="t"><SqTab value="a" prepend-icon="home">Home</SqTab><SqTab value="b" prepend-icon="search">Search</SqTab><SqTab value="c" disabled>Disabled</SqTab></SqTabs>`,
  }),
}
export const WithWindow: Story = {
  render: () => ({
    setup: () => ({ tab: ref('One') }),
    template: `<SqTabs v-model="tab" :items="['One', 'Two', 'Three']" />
    <SqWindow v-model="tab" class="sq-mt-4"><SqWindowItem v-for="n in ['One', 'Two', 'Three']" :key="n" :value="n"><SqSheet border class="sq-pa-6">Panel {{ n }}</SqSheet></SqWindowItem></SqWindow>`,
  }),
}
