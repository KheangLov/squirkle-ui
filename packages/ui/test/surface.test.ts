import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { SqBtn, SqTextField } from '../src'

// Real base.css (the nested-surface reset lives there) + a panel that sets its shadow by class, like SqNavigationDrawer / SqDialog.
const style = document.createElement('style')
beforeAll(() => {
  style.textContent = readFileSync(join(__dirname, '../src/styles/base.css'), 'utf8') + '\n.panel { --sq-shadow: 0 8px 20px black; }'
  document.head.appendChild(style)
})
afterAll(() => style.remove())

const shadowOf = (el: Element) => getComputedStyle(el).getPropertyValue('--sq-shadow').trim()

describe('nested surfaces', () => {
  it("don't inherit the container's elevation, but keep their own", () => {
    const w = mount(() => h('div', { class: 'panel sq-surface' }, [h(SqTextField, { label: 'Name' }), h(SqBtn, { variant: 'elevated' }, () => 'Save')]), { attachTo: document.body })
    expect(shadowOf(w.find('.panel').element)).toBe('0 8px 20px black')
    expect(shadowOf(w.find('.sq-field__control').element)).toBe('none')
    // Own elevation is inline on the button, which always beats the zero-specificity reset.
    expect((w.find('.sq-btn').element as HTMLElement).style.getPropertyValue('--sq-shadow')).toBe('var(--sq-elevation-2)')
    w.unmount()
  })
})
