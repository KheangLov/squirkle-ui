# Decision
Render squircles natively with CSS `corner-shape: squircle` when supported, otherwise with a measured SVG painter (`SqShape`), with a plain-radius tier for dense elements.

## Context
Native `corner-shape` is not available in every browser; clip-path alone clips borders and shadows.

## Decision
Surfaces express paint through `--sq-bg/--sq-bd/--sq-bw/--sq-r/--sq-shadow(-filter)`. `SqShape` (SVG fill + inset stroke + drop-shadow filter) activates only when `config.squircle.mode` is `svg`, or `auto` without native support.

## Alternatives
- CSS Houdini paint worklet: Chromium-only, same coverage as native.
- clip-path on every surface: loses shadows and outer borders.

## Consequences
One ResizeObserver per surface in SVG mode; content clipping only with `<SqShape clip>`; dense elements use `.sq-squircle`.

## Affected Areas
`packages/core/src/squircle.ts`, `packages/ui/src/components/SqShape.vue`, `packages/ui/src/styles/base.css`, every surface component.
