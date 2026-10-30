import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqEditor } from '@squirkle-ui/editor'

const meta: Meta<typeof SqEditor> = {
  title: 'Add-ons/SqEditor',
  component: SqEditor,
  args: { label: 'Notes', placeholder: 'Write something…', readonly: false, disabled: false, error: false, minHeight: 160 },
  render: (args) => ({
    components: { SqEditor },
    setup: () => ({ args, html: ref('<p>Hello <strong>Squirkle</strong> 👋</p><ul><li><p>Lists</p></li><li><p>Links</p></li></ul>') }),
    template: '<div style="max-width:720px"><SqEditor v-bind="args" v-model="html" /><pre style="white-space:pre-wrap;font-size:12px">{{ html }}</pre></div>',
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const CustomToolbar: Story = { args: { toolbar: [['bold', 'italic'], ['bulletList'], ['link']], minHeight: 100 } }
export const ReadOnly: Story = { args: { readonly: true } }
