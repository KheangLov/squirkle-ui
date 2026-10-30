import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqNavigationDrawer } from '@squirkle-ui/ui'

const meta: Meta<typeof SqNavigationDrawer> = {
  title: 'Layout/SqNavigationDrawer',
  component: SqNavigationDrawer,
  argTypes: { location: { control: 'inline-radio', options: ['start', 'end'] } },
  args: { temporary: true, rail: false, floating: false, location: 'start' },
  render: (args) => ({
    setup: () => ({ args, open: ref(false) }),
    template: `<SqBtn @click="open = !open">Toggle drawer</SqBtn>
    <SqNavigationDrawer v-bind="args" v-model="open">
      <SqList nav :items="[{ title: 'Home', prependIcon: 'home' }, { title: 'Calendar', prependIcon: 'calendar' }]" />
    </SqNavigationDrawer>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
