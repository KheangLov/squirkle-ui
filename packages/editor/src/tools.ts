import type { Editor } from '@tiptap/core'

export type EditorTool =
  | 'bold' | 'italic' | 'underline' | 'strike' | 'code'
  | 'h1' | 'h2' | 'h3' | 'bulletList' | 'orderedList' | 'blockquote' | 'codeBlock' | 'hr'
  | 'link' | 'undo' | 'redo'

export interface ToolDef {
  label: string
  icon?: string
  text?: string
  textClass?: string
  /** Toggle tools report aria-pressed. */
  toggle?: boolean
  run: (e: Editor) => boolean
  active?: (e: Editor) => boolean
  can?: (e: Editor) => boolean
}

// Material Icons paths (Apache-2.0), same set as the built-in icons.
const P = {
  bold: 'M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z',
  italic: 'M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z',
  underline: 'M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z',
  strike: 'M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z',
  bulletList: 'M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z',
  orderedList: 'M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z',
  blockquote: 'M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z',
  link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
  undo: 'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z',
  redo: 'M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z',
}

export const ch = (e: Editor) => e.chain().focus()
const heading = (level: 1 | 2 | 3): ToolDef => ({ label: `Heading ${level}`, text: `H${level}`, toggle: true, run: (e) => ch(e).toggleHeading({ level }).run(), active: (e) => e.isActive('heading', { level }) })

export const TOOLS: Record<EditorTool, ToolDef> = {
  bold: { label: 'Bold', icon: P.bold, toggle: true, run: (e) => ch(e).toggleBold().run(), active: (e) => e.isActive('bold') },
  italic: { label: 'Italic', icon: P.italic, toggle: true, run: (e) => ch(e).toggleItalic().run(), active: (e) => e.isActive('italic') },
  underline: { label: 'Underline', icon: P.underline, toggle: true, run: (e) => ch(e).toggleUnderline().run(), active: (e) => e.isActive('underline') },
  strike: { label: 'Strikethrough', icon: P.strike, toggle: true, run: (e) => ch(e).toggleStrike().run(), active: (e) => e.isActive('strike') },
  code: { label: 'Inline code', icon: 'code', toggle: true, run: (e) => ch(e).toggleCode().run(), active: (e) => e.isActive('code') },
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  bulletList: { label: 'Bullet list', icon: P.bulletList, toggle: true, run: (e) => ch(e).toggleBulletList().run(), active: (e) => e.isActive('bulletList') },
  orderedList: { label: 'Numbered list', icon: P.orderedList, toggle: true, run: (e) => ch(e).toggleOrderedList().run(), active: (e) => e.isActive('orderedList') },
  blockquote: { label: 'Quote', icon: P.blockquote, toggle: true, run: (e) => ch(e).toggleBlockquote().run(), active: (e) => e.isActive('blockquote') },
  codeBlock: { label: 'Code block', text: '{ }', textClass: 'sq-editor__mono', toggle: true, run: (e) => ch(e).toggleCodeBlock().run(), active: (e) => e.isActive('codeBlock') },
  hr: { label: 'Divider', icon: 'minus', run: (e) => ch(e).setHorizontalRule().run() },
  // The link tool opens the URL popover (handled in the component).
  link: { label: 'Link', icon: P.link, toggle: true, run: () => true, active: (e) => e.isActive('link') },
  undo: { label: 'Undo', icon: P.undo, run: (e) => ch(e).undo().run(), can: (e) => e.can().undo() },
  redo: { label: 'Redo', icon: P.redo, run: (e) => ch(e).redo().run(), can: (e) => e.can().redo() },
}

export const DEFAULT_TOOLBAR: EditorTool[][] = [
  ['bold', 'italic', 'underline', 'strike', 'code'],
  ['h1', 'h2', 'h3'],
  ['bulletList', 'orderedList', 'blockquote', 'codeBlock', 'hr'],
  ['link'],
  ['undo', 'redo'],
]
