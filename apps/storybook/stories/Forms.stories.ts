import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqColorPicker, SqDateField, SqDateTimeField, SqDateTimePicker, SqSelect, SqTextField } from '@squirkle-ui/ui'

const meta: Meta = { title: 'Forms/Fields' }
export default meta
type Story = StoryObj

export const TextField: Story = {
  render: () => ({ components: { SqTextField }, setup: () => ({ v: ref('') }), template: '<div style="max-width:320px"><SqTextField v-model="v" label="Name" placeholder="Ada Lovelace" clearable /></div>' }),
}
export const Select: Story = {
  render: () => ({
    components: { SqSelect },
    setup: () => ({ v: ref(''), items: [{ title: 'Geist (default)', value: '' }, { title: 'Inter', value: 'inter' }, { title: 'Manrope', value: 'manrope' }] }),
    template: '<div style="max-width:320px"><SqSelect v-model="v" :items="items" placeholder="Pick a font" /></div>',
  }),
}
export const DateField: Story = {
  render: () => ({ components: { SqDateField }, setup: () => ({ v: ref('') }), template: '<div style="max-width:320px"><SqDateField v-model="v" label="Due date" clearable /></div>' }),
}
export const DateTimeField: Story = {
  render: () => ({ components: { SqDateTimeField }, setup: () => ({ v: ref('2026-10-25T14:30') }), template: '<div style="max-width:320px"><SqDateTimeField v-model="v" label="Meeting" clearable /><p>{{ v }}</p></div>' }),
}
export const DateTimePicker: Story = {
  render: () => ({ components: { SqDateTimePicker }, setup: () => ({ v: ref('2026-10-25T09:00') }), template: '<SqDateTimePicker v-model="v" /><p>{{ v }}</p>' }),
}
export const ColorPicker: Story = {
  render: () => ({ components: { SqColorPicker }, setup: () => ({ v: ref('#5b5bd6') }), template: '<SqColorPicker v-model="v" /><p>{{ v }}</p>' }),
}
