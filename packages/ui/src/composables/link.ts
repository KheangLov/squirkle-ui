// Bindings for a component that renders `router-link` (with `to`), `<a>` (with `href`) or a plain element.
// Keys are left out instead of bound to `undefined`: in Vue 3 the parent's bindings fall through onto
// RouterLink's `<a>` and win, so `href: undefined` would erase the href RouterLink computed.
export function linkAttrs(to?: string | object, href?: string): { to: string | object } | { href: string } | Record<string, never> {
  if (to) return { to }
  if (href) return { href }
  return {}
}
