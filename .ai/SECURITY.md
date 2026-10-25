# SECURITY
Purpose: trust boundaries and sensitive spots for a client-side UI library.
Read when: touching HTML injection, network calls, user data rendering or Nuxt head config.

- **Auth / secrets / env vars**: none in this repo (no `.env*` files, no API keys). UNKNOWN for consumers.
- **HTML injection points (all reviewed)**:
  - `packages/ui/src/components/SqIcon.vue` — `v-html` of Iconify SVG bodies; sources: `addIcons`/`addCollection` data or the Iconify API host in `config.icons.api` (default `https://api.iconify.design`). Apps that cannot trust that host set `icons: { api: false }`.
  - `packages/map/src/markers.ts` — marker/cluster elements built with DOM APIs (`textContent`), shared by both engines; popups are cloned DOM from slots (Vue-escaped).
  - `packages/nuxt/src/module.mjs`, `runtime/nuxt2-plugin.js` — theme CSS injected into `<head>`; generated from app config, not user input (Nuxt 2 disables vue-meta sanitizer for that tag only).
  - `packages/editor/src/SqEditor.vue` — Tiptap renders v-model/pasted HTML through the ProseMirror schema (unknown tags/attributes dropped, tested); Link extension rejects `javascript:` (tested); bare domains are prefixed `https://`. Output HTML is still user content — consumers must sanitize before rendering it with `v-html` elsewhere.
- **Network**: Iconify API (`packages/ui/src/icons.ts`, `packages/icons/src/SqIconPicker.vue`), map tiles (`SqMap` raster `tileUrl`, default OpenStreetMap; vector styles from `basemaps.cartocdn.com` and `tiles.openfreemap.org`, see `MAP_STYLES`). Docs load Google Fonts, Unsplash and pravatar images.
- **Links**: `target="_blank"` links use `rel="noopener noreferrer"` (map attribution).
- **Clipboard**: grid copy uses `navigator.clipboard.writeText`; paste reads the `paste` event only (no clipboard read permission).
- **CSV export**: values are quoted per RFC 4180 (`toCsv` in `engine.ts`); no formula-injection escaping (`=`, `+`, `-`, `@` prefixes) — known gap.
