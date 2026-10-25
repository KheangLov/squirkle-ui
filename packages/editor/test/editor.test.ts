import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { SqEditor } from '../src'

const mountEditor = (props: Record<string, unknown>) => mount(SqEditor, { props, attachTo: document.body })

describe('SqEditor', () => {
  it('renders v-model HTML and drops markup outside the schema', async () => {
    const w = mountEditor({ modelValue: '<p>Hi <strong>there</strong><script>alert(1)</script><img src=x onerror="alert(1)"></p>' })
    await nextTick()
    const prose = w.find('.sq-editor__prose')
    expect(prose.html()).toContain('<strong>there</strong>')
    expect(prose.html()).not.toContain('script')
    expect(prose.html()).not.toContain('onerror')
    w.unmount()
  })
  it('emits HTML when a toolbar command changes the document', async () => {
    const w = mountEditor({ modelValue: '<p>Hello</p>' })
    await nextTick()
    ;(w.vm as unknown as { getEditor: () => { commands: { selectAll: () => void } } }).getEditor().commands.selectAll()
    await w.find('button[aria-label="Bold"]').trigger('click')
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['<p><strong>Hello</strong></p>'])
    expect(w.find('button[aria-label="Bold"]').attributes('aria-pressed')).toBe('true')
    w.unmount()
  })
  it('refuses javascript: links', async () => {
    const w = mountEditor({ modelValue: '<p><a href="javascript:alert(1)">x</a></p>' })
    await nextTick()
    expect(w.find('.sq-editor__prose').html()).not.toContain('javascript:')
    w.unmount()
  })
  it('updates content from v-model without echoing an update', async () => {
    const w = mountEditor({ modelValue: '<p>a</p>' })
    await nextTick()
    await w.setProps({ modelValue: '<p>b</p>' })
    expect(w.find('.sq-editor__prose').text()).toBe('b')
    expect(w.emitted('update:modelValue')).toBeUndefined()
    w.unmount()
  })
  it('hides the toolbar when readonly', async () => {
    const w = mountEditor({ modelValue: '<p>a</p>', readonly: true })
    await nextTick()
    expect(w.find('.sq-editor__toolbar').exists()).toBe(false)
    expect(w.find('.sq-editor__prose').attributes('contenteditable')).toBe('false')
    w.unmount()
  })
})
