import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { SqDateTimePicker, SqSelect } from '../src'

describe('SqSelect', () => {
  it('shows the placeholder when nothing is selected (non-searchable)', () => {
    const w = mount(SqSelect, { props: { items: [{ title: 'Geist', value: '' }, { title: 'Inter', value: 'inter' }], modelValue: '', placeholder: 'Pick a font' } })
    expect(w.find('.sq-select__placeholder').text()).toBe('Pick a font')
  })
  it('hides the placeholder once a value is selected', () => {
    const w = mount(SqSelect, { props: { items: [{ title: 'Inter', value: 'inter' }], modelValue: 'inter', placeholder: 'Pick a font' } })
    expect(w.find('.sq-select__placeholder').exists()).toBe(false)
    expect(w.find('.sq-select__selection--single').text()).toBe('Inter')
  })
})

describe('SqDateTimePicker', () => {
  it('keeps the time when the date changes and the date when the time changes', async () => {
    const w = mount(SqDateTimePicker, { props: { modelValue: '2026-10-25T14:30' } })
    const date = w.findComponent({ name: 'SqDatePicker' })
    const time = w.findComponent({ name: 'SqTimePicker' })
    expect(date.props('modelValue')).toBe('2026-10-25')
    expect(time.props('modelValue')).toBe('14:30')
    date.vm.$emit('update:modelValue', '2026-11-02')
    time.vm.$emit('update:modelValue', '09:15')
    expect(w.emitted('update:modelValue')).toEqual([['2026-11-02T14:30'], ['2026-11-02T09:15']])
  })
  it('defaults the time to midnight when only a date is picked', () => {
    const w = mount(SqDateTimePicker)
    w.findComponent({ name: 'SqDatePicker' }).vm.$emit('update:modelValue', '2026-01-05')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['2026-01-05T00:00'])
  })
})
