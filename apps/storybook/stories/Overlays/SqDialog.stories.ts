import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqDialog } from '@squirkle-ui/ui'

const meta: Meta<typeof SqDialog> = {
  title: 'Overlays/SqDialog',
  component: SqDialog,
  args: { title: 'Delete project?', closable: true, width: 420, persistent: false, fullscreen: false },
  render: (args) => ({
    setup: () => ({ args, open: ref(false) }),
    template: `<SqDialog v-bind="args" v-model="open">
      <template #activator><SqBtn color="error" variant="tonal">Delete…</SqBtn></template>
      This permanently removes the project and its 1,284 files.
      <template #actions="{ close }"><SqBtn variant="text" color="surface" @click="close">Cancel</SqBtn><SqBtn color="error" @click="close">Delete</SqBtn></template>
    </SqDialog>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
