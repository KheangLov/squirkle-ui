// Copies Part B files of .ai/setup/PROMPT.md to disk, filtered by tier and flags.
import fs from 'node:fs'
import path from 'node:path'
const [tier = 'standard', ...flags] = process.argv.slice(2)
const rank = { lite: 1, standard: 2, full: 3 }
const on1 = (tag) =>
  tag === 'lite' ? rank[tier] === 1 : tag === 'std' ? rank[tier] >= 2 : tag === 'full' ? rank[tier] >= 3 : flags.includes(tag)
const on = (tags) => tags.split(',').every(on1)
const src = fs.readFileSync('.ai/setup/PROMPT.md', 'utf8').split('\n')
const report = { created: [], existing: [] }
for (let i = 0; i < src.length; i++) {
  const m = src[i].match(/^<!-- FILE: (\S+) \| tier: (lite|standard|full) \| when: (\w+) -->$/)
  if (!m) continue
  const [, file, fileTier, when] = m
  if (src[i + 1] !== '````text') throw new Error(`missing fence after ${file}`)
  const body = []
  let j = i + 2
  while (src[j] !== '````') body.push(src[j++])
  i = j
  if (rank[fileTier] > rank[tier] || (when !== 'always' && !flags.includes(when))) continue
  const lines = body.flatMap((line) => {
    const t = line.match(/ \{((?:lite|std|full|fe|copilot|figma)(?:,(?:lite|std|full|fe|copilot|figma))*)\}$/)
    return !t ? [line] : on(t[1]) ? [line.slice(0, -t[0].length)] : []
  })
  const target = fs.existsSync(file) ? path.join('.ai/setup/kit', file) : file
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, lines.join('\n') + '\n')
  ;(target === file ? report.created : report.existing).push(file)
}
fs.mkdirSync('.ai/tasks', { recursive: true })
console.log(JSON.stringify(report))
