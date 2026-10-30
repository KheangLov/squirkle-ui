import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqThemeProvider } from '@squirkle-ui/ui'

const meta: Meta<typeof SqThemeProvider> = {
  title: 'Layout/SqThemeProvider',
  component: SqThemeProvider,
  argTypes: { theme: { control: 'inline-radio', options: ['light', 'dark'] } },
  args: { theme: 'dark', withBackground: true },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<SqThemeProvider v-bind="args">
      <div class="sq-pa-4 sq-d-flex sq-gap-2"><SqBtn>Primary</SqBtn><SqBtn variant="tonal">Tonal</SqBtn><SqChip color="success">Online</SqChip></div>
    </SqThemeProvider>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
