import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Every exported component must appear in Storybook as a story `component` or a `subcomponents` entry.
// Names come from each package's `componentNames` source (read as text, so ui tests import no add-on).
const root = join(__dirname, '../../..')
const storiesDir = join(root, 'apps/storybook/stories')
const packages = ['ui/src/components', 'calendar/src', 'charts/src', 'datagrid/src', 'editor/src', 'icons/src', 'map/src', 'swiper/src']

function exportedComponents(): string[] {
  return packages.flatMap((dir) => {
    const src = readFileSync(join(root, 'packages', dir, 'index.ts'), 'utf8')
    const list = src.match(/export const componentNames = (\[[^\]]*\])/)
    if (!list) throw new Error(`no componentNames in packages/${dir}/index.ts`)
    return [...list[1].matchAll(/['"](Sq\w+)['"]/g)].map((m) => m[1])
  })
}

function storyFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? storyFiles(join(dir, e.name)) : e.name.endsWith('.stories.ts') ? [join(dir, e.name)] : [],
  )
}

function documented(): Set<string> {
  const names = new Set<string>()
  for (const file of storyFiles(storiesDir)) {
    const src = readFileSync(file, 'utf8')
    for (const m of src.matchAll(/^\s+component: (\w+),$/gm)) names.add(m[1])
    for (const m of src.matchAll(/^\s+subcomponents: \{ ([\w, ]+) \},$/gm)) m[1].split(', ').forEach((n) => names.add(n))
  }
  return names
}

describe('Storybook coverage', () => {
  it('has a story for every exported component', () => {
    const covered = documented()
    const all = exportedComponents()
    expect(all.length).toBeGreaterThan(90)
    const missing = all.filter((n) => !covered.has(n))
    expect(missing).toEqual([])
  })
})
