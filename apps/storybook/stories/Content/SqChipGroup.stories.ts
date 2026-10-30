import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqChipGroup } from '@squirkle-ui/ui'
import { fruits } from '../data'

const meta: Meta<typeof SqChipGroup> = {
  title: 'Content/SqChipGroup',
  component: SqChipGroup,
  args: { multiple: true, column: true, mandatory: false },
  render: (args) => ({
    setup: () => ({ args, tags: ref(['Mango']), fruits }),
    template: `<SqChipGroup v-bind="args" v-model="tags"><SqChip v-for="f in fruits.slice(0, 7)" :key="f" :value="f" filter>{{ f }}</SqChip></SqChipGroup><code>{{ tags }}</code>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
