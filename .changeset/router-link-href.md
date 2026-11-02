---
"@squirkle-ui/ui": patch
---

Router links keep their `href` on Vue 3: `SqBtn`, `SqCard`, `SqListItem` and `SqBreadcrumbs` no longer bind `href: undefined` onto `router-link`, which erased the href RouterLink computed, so those links weren't keyboard-focusable and couldn't be opened in a new tab.
