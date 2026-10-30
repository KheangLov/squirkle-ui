import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { SqShape } from '@squirkle-ui/ui'

const meta: Meta<typeof SqShape> = {
  title: 'Utilities/SqShape',
  component: SqShape,
  args: { clip: false },
  render: (args) => ({
    setup: () => ({ args, r: ref(36), s: ref(0.6) }),
    template: `<div class="sq-surface" :style="{ '--sq-r': r + 'px', '--sq-smoothing': s, '--sq-bg': 'var(--sq-primary)', '--sq-shadow-filter': 'var(--sq-elevation-3-filter)', width: '180px', height: '120px' }"><SqShape v-bind="args" :watch-key="r" /></div>
    <SqSlider v-model="r" :min="0" :max="60" label="Radius" thumb-label class="sq-mt-4" /><SqSlider v-model="s" :min="0" :max="1" :step="0.05" label="Smoothing" thumb-label />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
