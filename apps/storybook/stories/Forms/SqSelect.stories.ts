import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqSelect } from '@squirkle-ui/ui'
import { people, fruits } from '../data'

const meta: Meta<typeof SqSelect> = {
  title: 'Forms/SqSelect',
  component: SqSelect,
  args: { label: 'Fruit', items: fruits, multiple: false, chips: false, searchable: false, clearable: true },
  render: (args) => ({
    setup: () => ({ args, v: ref('Mango') }),
    template: `<SqSelect v-bind="args" v-model="v" style="max-width:320px" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Multiple: Story = {
  render: () => ({
    setup: () => ({ many: ref(['Dara Sok']), people }),
    template: `<SqSelect v-model="many" label="Team" :items="people" multiple chips closable-chips style="max-width:360px" />`,
  }),
}
export const Placeholder: Story = {
  render: () => ({
    setup: () => ({ v: ref(''), items: [{ title: 'Geist (default)', value: '' }, { title: 'Inter', value: 'inter' }, { title: 'Manrope', value: 'manrope' }] }),
    template: `<SqSelect v-model="v" :items="items" placeholder="Pick a font" style="max-width:320px" />`,
  }),
}
