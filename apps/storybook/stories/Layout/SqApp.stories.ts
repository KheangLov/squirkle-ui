import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqApp, SqMain } from '@squirkle-ui/ui'

const meta: Meta<typeof SqApp> = {
  title: 'Layout/SqApp',
  component: SqApp,
  subcomponents: { SqMain },
  args: { fullHeight: false },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<div style="height:300px;overflow:hidden;position:relative;border:1px solid var(--sq-border);border-radius:20px">
      <SqApp v-bind="args" style="height:100%">
        <SqAppBar title="Acme"><template #append><SqBtn icon="search" variant="text" color="surface" /></template></SqAppBar>
        <SqNavigationDrawer permanent width="180"><SqList nav :items="['Inbox', 'Starred', 'Archive']" /></SqNavigationDrawer>
        <SqMain padded>Main content</SqMain>
        <SqFooter>© 2026 Acme</SqFooter>
      </SqApp>
    </div>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
