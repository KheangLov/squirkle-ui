import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqInfiniteScroll } from '@squirkle-ui/ui'

function feedDemo() {
  const n = ref(15)
  const loading = ref(false)
  const more = () => {
    loading.value = true
    setTimeout(() => { n.value += 15; loading.value = false }, 500)
  }
  return { n, loading, more }
}

const meta: Meta<typeof SqInfiniteScroll> = {
  title: 'Data/SqInfiniteScroll',
  component: SqInfiniteScroll,
  args: { height: 260, manual: false },
  render: (args) => ({
    setup: () => ({ args, ...feedDemo() }),
    template: `<SqInfiniteScroll v-bind="args" :loading="loading" :has-more="n < 60" @load="more"><div v-for="i in n" :key="i" style="padding:10px 4px;border-bottom:1px solid var(--sq-border)">Item {{ i }}</div><template #end>No more items</template></SqInfiniteScroll>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
