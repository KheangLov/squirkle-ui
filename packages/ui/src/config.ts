import { reactive, version } from 'vue'
import { appearanceCss, createThemeCss, defaultThemes, isBrowser, mergeThemes, type Appearance, type ThemeDefinition, type ThemeMap } from '@squirkle-ui/core'

export const isVue2 = version.startsWith('2.')

/** How squircles are drawn. `auto` = native CSS `corner-shape` when supported, otherwise SVG. */
export type SquircleMode = 'auto' | 'native' | 'svg' | 'css'

export interface LocaleMessages {
  close: string
  clear: string
  loading: string
  noData: string
  noResults: string
  search: string
  selectAll: string
  today: string
  previous: string
  next: string
  rowsPerPage: string
  /** `{0}`–`{1}` of `{2}` */
  pageRange: string
  required: string
}

export interface SquirkleOptions {
  theme?: {
    defaultTheme?: string
    themes?: Record<string, Partial<ThemeDefinition>>
    /** Apply the theme class to <html> so overlays inherit it (default true). */
    global?: boolean
  }
  squircle?: { mode?: SquircleMode; smoothing?: number }
  /** Font, radius scale and corner smoothing, written as CSS variables on :root. */
  appearance?: Appearance
  icons?: {
    /** Alias map, e.g. { home: 'mdi:home' } so `<SqIcon icon="$home">` works. */
    aliases?: Record<string, string>
    /** Iconify API host; `false` disables network loading (offline: use addIcons). */
    api?: string | false
  }
  locale?: { code?: string; messages?: Partial<LocaleMessages> }
}

const enMessages: LocaleMessages = {
  close: 'Close',
  clear: 'Clear',
  loading: 'Loading…',
  noData: 'No data available',
  noResults: 'No results found',
  search: 'Search',
  selectAll: 'Select all',
  today: 'Today',
  previous: 'Previous',
  next: 'Next',
  rowsPerPage: 'Rows per page',
  pageRange: '{0}–{1} of {2}',
  required: 'This field is required',
}

/**
 * App-wide configuration. It is module-level by design (one Squirkle install per app);
 * it only holds static options and the active theme name, never per-request data.
 */
export const config = reactive({
  theme: { name: 'light', defaultTheme: 'light', themes: defaultThemes as ThemeMap, global: true },
  squircle: { mode: 'auto' as SquircleMode, smoothing: 0.6 },
  // Every key exists up front so assignments stay reactive in Vue 2.
  appearance: { font: undefined as string | undefined, fontMono: undefined as string | undefined, radiusScale: undefined as number | undefined, smoothing: undefined as number | undefined },
  icons: { aliases: {} as Record<string, string>, api: 'https://api.iconify.design' as string | false },
  locale: { code: 'en-US', messages: { ...enMessages } as LocaleMessages },
})

export function applyOptions(opts: SquirkleOptions = {}) {
  if (opts.theme) {
    config.theme.themes = mergeThemes(defaultThemes, opts.theme.themes)
    config.theme.defaultTheme = opts.theme.defaultTheme ?? 'light'
    config.theme.name = config.theme.defaultTheme
    config.theme.global = opts.theme.global ?? true
  }
  if (opts.squircle) Object.assign(config.squircle, opts.squircle)
  if (opts.squircle?.smoothing != null) config.appearance.smoothing = opts.squircle.smoothing
  if (opts.appearance) setAppearance(opts.appearance)
  if (opts.icons?.aliases) Object.assign(config.icons.aliases, opts.icons.aliases)
  if (opts.icons?.api !== undefined) config.icons.api = opts.icons.api
  if (opts.locale?.code) config.locale.code = opts.locale.code
  if (opts.locale?.messages) Object.assign(config.locale.messages, opts.locale.messages)
}

/** Updates appearance settings; `smoothing` also drives the SVG squircle fallback. */
export function setAppearance(a: Partial<Appearance>) {
  for (const k of ['font', 'fontMono', 'radiusScale', 'smoothing'] as const) if (k in a) (config.appearance as Appearance)[k] = a[k] as never
  if (a.smoothing != null) config.squircle.smoothing = a.smoothing
}

/** Theme colors + appearance variables (also used for SSR head injection). */
export const getThemeCss = () => [createThemeCss(config.theme.themes, config.theme.defaultTheme), appearanceCss(config.appearance)].filter(Boolean).join('\n')

/** Writes theme CSS variables into <head> and the active theme class onto <html>. */
export function syncThemeToDocument() {
  if (!isBrowser) return
  let style = document.getElementById('sq-theme-vars') as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = 'sq-theme-vars'
    document.head.prepend(style)
  }
  const css = getThemeCss()
  if (style.textContent !== css) style.textContent = css
  if (config.theme.global) {
    const cl = document.documentElement.classList
    for (const c of Array.from(cl)) if (c.startsWith('sq-theme--')) cl.remove(c)
    cl.add(`sq-theme--${config.theme.name}`)
  }
}

/** Replaces `{0}`, `{1}`… placeholders. */
export const t = (key: keyof LocaleMessages, ...args: (string | number)[]) =>
  config.locale.messages[key].replace(/\{(\d)\}/g, (_, i) => String(args[Number(i)] ?? ''))
