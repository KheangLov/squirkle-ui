# Decision
Overlays use `SqPortal`, which moves its single layer element to `<body>` after mount, instead of `<Teleport>`.

## Context
Vue 2.7 has no Teleport; the same templates must work in both versions.

## Decision
`packages/ui/src/components/SqPortal.vue`: root `.sq-portal` holds exactly one layer child that is appended to the target on mount and removed on unmount; both are `display: contents`.

## Alternatives
Teleport for Vue 3 + a Vue 2 shim (two code paths).

## Consequences
Never place other nodes next to the layer inside SqPortal's root; theme scope is re-applied to the layer via `sq-theme-scope`.

## Affected Areas
SqMenu, SqTooltip, SqDialog, SqBottomSheet, SqSnackbar, SqOverlay, SqSelect, SqDataGrid menus.
