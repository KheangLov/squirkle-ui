import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { SqAutocomplete, SqBreadcrumbs, SqBtn, SqCard, SqDateTimePicker, SqListItem, SqNumberInput, SqSelect, SqTextarea, SqTextField, addIcons, builtinIcons, config, resolveIcon } from '../src'

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

describe('field aria-label', () => {
  const cases = [
    ['SqTextField', SqTextField, 'input'],
    ['SqTextarea', SqTextarea, 'textarea'],
    ['SqNumberInput', SqNumberInput, 'input'],
    ['SqSelect', SqSelect, 'input[role="combobox"]'],
    ['SqAutocomplete', SqAutocomplete, 'input[role="combobox"]'],
  ] as const
  for (const [name, comp, control] of cases) {
    it(`${name} names its focusable control, not the wrapper`, () => {
      const w = mount(comp, { attrs: { 'aria-label': 'Map style', 'aria-labelledby': 'heading' } })
      expect(w.find(control).attributes('aria-label')).toBe('Map style')
      expect(w.find(control).attributes('aria-labelledby')).toBe('heading')
      expect(w.attributes('aria-label')).toBeUndefined()
    })
  }
})

describe('resolveIcon', () => {
  it('lets an alias replace a built-in name, bare or with $', () => {
    addIcons({ 'test:x': { body: '<path d="M0 0h1"/>' } })
    config.icons.aliases.close = 'test:x'
    try {
      expect(resolveIcon('close')).toMatchObject({ kind: 'svg', data: { body: '<path d="M0 0h1"/>' } })
      expect(resolveIcon('$close')).toMatchObject({ kind: 'svg' })
      expect(resolveIcon('search')).toEqual({ kind: 'path', d: builtinIcons.search })
    } finally {
      delete config.icons.aliases.close
    }
    expect(resolveIcon('close')).toEqual({ kind: 'path', d: builtinIcons.close })
  })
})

// Stands in for vue-router's RouterLink: renders <a> with the href it resolves from `to`. Like the real
// one, it leaves fallthrough attrs on that <a>, so a parent binding `href: undefined` would erase it.
const RouterLinkStub = defineComponent({
  name: 'RouterLink',
  props: { to: { type: [String, Object], required: true } },
  setup(props, { slots }) {
    return () => h('a', { href: typeof props.to === 'string' ? props.to : '/resolved' }, slots.default?.())
  },
})
const withRouter = { global: { components: { 'router-link': RouterLinkStub } } }

describe('router links keep their href', () => {
  const cases = [
    ['SqBtn', SqBtn],
    ['SqCard', SqCard],
    ['SqListItem', SqListItem],
  ] as const
  for (const [name, component] of cases) {
    it(`${name} with to renders the router's href`, () => {
      const w = mount(component, { props: { to: '/courses' }, ...withRouter })
      expect(w.element.tagName).toBe('A')
      expect(w.attributes('href')).toBe('/courses')
    })
    it(`${name} with href renders a plain link`, () => {
      const w = mount(component, { props: { href: 'https://example.com' }, ...withRouter })
      expect(w.element.tagName).toBe('A')
      expect(w.attributes('href')).toBe('https://example.com')
    })
    it(`${name} without to or href has no href`, () => {
      const w = mount(component, withRouter)
      expect(w.attributes('href')).toBeUndefined()
    })
  }
  it('SqBreadcrumbs gives each item the right href', () => {
    const items = [{ title: 'Home', to: '/' }, { title: 'Docs', href: '/docs' }, { title: 'Here' }]
    const w = mount(SqBreadcrumbs, { props: { items }, ...withRouter })
    const links = w.findAll('.sq-breadcrumbs__link')
    expect(links.map((link) => link.attributes('href'))).toEqual(['/', '/docs', undefined])
  })
})
