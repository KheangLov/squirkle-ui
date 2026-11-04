// @vitest-environment node
import { createRequire } from 'node:module'
import { describe, expect, it, vi } from 'vitest'
import * as components from '../../ui/src/components'

const squirkleNuxt2 = createRequire(import.meta.url)('../src/nuxt2.cjs')

function run(moduleOptions?: Record<string, unknown>) {
  const ctx = { options: { css: [] as string[], build: { transpile: [] as unknown[] }, rootDir: process.cwd() }, addPlugin: vi.fn(), extendBuild: vi.fn() }
  squirkleNuxt2.call(ctx, moduleOptions)
  return { ctx, plugin: ctx.addPlugin.mock.calls[0]?.[0].options }
}

describe('Nuxt 2 module', () => {
  it('defaults the prefix to Sq', () => {
    expect(run().plugin.prefix).toBe('Sq')
  })
  it('passes a custom prefix to the plugin', () => {
    expect(run({ prefix: 'X' }).plugin.prefix).toBe('X')
  })
  it.each(['x-y', '', '1a', 'a"b'])('rejects the prefix %j', (prefix) => {
    expect(() => run({ prefix })).toThrow(`[squirkle] prefix must match /^[A-Za-z][A-Za-z0-9]*$/, got ${JSON.stringify(prefix)}`)
  })
  it('keeps known add-ons and adds their stylesheets', () => {
    const { ctx, plugin } = run({ addons: ['charts', 'bogus'] })
    expect(plugin.addons).toEqual(['charts'])
    expect(ctx.options.css).toEqual(['@squirkle-ui/ui/styles.css', '@squirkle-ui/charts/styles.css'])
  })
  it('registers the same ui components as createSquirkle does by default', () => {
    const exported = Object.keys(components).filter((name) => name !== 'componentNames')
    expect([...components.componentNames].sort()).toEqual(exported.sort())
  })
})
