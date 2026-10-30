import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqBottomSheet } from '@squirkle-ui/ui'

const meta: Meta<typeof SqBottomSheet> = {
  title: 'Overlays/SqBottomSheet',
  component: SqBottomSheet,
  render: (args) => ({
    setup: () => ({ args, open: ref(false) }),
    template: `<SqBtn variant="tonal" @click="open = true">Share</SqBtn><SqBottomSheet v-bind="args" v-model="open" title="Share to"><SqList nav :items="[{ title: 'Copy link', prependIcon: 'copy' }, { title: 'Email', prependIcon: 'lucide:mail' }]" /></SqBottomSheet>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
