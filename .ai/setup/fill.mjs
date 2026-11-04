// Replaces {{KEY}} placeholders from .ai/setup/fill.txt blocks: a line `=== <file> <KEY>`, then the value.
import fs from 'node:fs'
const blocks = fs.readFileSync('.ai/setup/fill.txt', 'utf8').split(/^=== /m).slice(1)
const missed = []
for (const block of blocks) {
  const [head, ...rest] = block.split('\n')
  const [file, key] = head.trim().split(/\s+/)
  const value = rest.join('\n').replace(/\s+$/, '')
  const text = fs.readFileSync(file, 'utf8')
  if (!text.includes(`{{${key}}}`)) missed.push(`${file} ${key}`)
  fs.writeFileSync(file, text.replaceAll(`{{${key}}}`, value))
}
console.log(missed.length ? `not found: ${missed.join(', ')}` : `filled ${blocks.length} placeholders`)
