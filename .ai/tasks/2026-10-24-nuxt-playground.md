# Task: Nuxt playground + @squirkle/nuxt verification
Approved by the user in chat: "Yes — add a Nuxt playground app and verify the @squirkle/nuxt module (you can install nuxt)."

## Plan
1. Create `apps/playground-nuxt` (Nuxt 4.6.2) using `@squirkle/nuxt` with all add-ons.
2. Install dependencies (lockfile change — approved above).
3. `nuxt build`, then check SSR HTML: components rendered, theme CSS in head, `sq-theme--light` on <html>.
4. Open in the browser: hydration without errors, v-model, dialog, grid selection, theme toggle.
5. Fix module defects found; update `.ai/` (PROJECT, FEATURES, TESTING, STRUCTURE).

## Checks
- Nuxt 4.6.2 dev + prod build: PASS; `/` and `/grid` return 200, server log clean.
- SSR HTML: components rendered, theme CSS in head, `<html class="sq-theme--light">`, map client-only.
- Fixed: SqCalendar setInterval in setup (SSR 500), hydration id mismatch (`useUid`), label/input id link (`id` prop), SSR side effects in SqDialog, SqSnackbar, SqIconPicker, SqDataGrid datasource.
- Hydration: v-model, dialog, theme toggle, grid selection/virtual scroll/totals verified in browser. Nuxt 2 module: NOT RUN.
