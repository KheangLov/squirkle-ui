import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SqSwiper } from '@squirkle-ui/swiper'

const colors = ['#5b5bd6', '#e5484d', '#1f9d63', '#e8920c', '#0bb5c4', '#7c5cff']
const slides = colors.map((c, i) => ({ id: i, color: c, title: `Slide ${i + 1}` }))

const meta: Meta<typeof SqSwiper> = {
  title: 'Add-ons/SqSwiper',
  component: SqSwiper,
  argTypes: {
    effect: { control: 'select', options: ['slide', 'fade', 'coverflow', 'cards'] },
    pagination: { control: 'select', options: ['dots', 'fraction', 'progress', false] },
  },
  args: { items: slides, itemKey: 'id', effect: 'slide', loop: true, centered: false, slidesPerView: 1, spaceBetween: 16, autoplay: 0, height: 280, pagination: 'dots' },
  render: (args) => ({
    components: { SqSwiper },
    setup: () => ({ args }),
    template: `<SqSwiper v-bind="args"><template #default="{ item }">
      <div :style="{ background: item.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, borderRadius: 'inherit' }">{{ item.title }}</div>
    </template></SqSwiper>`,
  }),
}
export default meta
type Story = StoryObj<typeof meta>

export const Loop: Story = {}
export const SlidesPerView: Story = { args: { slidesPerView: 2.5, loop: false, pagination: 'progress', height: 200 } }
export const Coverflow: Story = { args: { effect: 'coverflow', pagination: 'fraction' } }
