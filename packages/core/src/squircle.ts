/**
 * Squircle geometry. A corner of radius r with smoothing s spans p = (1 + s) · r along each edge, drawn as one of:
 * - `css` (default): the superellipse |x|⁴ + |y|⁴ = 1 that browsers draw for
 *   `border-radius: p; corner-shape: squircle`, so the SVG fallback matches native squircles.
 * - `figma`: Figma's "corner smoothing", following the published derivation (as in the MIT `figma-squircle`
 *   package): a bezier lead-in, a circular arc and a bezier lead-out.
 */

export interface SquircleCorners {
  topLeft?: number
  topRight?: number
  bottomRight?: number
  bottomLeft?: number
}

export type SquircleGeometry = 'css' | 'figma'

export interface SquircleOptions {
  width: number
  height: number
  /** Corner radius in px, or per-corner radii. */
  radius: number | SquircleCorners
  /** Each corner spans (1 + smoothing) · radius. 0.6 ≈ iOS, 1 = maximum; with `figma`, 0 = plain rounded rect. */
  smoothing?: number
  /** `css` (default) matches native `corner-shape: squircle`; `figma` matches Figma's corner smoothing. */
  geometry?: SquircleGeometry
  /** `figma` only: keep smoothing when the corner budget is exceeded (Figma's "preserve smoothing"). */
  preserveSmoothing?: boolean
  /** Shift the path by this offset (used to inset strokes). */
  offset?: number
}

interface CornerParams {
  a: number
  b: number
  c: number
  d: number
  p: number
  arc: number
  r: number
}

const rad = (deg: number) => (deg * Math.PI) / 180
const n = (v: number) => Math.round(v * 1000) / 1000

function cornerParams(radius: number, smoothing: number, preserve: boolean, budget: number): CornerParams {
  let s = smoothing
  let p = (1 + s) * radius
  if (!preserve && radius > 0) {
    s = Math.min(s, budget / radius - 1)
    p = Math.min(p, budget)
  }
  const arcMeasure = 90 * (1 - s)
  const arc = Math.sin(rad(arcMeasure / 2)) * radius * Math.SQRT2
  const alpha = (90 - arcMeasure) / 2
  const p3ToP4 = radius * Math.tan(rad(alpha / 2))
  const beta = 45 * s
  const c = p3ToP4 * Math.cos(rad(beta))
  const d = c * Math.tan(rad(beta))
  let b = (p - arc - c - d) / 3
  let a = 2 * b
  if (preserve && p > budget) {
    const max = budget - d - arc - c
    const minA = max / 6
    b = Math.min(b, max - minA)
    a = max - b
    p = Math.min(p, budget)
  }
  return { a, b, c, d, p, arc, r: radius }
}

function normalizeRadius(radius: SquircleOptions['radius']): Required<SquircleCorners> {
  if (typeof radius === 'number') return { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius }
  return {
    topLeft: radius.topLeft ?? 0,
    topRight: radius.topRight ?? 0,
    bottomRight: radius.bottomRight ?? 0,
    bottomLeft: radius.bottomLeft ?? 0,
  }
}

/** Line segments per `css` corner; enough for a smooth curve at any UI size. */
const CSS_CORNER_STEPS = 24

/** Superellipse corners, sized and scaled down the way CSS sizes `border-radius`. */
function cssSquirclePath(w: number, h: number, radii: Required<SquircleCorners>, smoothing: number, o: number): string {
  const span = (r: number) => Math.max(0, r) * (1 + smoothing)
  const want = [radii.topLeft, radii.topRight, radii.bottomRight, radii.bottomLeft].map(span)
  // When adjacent corners overlap, CSS shrinks every corner by the same factor.
  const f = Math.min(1, w / (want[0] + want[1]), w / (want[3] + want[2]), h / (want[0] + want[3]), h / (want[1] + want[2]))
  const [tl, tr, br, bl] = want.map((p) => p * f)

  // Clockwise quarter of the superellipse around (cx, cy), from angle `from` (screen coords, y down).
  const corner = (cx: number, cy: number, p: number, from: number) => {
    if (!p) return ''
    const root = (v: number) => Math.sign(v) * Math.sqrt(Math.abs(v))
    let out = ''
    for (let i = 1; i <= CSS_CORNER_STEPS; i++) {
      const t = from + (i / CSS_CORNER_STEPS) * (Math.PI / 2)
      out += ` L ${n(cx + p * root(Math.cos(t)))} ${n(cy + p * root(Math.sin(t)))}`
    }
    return out.slice(1)
  }

  return [
    `M ${n(o + w - tr)} ${n(o)}`,
    corner(o + w - tr, o + tr, tr, -Math.PI / 2),
    `L ${n(o + w)} ${n(o + h - br)}`,
    corner(o + w - br, o + h - br, br, 0),
    `L ${n(o + bl)} ${n(o + h)}`,
    corner(o + bl, o + h - bl, bl, Math.PI / 2),
    `L ${n(o)} ${n(o + tl)}`,
    corner(o + tl, o + tl, tl, Math.PI),
    'Z',
  ].filter(Boolean).join(' ')
}

/** Returns an SVG path `d` string describing a squircle of the given size. */
export function getSquirclePath(opts: SquircleOptions): string {
  const { width: w, height: h, smoothing = 0.6, geometry = 'css', preserveSmoothing = true, offset = 0 } = opts
  if (w <= 0 || h <= 0) return ''
  if (geometry === 'css') return cssSquirclePath(w, h, normalizeRadius(opts.radius), smoothing, offset)
  const budget = Math.min(w, h) / 2
  const radii = normalizeRadius(opts.radius)
  const clamp = (r: number) => Math.max(0, Math.min(r, budget))
  const tl = cornerParams(clamp(radii.topLeft), smoothing, preserveSmoothing, budget)
  const tr = cornerParams(clamp(radii.topRight), smoothing, preserveSmoothing, budget)
  const br = cornerParams(clamp(radii.bottomRight), smoothing, preserveSmoothing, budget)
  const bl = cornerParams(clamp(radii.bottomLeft), smoothing, preserveSmoothing, budget)
  const o = offset

  const topRight = ({ a, b, c, d, p, arc, r }: CornerParams) =>
    r ? `c ${n(a)} 0 ${n(a + b)} 0 ${n(a + b + c)} ${n(d)} a ${n(r)} ${n(r)} 0 0 1 ${n(arc)} ${n(arc)} c ${n(d)} ${n(c)} ${n(d)} ${n(b + c)} ${n(d)} ${n(a + b + c)}` : `l ${n(p)} 0`
  const bottomRight = ({ a, b, c, d, p, arc, r }: CornerParams) =>
    r ? `c 0 ${n(a)} 0 ${n(a + b)} ${n(-d)} ${n(a + b + c)} a ${n(r)} ${n(r)} 0 0 1 ${n(-arc)} ${n(arc)} c ${n(-c)} ${n(d)} ${n(-(b + c))} ${n(d)} ${n(-(a + b + c))} ${n(d)}` : `l 0 ${n(p)}`
  const bottomLeft = ({ a, b, c, d, p, arc, r }: CornerParams) =>
    r ? `c ${n(-a)} 0 ${n(-(a + b))} 0 ${n(-(a + b + c))} ${n(-d)} a ${n(r)} ${n(r)} 0 0 1 ${n(-arc)} ${n(-arc)} c ${n(-d)} ${n(-c)} ${n(-d)} ${n(-(b + c))} ${n(-d)} ${n(-(a + b + c))}` : `l ${n(-p)} 0`
  const topLeft = ({ a, b, c, d, p, arc, r }: CornerParams) =>
    r ? `c 0 ${n(-a)} 0 ${n(-(a + b))} ${n(d)} ${n(-(a + b + c))} a ${n(r)} ${n(r)} 0 0 1 ${n(arc)} ${n(-arc)} c ${n(c)} ${n(-d)} ${n(b + c)} ${n(-d)} ${n(a + b + c)} ${n(-d)}` : `l 0 ${n(-p)}`

  return [
    `M ${n(o + w - tr.p)} ${n(o)}`,
    topRight(tr),
    `L ${n(o + w)} ${n(o + h - br.p)}`,
    bottomRight(br),
    `L ${n(o + bl.p)} ${n(o + h)}`,
    bottomLeft(bl),
    `L ${n(o)} ${n(o + tl.p)}`,
    topLeft(tl),
    'Z',
  ].join(' ')
}

/** Path for a stroke of `strokeWidth` drawn fully inside the outer squircle. */
export function getSquircleStrokePath(opts: SquircleOptions & { strokeWidth: number }): string {
  const half = opts.strokeWidth / 2
  const radii = normalizeRadius(opts.radius)
  // `css` corners span r · (1 + s); shrink that span by `half`, as CSS sizes the inner edge of a border.
  const step = (opts.geometry ?? 'css') === 'css' ? half / (1 + (opts.smoothing ?? 0.6)) : half
  const shrink = (r: number) => Math.max(0, r - step)
  return getSquirclePath({
    ...opts,
    width: opts.width - opts.strokeWidth,
    height: opts.height - opts.strokeWidth,
    radius: {
      topLeft: shrink(radii.topLeft),
      topRight: shrink(radii.topRight),
      bottomRight: shrink(radii.bottomRight),
      bottomLeft: shrink(radii.bottomLeft),
    },
    offset: (opts.offset ?? 0) + half,
  })
}

let nativeSupport: boolean | undefined
/** True when the browser renders `corner-shape: squircle` natively (zero-JS squircles). */
export function supportsNativeSquircle(): boolean {
  if (nativeSupport === undefined) {
    nativeSupport = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('corner-shape', 'squircle')
  }
  return nativeSupport
}
