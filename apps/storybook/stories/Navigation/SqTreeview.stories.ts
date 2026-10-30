import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqTreeview } from '@squirkle-ui/ui'

const meta: Meta<typeof SqTreeview> = {
  title: 'Navigation/SqTreeview',
  component: SqTreeview,
  args: { selectable: true, openAll: false, items: [{ title: 'src', value: 'src', icon: 'lucide:folder', children: [{ title: 'components', value: 'c', icon: 'lucide:folder', children: [{ title: 'SqBtn.vue', value: 'vue', icon: 'lucide:file-code' }, { title: 'SqCard.vue', value: 'card', icon: 'lucide:file-code' }] }, { title: 'index.ts', value: 'idx', icon: 'lucide:file' }] }, { title: 'package.json', value: 'pkg', icon: 'lucide:file-json' }] },
  render: (args) => ({
    setup: () => ({ args, q: ref(''), sel: ref(['vue']) }),
    template: `<SqTextField v-model="q" placeholder="Search…" density="compact" prepend-inner-icon="search" hide-details class="sq-mb-2" style="max-width:280px" />
    <SqTreeview v-bind="args" v-model="sel" :search="q" /><code>{{ sel }}</code>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
