import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqMap } from '@squirkle-ui/map'
import { places, manyPoints } from '../data'

const meta: Meta<typeof SqMap> = {
  title: 'Add-ons/SqMap',
  component: SqMap,
  argTypes: { engine: { control: 'inline-radio', options: ['vector', 'raster'] } },
  args: { markers: places, fitMarkers: true, height: 420, engine: 'vector' },
  render: (args) => ({
    components: { SqMap },
    setup: () => ({ args }),
    template: `<SqMap v-bind="args" />`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Cluster: Story = {
  render: () => ({
    components: { SqMap },
    setup: () => ({ many: manyPoints(2000) }),
    template: `<SqMap :markers="many" cluster :zoom="11" :height="420" :marker-defaults="{ shape: 'dot', color: 'secondary' }" />`,
  }),
}
