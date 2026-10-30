import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { SqBarChart } from '../src'

describe('chart data table', () => {
  it('clips the screen-reader table through a wrapper (a clipped <table> keeps its full height)', () => {
    const w = mount(SqBarChart, { props: { title: 'Signups', labels: ['A', 'B'], series: [{ name: '2026', data: [1, 2] }] } })
    const table = w.find('table')
    expect(table.exists()).toBe(true)
    expect(table.classes()).not.toContain('sq-sr-only')
    expect(table.element.parentElement?.classList.contains('sq-sr-only')).toBe(true)
    expect(table.find('caption').text()).toBe('Signups')
  })
})
