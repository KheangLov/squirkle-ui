/**
 * Squircle geometry — Figma-compatible "corner smoothing".
 * Math follows the published Figma squircle derivation (as in the MIT `figma-squircle` package):
 * a corner of radius r with smoothing s spans p = (1 + s) · r along each edge and is built from
 * a bezier lead-in, a circular arc and a bezier lead-out.
 */

export interface SquircleCorners {
  topLeft?: number
  topRight?: number
  bottomRight?: number
  bottomLeft?: number
}

export interface SquircleOptions {
  width: number
  height: number
  /** Corner radius in px, or per-corner radii. */
  radius: number | SquircleCorners
  /** 0 = plain rounded rect, 0.6 ≈ iOS, 1 = maximum smoothing. */
  smoothing?: number
  /** Keep smoothing when the corner budget is exceeded (Figma's "preserve smoothing"). */
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

/** Returns an SVG path `d` string describing a squircle of the given size. */
export function getSquirclePath(opts: SquircleOptions): string {
  const { width: w, height: h, smoothing = 0.6, preserveSmoothing = true, offset = 0 } = opts
  if (w <= 0 || h <= 0) return ''
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
  const shrink = (r: number) => Math.max(0, r - half)
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
