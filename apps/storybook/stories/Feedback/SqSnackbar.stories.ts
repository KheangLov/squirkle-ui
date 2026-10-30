import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqSnackbar } from '@squirkle-ui/ui'

const meta: Meta<typeof SqSnackbar> = {
  title: 'Feedback/SqSnackbar',
  component: SqSnackbar,
  args: { text: 'Message archived', showTimer: true, timeout: 5000 },
  render: (args) => ({
    setup: () => ({ args, show: ref(false) }),
    template: `<SqBtn @click="show = true">Show snackbar</SqBtn>
    <SqSnackbar v-bind="args" v-model="show"><template #actions="{ close }"><SqBtn variant="text" color="warning" size="small" @click="close">Undo</SqBtn></template></SqSnackbar>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
