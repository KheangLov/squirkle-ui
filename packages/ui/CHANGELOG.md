# @squirkle-ui/ui

## 0.2.0

### Minor Changes

- b73919e: Export `./package.json`; the `vue` peer is now `^2.7.16 || ^3.5.0`, the versions that are built and tested.

### Patch Changes

- c836a1e: Explicit export lists in core, calendar and datagrid (no API change), plus a documented public API and semver policy in the READMEs.
- e3369a9: Router links keep their `href` on Vue 3: `SqBtn`, `SqCard`, `SqListItem` and `SqBreadcrumbs` no longer bind `href: undefined` onto `router-link`, which erased the href RouterLink computed, so those links weren't keyboard-focusable and couldn't be opened in a new tab.
- Updated dependencies [c836a1e]
- Updated dependencies [b73919e]
  - @squirkle-ui/core@0.2.0
