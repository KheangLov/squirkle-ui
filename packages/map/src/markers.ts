/** DOM builders for markers and cluster bubbles (shared by the vector and raster engines). */
import { colorValue, resolveIcon } from '@squirkle/ui'

export type MarkerShape = 'pin' | 'dot' | 'squircle' | 'avatar'

export interface MapMarker {
  id?: string | number
  lat: number
  lng: number
  title?: string
  popup?: string
  /** Theme color name or CSS color. */
  color?: string
  /** Short text inside the marker (e.g. "3", "$"). */
  label?: string
  /** Built-in or Iconify icon name, e.g. `lucide:coffee`. */
  icon?: string
  /** Image URL for the `avatar` shape. */
  image?: string
  shape?: MarkerShape
  /** Marker size in px (default 30). */
  size?: number
  [key: string]: unknown
}

/** Anchor point used by the engines: pins stand on their tip, other shapes are centred. */
export const markerAnchor = (shape: MarkerShape) => (shape === 'pin' ? 'bottom' : 'center')

function iconNode(icon: string): SVGElement | null {
  const r = resolveIcon(icon)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('aria-hidden', 'true')
  if (r.kind === 'path') {
    svg.setAttribute('viewBox', '0 0 24 24')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', r.d)
    svg.appendChild(path)
    return svg
  }
  if (r.kind === 'svg') {
    svg.setAttribute('viewBox', `0 0 ${r.data.width} ${r.data.height}`)
    // Iconify body: same trust rule as SqIcon (addCollection data or the configured Iconify API host).
    svg.innerHTML = r.data.body
    return svg
  }
  return null
}

/** Builds a marker element with DOM APIs (text is never parsed as HTML). */
export function markerElement(m: MapMarker, defaults: Partial<MapMarker> = {}): HTMLElement {
  const o = { ...defaults, ...m }
  const shape = (o.shape ?? 'pin') as MarkerShape
  const el = document.createElement('div')
  el.className = `sq-map-marker sq-map-marker--${shape}`
  el.style.setProperty('--sq-pin', colorValue(o.color ?? 'primary') ?? 'var(--sq-primary)')
  el.style.setProperty('--sq-pin-size', `${o.size ?? 30}px`)
  el.setAttribute('role', 'button')
  el.setAttribute('tabindex', '0')
  el.setAttribute('aria-label', o.title ?? o.label ?? 'Marker')
  const body = document.createElement('span')
  body.className = 'sq-map-marker__body'
  if (shape === 'avatar' && o.image) {
    const img = document.createElement('img')
    img.src = o.image
    img.alt = ''
    img.loading = 'lazy'
    body.appendChild(img)
  } else if (shape !== 'dot') {
    const icon = o.icon ? iconNode(o.icon) : null
    const content = document.createElement('span')
    content.className = 'sq-map-marker__content'
    if (icon) content.appendChild(icon)
    else if (o.label) content.textContent = String(o.label)
    else content.classList.add('sq-map-marker__content--empty')
    body.appendChild(content)
  }
  el.appendChild(body)
  return el
}

/** Squircle bubble sized by the number of points it holds. */
export function clusterElement(count: number, color?: string): HTMLElement {
  const el = document.createElement('div')
  el.className = 'sq-map-cluster'
  const size = Math.round(34 + Math.min(30, Math.log2(count) * 5))
  el.style.setProperty('--sq-cluster-size', `${size}px`)
  el.style.setProperty('--sq-pin', colorValue(color ?? 'primary') ?? 'var(--sq-primary)')
  el.setAttribute('role', 'button')
  el.setAttribute('tabindex', '0')
  el.setAttribute('aria-label', `${count} places — zoom in`)
  const span = document.createElement('span')
  span.textContent = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : String(count)
  el.appendChild(span)
  return el
}
