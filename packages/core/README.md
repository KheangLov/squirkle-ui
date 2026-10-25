# @squirkle-ui/core

Framework-agnostic core of [Squirkle UI](https://www.npmjs.com/package/squirkle-ui): squircle path math, theme and colour utilities, date helpers. No Vue dependency — every `@squirkle-ui/*` package builds on it.

## Install
```bash
npm i @squirkle-ui/core
```

## Usage
```ts
import { getSquirclePath, createBrandTheme, presetThemes, themePresets, contrastRatio, onColor } from '@squirkle-ui/core'

const d = getSquirclePath({ width: 120, height: 48, radius: 16, smoothing: 0.6 }) // SVG path data
const themes = createBrandTheme('#0bb5c4')  // { light, dark } with readable on-colours (≥ 4.5:1)
const ocean = presetThemes('ocean')         // presets: Object.keys(themePresets)
contrastRatio('#ffffff', '#5b5bd6')          // WCAG contrast ratio
onColor('#5b5bd6')                           // best text colour (white or ink) on a background
```
`getSquirclePath` options: `width`, `height`, `radius` (number or per-corner), `smoothing` (0 = rounded rect, 0.6 ≈ iOS, 1 = max), `preserveSmoothing`, `offset`.

## License
MIT © KheangLov · [Source and issues](https://github.com/KheangLov/squirkle-ui)
