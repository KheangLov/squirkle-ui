# Task: polish batch + DateTime field + editor add-on + Storybook (approved: `go A + B`, 2026-10-25)
Approved prompt + plan: as shown in chat (Task A tier M: README pnpm, drop AG Grid wording, Customize drawer + SqSelect placeholder, SqTimelineItem grid, SqSwiper drag/pointer; Task B tier L: SqDateTimePicker/SqDateTimeField in ui, `@squirkle-ui/editor` on `@tiptap/core`, `apps/storybook` Vue 3 only). Confidence A 88%, B 75%.
Dependencies approved: `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit` (editor package); Storybook `@storybook/vue3-vite` + addons (apps/storybook only).

## Checks (2026-10-25)
- `pnpm test` 47/47 PASS (new: ui components 4, swiper 2, editor 5) · `pnpm typecheck` 0 errors (now incl. apps/storybook) · `pnpm build` 9 packages × Vue 2 + 3 + umbrella PASS · `pnpm build:storybook` PASS · `pnpm build:docs` PASS.
- Docs (Vue 3, :5180): Timeline start + alternate render with full-width bodies PASS; Customize drawer: Mode segmented control full width with the active side raised, hex input at control height, picker area 132 px, Font shows "Geist (default)" PASS; Editor page and DateTimeField ("Oct 25, 2026, 14:30", popup opens) PASS.
- Storybook (:6006): Timeline, Editor (light + dark), DateTimePicker, Select placeholder PASS; editor link flow applies a link and updates v-model PASS (driven by DOM events — real mouse input did not reach the pane).
- Swiper (Storybook, DOM pointer events): drag of > half a slide advances, `pointercancel` clears dragging state, loop wraps backward PASS. Per-frame paint (rAF) and perceived smoothness: NOT VERIFIED — rAF never fired in the browser pane.
- Vue 2.7 playground (:5181, rebuilt dist): SqEditor renders + toolbar italic updates v-model, Select placeholder, DateTimeField display, Timeline layout PASS; no console errors.
- Nuxt 3/4 + Nuxt 2 with the `editor` add-on: NOT RUN.
- Fixed during testing: StarterKit `trailingNode` rewriting v-model on load; link popover input focus; bare-domain links → `https://`; nested surface in link popover; Mode toggle active style (class override lost to SqBtn inline vars); Storybook decorator used SqApp's grid shell (fields shrank).
