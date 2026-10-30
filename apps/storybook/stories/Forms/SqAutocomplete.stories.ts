import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqAutocomplete } from '@squirkle-ui/ui'
import { people } from '../data'

const meta: Meta<typeof SqAutocomplete> = {
  title: 'Forms/SqAutocomplete',
  component: SqAutocomplete,
  render: (args) => ({
    setup: () => ({ args, v: ref(['Cambodia']), countries: ['Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Cuba'] }),
    template: `<SqAutocomplete v-bind="args" v-model="v" label="Country" :items="countries" multiple chips style="max-width:360px" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Virtualized100k: Story = {
  render: () => ({
    setup: () => ({ id: ref<number | undefined>(undefined), big: Array.from({ length: 100_000 }, (_, i) => ({ id: i, name: `${people[i % 8]} ${i}` })) }),
    template: `<SqAutocomplete v-model="id" label="Customer" :items="big" item-title="name" item-value="id" placeholder="Search 100k customers" clearable style="max-width:360px" /><div class="sq-mt-2">Selected id: {{ id }}</div>`,
  }),
}
