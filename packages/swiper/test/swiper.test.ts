import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { SqSwiper } from '../src'

const pointer = (type: string, x: number) => new PointerEvent(type, { pointerId: 1, button: 0, clientX: x, bubbles: true })
const mountSwiper = (onClick = () => {}) =>
  mount(SqSwiper, { props: { items: [1, 2, 3], navigation: false }, slots: { default: () => h('div', { class: 'slide-body', onClick }, 'x') }, attachTo: document.body })

describe('SqSwiper drag', () => {
  it('resets the drag when the browser cancels the pointer (e.g. vertical scroll)', async () => {
    const w = mountSwiper()
    const track = w.find('.sq-swiper__track').element
    track.querySelector('.slide-body')!.dispatchEvent(pointer('pointerdown', 200))
    await w.vm.$nextTick()
    expect(w.classes()).toContain('sq-swiper--dragging')
    track.dispatchEvent(pointer('pointercancel', 200))
    await w.vm.$nextTick()
    expect(w.classes()).not.toContain('sq-swiper--dragging')
    w.unmount()
  })
  it('does not click slide content at the end of a drag, but does on a plain click', async () => {
    const onClick = vi.fn()
    const w = mountSwiper(onClick)
    const track = w.find('.sq-swiper__track').element
    const body = track.querySelector('.slide-body') as HTMLElement
    body.dispatchEvent(pointer('pointerdown', 200))
    track.dispatchEvent(pointer('pointermove', 120))
    track.dispatchEvent(pointer('pointerup', 120))
    body.click()
    expect(onClick).not.toHaveBeenCalled()
    body.dispatchEvent(pointer('pointerdown', 200))
    track.dispatchEvent(pointer('pointerup', 200))
    body.click()
    expect(onClick).toHaveBeenCalledTimes(1)
    w.unmount()
  })
})
