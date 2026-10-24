import { computed, reactive, ref, type Component } from 'vue'
import * as ui from '@squirkle/ui'
import { SqDataGrid } from '@squirkle/datagrid'
import { SqSwiper } from '@squirkle/swiper'
import { SqCalendar } from '@squirkle/calendar'
import { SqMap } from '@squirkle/map'
import { SqLineChart, SqBarChart, SqDonutChart, SqSparkline } from '@squirkle/charts'
import { SqIconPicker } from '@squirkle/icons'

export interface Example {
  title: string
  /** Template compiled at runtime; it is also the code shown to readers. */
  code: string
  setup?: () => Record<string, unknown>
}
export interface DocEntry {
  name: string
  slug: string
  category: string
  description: string
  component: Component
  examples: Example[]
  /** Separate add-on package name, when not in @squirkle/ui. */
  pkg?: string
  /** Dedicated showcase route instead of the generic page. */
  route?: string
}

const C = ui as unknown as Record<string, Component>
const slug = (n: string) => n.replace(/^Sq/, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
const entries: DocEntry[] = []
function doc(name: string, category: string, description: string, examples: Example[], extra: Partial<DocEntry> = {}) {
  entries.push({ name, slug: slug(name), category, description, component: extra.component ?? C[name], examples, ...extra })
}

const people = ['Alice Johnson', 'Bob Smith', 'Chen Wei', 'Dara Sok', 'Eva Müller', 'Farah Khan', 'Gus Lee', 'Hana Ito']
const fruits = ['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry', 'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon', 'Mango']

/* ───────── Layout ───────── */
doc('SqApp', 'Layout', 'Application root: grid areas for app bar, navigation drawers, main and footer. Applies the theme class.', [
  { title: 'Application shell', code: `<SqThemeProvider theme="light" with-background>
  <div style="height:260px;overflow:hidden;position:relative;border:1px solid var(--sq-border);border-radius:20px">
    <SqApp :full-height="false" style="height:100%">
      <SqAppBar title="Acme"><template #append><SqBtn icon="search" variant="text" color="surface" /></template></SqAppBar>
      <SqNavigationDrawer permanent width="180"><SqList nav :items="['Inbox','Starred','Archive']" /></SqNavigationDrawer>
      <SqMain padded>Main content</SqMain>
    </SqApp>
  </div>
</SqThemeProvider>` },
])
doc('SqAppBar', 'Layout', 'Sticky top bar with blur; `floating` detaches it as a squircle card.', [
  { title: 'Floating', code: `<SqAppBar title="Dashboard" floating style="position:relative">
  <template #prepend><SqBtn icon="menu" variant="text" color="surface" /></template>
  <template #append><SqAvatar name="Dara Sok" size="small" /></template>
</SqAppBar>` },
])
doc('SqNavigationDrawer', 'Layout', 'Side navigation. Permanent on desktop, temporary overlay on mobile; `rail` collapses to icons.', [
  { title: 'Temporary drawer', code: `<SqBtn @click="open = !open">Toggle drawer</SqBtn>
<SqNavigationDrawer v-model="open" temporary>
  <SqList nav :items="[{ title: 'Home', prependIcon: 'home' }, { title: 'Calendar', prependIcon: 'calendar' }]" />
</SqNavigationDrawer>`, setup: () => ({ open: ref(false) }) },
])
doc('SqContainer', 'Layout', 'Centered max-width wrapper with responsive padding. Combine with SqRow / SqCol (12-column grid).', [
  { title: 'Grid', code: `<SqRow dense>
  <SqCol cols="12" md="4" v-for="n in 3" :key="n"><SqSheet border class="sq-pa-4">md=4 · #{{ n }}</SqSheet></SqCol>
  <SqCol cols="12" md="8"><SqSheet border class="sq-pa-4">md=8</SqSheet></SqCol>
  <SqCol cols="12" md="4"><SqSheet border class="sq-pa-4">md=4</SqSheet></SqCol>
</SqRow>` },
])
doc('SqRow', 'Layout', 'Flex row for the 12-column grid. `dense` / `no-gutters` control spacing.', [{ title: 'Alignment', code: `<SqRow align="center" justify="space-between"><SqCol cols="auto"><SqChip>start</SqChip></SqCol><SqCol cols="auto"><SqChip>end</SqChip></SqCol></SqRow>` }])
doc('SqCol', 'Layout', 'Grid column. `cols`, `sm`, `md`, `lg`, `xl`, `offset`.', [{ title: 'Offset', code: `<SqRow><SqCol cols="6" offset="3"><SqSheet border class="sq-pa-4 sq-text-center">cols=6 offset=3</SqSheet></SqCol></SqRow>` }])
doc('SqToolbar', 'Layout', 'Horizontal bar of actions; `floating` makes it a squircle pill.', [
  { title: 'Floating toolbar', code: `<SqToolbar floating dense>
  <SqBtn icon="edit" variant="text" color="surface" /><SqBtn icon="copy" variant="text" color="surface" /><SqDivider vertical /><SqBtn icon="delete" variant="text" color="error" />
</SqToolbar>` },
])
doc('SqBottomNavigation', 'Layout', 'Mobile tab bar with squircle active indicator.', [
  { title: 'Floating', code: `<SqBottomNavigation v-model="tab" floating :items="[{ title: 'Home', icon: 'home' }, { title: 'Search', icon: 'search' }, { title: 'Alerts', icon: 'info' }]" />`, setup: () => ({ tab: ref(0) }) },
])
doc('SqFooter', 'Layout', 'App footer area.', [{ title: 'Basic', code: `<SqFooter :app="false">© 2026 Squirkle · <a href="#">Privacy</a></SqFooter>` }])
doc('SqThemeProvider', 'Layout', 'Scopes a theme to a subtree. Overlays opened inside inherit it.', [
  { title: 'Dark island', code: `<SqThemeProvider theme="dark" with-background>
  <div class="sq-pa-4 sq-d-flex sq-gap-2"><SqBtn>Primary</SqBtn><SqBtn variant="tonal">Tonal</SqBtn><SqChip color="success">Online</SqChip></div>
</SqThemeProvider>` },
])

/* ───────── Buttons & actions ───────── */
doc('SqBtn', 'Buttons', 'Squircle button. Variants: flat, elevated, tonal, outlined, text, plain. Sizes x-small → x-large, icons, loading, block, router links.', [
  { title: 'Variants', code: `<div class="sq-d-flex sq-flex-wrap sq-gap-2">
  <SqBtn>Flat</SqBtn><SqBtn variant="elevated">Elevated</SqBtn><SqBtn variant="tonal">Tonal</SqBtn>
  <SqBtn variant="outlined">Outlined</SqBtn><SqBtn variant="text">Text</SqBtn><SqBtn variant="plain">Plain</SqBtn>
</div>` },
  { title: 'Colors & sizes', code: `<div class="sq-d-flex sq-flex-wrap sq-align-center sq-gap-2">
  <SqBtn color="secondary" size="x-small">x-small</SqBtn><SqBtn color="success" size="small">small</SqBtn>
  <SqBtn color="warning">default</SqBtn><SqBtn color="error" size="large">large</SqBtn><SqBtn color="#0bb5c4" size="x-large">custom</SqBtn>
</div>` },
  { title: 'Icons & loading', code: `<div class="sq-d-flex sq-flex-wrap sq-align-center sq-gap-2">
  <SqBtn prepend-icon="download">Download</SqBtn><SqBtn append-icon="chevronRight" variant="tonal">Next</SqBtn>
  <SqBtn icon="plus" /><SqBtn icon="lucide:heart" variant="tonal" color="accent" /><SqBtn :loading="loading" @click="loading = true; setTimeout(() => loading = false, 1500)">Save</SqBtn>
</div>`, setup: () => ({ loading: ref(false), setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) }) },
])
doc('SqBtnGroup', 'Buttons', 'Joins buttons inside one squircle.', [{ title: 'Group', code: `<SqBtnGroup><SqBtn variant="text" color="surface">Day</SqBtn><SqBtn variant="text" color="surface">Week</SqBtn><SqBtn variant="text" color="surface">Month</SqBtn></SqBtnGroup>` }])
doc('SqBtnToggle', 'Buttons', 'Segmented control; v-model is the selected value (array with `multiple`).', [
  { title: 'Segmented', code: `<SqBtnToggle v-model="align" mandatory>
  <SqBtn value="left" icon="chevronLeft" variant="text" /><SqBtn value="center" icon="menu" variant="text" /><SqBtn value="right" icon="chevronRight" variant="text" />
</SqBtnToggle> <code>{{ align }}</code>`, setup: () => ({ align: ref('center') }) },
])
doc('SqSpeedDial', 'Buttons', 'Floating action button that fans out secondary actions.', [
  { title: 'Speed dial', code: `<div style="height:220px;display:flex;align-items:flex-end;justify-content:flex-end">
  <SqSpeedDial :actions="[{ icon: 'edit', label: 'Edit' }, { icon: 'copy', label: 'Duplicate' }, { icon: 'delete', label: 'Delete', color: 'error' }]" @action="last = $event.label" />
</div><div>Last action: {{ last }}</div>`, setup: () => ({ last: ref('—') }) },
])

/* ───────── Content ───────── */
doc('SqCard', 'Content', 'Squircle card with header, media, text and actions. Variants: elevated, outlined, tonal, flat.', [
  { title: 'Media card', code: `<SqCard title="Desert dunes" subtitle="Travel guide" image="https://images.unsplash.com/photo-1600520611035-84157ad4084d?w=800&q=60" style="max-width:340px">
  <SqCardText>Golden sand, open skies and the quiet of the desert at dawn.</SqCardText>
  <template #actions><SqBtn variant="text">Share</SqBtn><SqSpacer /><SqBtn variant="tonal">Explore</SqBtn></template>
</SqCard>` },
  { title: 'Variants', code: `<div class="sq-d-grid sq-gap-3" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
  <SqCard v-for="v in ['elevated','outlined','tonal','flat']" :key="v" :variant="v" :title="v" text="Card body" hover />
</div>` },
])
doc('SqSheet', 'Content', 'Plain squircle surface with color, border, elevation and radius.', [
  { title: 'Elevation', code: `<div class="sq-d-flex sq-gap-4 sq-flex-wrap"><SqSheet v-for="e in 5" :key="e" :elevation="e - 1" width="96" height="96" class="sq-d-flex sq-align-center sq-justify-center">{{ e - 1 }}</SqSheet></div>` },
])
doc('SqAvatar', 'Content', 'Image, icon or initials in a squircle.', [
  { title: 'Avatars', code: `<div class="sq-d-flex sq-align-center sq-gap-3">
  <SqAvatar image="https://i.pravatar.cc/120?img=12" size="x-large" /><SqAvatar name="Dara Sok" size="large" /><SqAvatar icon="lucide:user" color="secondary" />
  <SqAvatar name="Eva" variant="flat" color="success" size="small" /><SqAvatar name="Pill" rounded="pill" />
</div>` },
])
doc('SqBadge', 'Content', 'Count, dot or icon badge on any element.', [
  { title: 'Badges', code: `<div class="sq-d-flex sq-gap-6"><SqBadge content="3"><SqBtn icon="info" variant="tonal" /></SqBadge><SqBadge dot color="success"><SqAvatar name="Ann" /></SqBadge><SqBadge content="120" :max="99"><SqIcon icon="lucide:bell" size="large" /></SqBadge></div>` },
])
doc('SqChip', 'Content', 'Compact element for tags, filters and inputs.', [
  { title: 'Chips', code: `<div class="sq-d-flex sq-flex-wrap sq-gap-2">
  <SqChip>Default</SqChip><SqChip color="primary" variant="flat">Flat</SqChip><SqChip color="success" prepend-icon="check">Done</SqChip>
  <SqChip variant="outlined" color="warning">Outlined</SqChip><SqChip closable avatar="https://i.pravatar.cc/60?img=5">Closable</SqChip><SqChip size="small">Small</SqChip>
</div>` },
])
doc('SqChipGroup', 'Content', 'Selectable chips; `multiple`, `filter` check marks, `column` wrapping.', [
  { title: 'Filter chips', code: `<SqChipGroup v-model="tags" multiple column><SqChip v-for="f in fruits" :key="f" :value="f" filter>{{ f }}</SqChip></SqChipGroup><code>{{ tags }}</code>`, setup: () => ({ tags: ref(['Mango']), fruits: fruits.slice(0, 7) }) },
])
doc('SqDivider', 'Content', 'Horizontal / vertical separator with optional label.', [{ title: 'Labelled', code: `<SqDivider /><SqDivider>OR</SqDivider>` }])
doc('SqKbd', 'Content', 'Keyboard key.', [{ title: 'Shortcut', code: `Press <SqKbd>⌘</SqKbd> + <SqKbd>K</SqKbd> to search` }])
doc('SqImg', 'Content', 'Lazy image with squircle clip, aspect ratio and shimmer placeholder.', [
  { title: 'Lazy image', code: `<SqImg src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&q=60" aspect-ratio="16/9" rounded="2xl" style="max-width:420px" />` },
])
doc('SqTimeline', 'Content', 'Vertical timeline; `align="alternate"` for two sides. Items: SqTimelineItem.', [
  { title: 'Activity', code: `<SqTimeline>
  <SqTimelineItem title="Order placed" time="09:12" icon="check" color="success">Payment confirmed</SqTimelineItem>
  <SqTimelineItem title="Shipped" time="13:40" icon="arrowUp">Courier picked up the parcel</SqTimelineItem>
  <SqTimelineItem title="Out for delivery" time="—" small color="warning" />
</SqTimeline>` },
])
doc('SqTimelineItem', 'Content', 'One timeline entry.', [])
doc('SqEmptyState', 'Content', 'Illustrated placeholder for empty views.', [{ title: 'Empty', code: `<SqEmptyState title="No projects yet" text="Create your first project to get started." icon="lucide:folder-open"><template #actions><SqBtn prepend-icon="plus">New project</SqBtn></template></SqEmptyState>` }])
doc('SqTable', 'Content', 'Styled native table. For big data use SqDataGrid.', [
  { title: 'Simple table', code: `<SqTable striped><thead><tr><th>Name</th><th>Role</th><th style="text-align:right">Score</th></tr></thead>
<tbody><tr v-for="(p, i) in people" :key="p"><td>{{ p }}</td><td>{{ ['Admin','Editor','Viewer'][i % 3] }}</td><td style="text-align:right">{{ 70 + i * 3 }}</td></tr></tbody></SqTable>`, setup: () => ({ people: people.slice(0, 5) }) },
])

/* ───────── Feedback ───────── */
doc('SqAlert', 'Feedback', 'Contextual message: info, success, warning, error; variants and closable.', [
  { title: 'Types', code: `<div class="sq-d-flex sq-flex-column sq-gap-2">
  <SqAlert type="info" title="Heads up" text="A new version is available." />
  <SqAlert type="success" text="Profile saved." closable />
  <SqAlert type="warning" variant="outlined" text="Your trial ends in 3 days." />
  <SqAlert type="error" variant="flat" prominent title="Payment failed" text="Check your card details." />
</div>` },
])
doc('SqBanner', 'Feedback', 'Full-width message with actions.', [{ title: 'Banner', code: `<SqBanner icon="lucide:wifi-off" text="You are offline. Changes will sync when you reconnect."><template #actions><SqBtn variant="text">Retry</SqBtn></template></SqBanner>` }])
doc('SqSnackbar', 'Feedback', 'Toast with timeout, pause on hover and actions.', [
  { title: 'Snackbar', code: `<SqBtn @click="show = true">Show snackbar</SqBtn>
<SqSnackbar v-model="show" text="Message archived" show-timer><template #actions="{ close }"><SqBtn variant="text" color="warning" size="small" @click="close">Undo</SqBtn></template></SqSnackbar>`, setup: () => ({ show: ref(false) }) },
])
doc('SqProgressLinear', 'Feedback', 'Determinate, buffered, striped or indeterminate bar.', [
  { title: 'Progress', code: `<div class="sq-d-flex sq-flex-column sq-gap-3"><SqProgressLinear :model-value="64" /><SqProgressLinear :model-value="40" :buffer-value="70" color="secondary" /><SqProgressLinear indeterminate color="success" /><SqProgressLinear :model-value="80" striped :height="14">80%</SqProgressLinear></div>` },
])
doc('SqProgressCircular', 'Feedback', 'Ring progress with optional content.', [{ title: 'Rings', code: `<div class="sq-d-flex sq-gap-4 sq-align-center"><SqProgressCircular indeterminate /><SqProgressCircular :model-value="72" :size="56" :width="6" color="success">72</SqProgressCircular></div>` }])
doc('SqSkeleton', 'Feedback', 'Loading placeholders: text, avatar, button, card, image.', [{ title: 'Skeletons', code: `<div class="sq-d-flex sq-gap-4"><SqSkeleton type="avatar" :lines="1" /><div style="flex:1"><SqSkeleton :lines="3" /></div></div>` }])
doc('SqRating', 'Feedback', 'Star rating with hover preview and keyboard support.', [{ title: 'Rating', code: `<SqRating v-model="r" clearable /> {{ r }} / 5`, setup: () => ({ r: ref(3) }) }])

/* ───────── Navigation ───────── */
doc('SqTabs', 'Navigation', 'Tabs with a sliding squircle indicator — pill, segmented or underline. Pair with SqWindow.', [
  { title: 'Variants', code: `<div class="sq-d-flex sq-flex-column sq-gap-4">
  <SqTabs v-model="t" :items="['Overview','Analytics','Reports','Settings']" />
  <SqTabs v-model="t" variant="segmented" :items="['Overview','Analytics','Reports','Settings']" />
  <SqTabs v-model="t" variant="underline" :items="['Overview','Analytics','Reports','Settings']" />
</div>`, setup: () => ({ t: ref('Overview') }) },
  { title: 'With window', code: `<SqTabs v-model="tab" :items="['One','Two','Three']" />
<SqWindow v-model="tab" class="sq-mt-4"><SqWindowItem v-for="n in ['One','Two','Three']" :key="n" :value="n"><SqSheet border class="sq-pa-6">Panel {{ n }}</SqSheet></SqWindowItem></SqWindow>`, setup: () => ({ tab: ref('One') }) },
])
doc('SqTab', 'Navigation', 'A single tab inside SqTabs.', [])
doc('SqWindow', 'Navigation', 'Animated view switcher with optional arrows (wizards, carousels of content).', [
  { title: 'Arrows', code: `<SqWindow v-model="w" show-arrows continuous><SqWindowItem v-for="n in 3" :key="n" :value="n"><SqSheet color="surface-variant" height="140" class="sq-d-flex sq-align-center sq-justify-center">Slide {{ n }}</SqSheet></SqWindowItem></SqWindow>`, setup: () => ({ w: ref(1) }) },
])
doc('SqWindowItem', 'Navigation', 'A view inside SqWindow.', [])
doc('SqBreadcrumbs', 'Navigation', 'Path navigation with chevron or custom dividers.', [{ title: 'Breadcrumbs', code: `<SqBreadcrumbs :items="[{ title: 'Home', href: '#', icon: 'home' }, { title: 'Library', href: '#' }, { title: 'Data' }]" />` }])
doc('SqPagination', 'Navigation', 'Page selector with ellipsis.', [{ title: 'Pagination', code: `<SqPagination v-model="p" :length="24" />`, setup: () => ({ p: ref(6) }) }])
doc('SqStepper', 'Navigation', 'Multi-step flow with progress markers.', [
  { title: 'Checkout', code: `<SqStepper v-model="s" :items="['Cart', { title: 'Shipping', subtitle: 'Address' }, 'Payment', 'Review']" @finish="done = true">
  <template #default="{ step }"><SqSheet border class="sq-pa-6">Step {{ step }} content</SqSheet></template>
</SqStepper><SqAlert v-if="done" type="success" text="Order placed!" class="sq-mt-2" />`, setup: () => ({ s: ref(1), done: ref(false) }) },
])
doc('SqList', 'Navigation', 'Lists with avatars, subtitles, selection and a `virtual` mode for huge item sets.', [
  { title: 'Selectable nav list', code: `<SqList v-model="sel" selectable nav bordered :items="[{ type: 'subheader', title: 'Mail' }, { title: 'Inbox', value: 'inbox', prependIcon: 'lucide:inbox' }, { title: 'Sent', value: 'sent', prependIcon: 'lucide:send' }, { type: 'divider' }, { title: 'Trash', value: 'trash', prependIcon: 'delete' }]" style="max-width:300px" />`, setup: () => ({ sel: ref('inbox') }) },
  { title: 'Virtual list — 100,000 rows', code: `<SqList virtual :height="300" :item-height="56" bordered :items="items" />`, setup: () => ({ items: Array.from({ length: 100_000 }, (_, i) => ({ title: `${people[i % 8]} #${i + 1}`, subtitle: `user${i}@example.com`, prependAvatar: `https://i.pravatar.cc/60?img=${i % 70}`, value: i })) }) },
])
doc('SqListItem', 'Navigation', 'One list row.', [])
doc('SqListSubheader', 'Navigation', 'Section label inside a list.', [])
doc('SqListGroup', 'Navigation', 'Collapsible group of list items.', [{ title: 'Nested', code: `<SqList nav style="max-width:280px"><SqListGroup title="Settings" prepend-icon="lucide:settings" :model-value="true"><SqListItem title="Profile" link /><SqListItem title="Security" link /></SqListGroup></SqList>` }])
doc('SqTreeview', 'Navigation', 'Tree with selection, activation and search — rendered as a flat virtual-friendly list.', [
  { title: 'Selectable tree', code: `<SqTextField v-model="q" placeholder="Search…" density="compact" prepend-inner-icon="search" hide-details class="sq-mb-2" style="max-width:280px" />
<SqTreeview v-model="sel" selectable :search="q" :items="tree" /><code>{{ sel }}</code>`, setup: () => ({ q: ref(''), sel: ref(['vue']), tree: [{ title: 'src', value: 'src', icon: 'lucide:folder', children: [{ title: 'components', value: 'c', icon: 'lucide:folder', children: [{ title: 'SqBtn.vue', value: 'vue', icon: 'lucide:file-code' }, { title: 'SqCard.vue', value: 'card', icon: 'lucide:file-code' }] }, { title: 'index.ts', value: 'idx', icon: 'lucide:file' }] }, { title: 'package.json', value: 'pkg', icon: 'lucide:file-json' }] }) },
])
doc('SqSlideGroup', 'Navigation', 'Horizontal scroller with arrows.', [{ title: 'Chips', code: `<SqSlideGroup style="max-width:420px"><SqChip v-for="f in fruits" :key="f">{{ f }}</SqChip></SqSlideGroup>`, setup: () => ({ fruits }) }])
doc('SqExpansionPanels', 'Navigation', 'Accordion; variants default / separated / inset; `multiple`.', [
  { title: 'Separated', code: `<SqExpansionPanels variant="separated" :model-value="0"><SqExpansionPanel v-for="n in 3" :key="n" :title="'Question ' + n" text="Squircles have continuous curvature, so corners look softer and more natural than circular arcs." /></SqExpansionPanels>` },
])
doc('SqExpansionPanel', 'Navigation', 'A panel inside SqExpansionPanels.', [])

/* ───────── Overlays ───────── */
doc('SqDialog', 'Overlays', 'Modal with focus trap, scroll lock, persistent shake, fullscreen and bottom positions.', [
  { title: 'Dialog', code: `<SqDialog v-model="open" title="Delete project?" closable width="420">
  <template #activator><SqBtn color="error" variant="tonal">Delete…</SqBtn></template>
  This permanently removes the project and its 1,284 files.
  <template #actions="{ close }"><SqBtn variant="text" color="surface" @click="close">Cancel</SqBtn><SqBtn color="error" @click="close">Delete</SqBtn></template>
</SqDialog>`, setup: () => ({ open: ref(false) }) },
])
doc('SqBottomSheet', 'Overlays', 'Dialog anchored to the bottom edge with a handle.', [
  { title: 'Bottom sheet', code: `<SqBtn variant="tonal" @click="open = true">Share</SqBtn><SqBottomSheet v-model="open" title="Share to"><SqList nav :items="[{ title: 'Copy link', prependIcon: 'copy' }, { title: 'Email', prependIcon: 'lucide:mail' }]" /></SqBottomSheet>`, setup: () => ({ open: ref(false) }) },
])
doc('SqMenu', 'Overlays', 'Positioned popover with flip/shift, click/hover/focus activation.', [
  { title: 'Menu', code: `<SqMenu>
  <template #activator><SqBtn append-icon="chevronDown" variant="tonal">Options</SqBtn></template>
  <SqList nav density="compact" :items="[{ title: 'Edit', prependIcon: 'edit' }, { title: 'Duplicate', prependIcon: 'copy' }, { type: 'divider' }, { title: 'Delete', prependIcon: 'delete' }]" />
</SqMenu>
<SqMenu open-on-hover location="right start"><template #activator><SqBtn variant="text">Hover me</SqBtn></template><div class="sq-pa-4">Hover menus close when the pointer leaves.</div></SqMenu>` },
])
doc('SqTooltip', 'Overlays', 'Hover / focus tooltip.', [{ title: 'Tooltip', code: `<SqTooltip text="Save (⌘S)"><SqBtn icon="download" variant="tonal" /></SqTooltip> <SqTooltip text="Bottom" location="bottom"><SqBtn variant="text">Bottom</SqBtn></SqTooltip>` }])
doc('SqOverlay', 'Overlays', 'Scrim with centered content.', [{ title: 'Loading overlay', code: `<SqBtn @click="o = true; setTimeout(() => o = false, 1500)">Show</SqBtn><SqOverlay v-model="o"><SqProgressCircular indeterminate :size="48" color="surface" /></SqOverlay>`, setup: () => ({ o: ref(false), setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) }) }])

/* ───────── Forms ───────── */
doc('SqTextField', 'Forms', 'Text input: outlined, filled, solo, underlined, plain; icons, prefix/suffix, clearable, counter, password reveal, validation.', [
  { title: 'Variants', code: `<div class="sq-d-grid sq-gap-3" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
  <SqTextField v-for="v in ['outlined','filled','solo','underlined']" :key="v" :variant="v" :label="v" placeholder="Type…" clearable />
</div>` },
  { title: 'Validation & extras', code: `<div class="sq-d-grid sq-gap-3" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
  <SqTextField v-model="email" label="Email" prepend-inner-icon="lucide:mail" :rules="[v => !!v || 'Required', v => /.+@.+\\..+/.test(v) || 'Invalid email']" required />
  <SqTextField label="Password" type="password" hint="At least 8 characters" persistent-hint />
  <SqTextField label="Price" prefix="$" suffix="USD" type="number" />
  <SqTextField label="Bio" :counter="40" :maxlength="40" />
</div>`, setup: () => ({ email: ref('') }) },
])
doc('SqTextarea', 'Forms', 'Multi-line input with auto-grow and counter.', [{ title: 'Auto grow', code: `<SqTextarea v-model="t" label="Notes" auto-grow counter rows="2" />`, setup: () => ({ t: ref('Squircles everywhere.') }) }])
doc('SqNumberInput', 'Forms', 'Numeric input with steppers, min/max, precision and keyboard arrows.', [{ title: 'Number', code: `<div class="sq-d-flex sq-gap-3"><SqNumberInput v-model="n" label="Quantity" :min="0" :max="10" style="max-width:200px" /><SqNumberInput v-model="price" label="Price" :step="0.25" :precision="2" control-variant="split" style="max-width:220px" /></div>`, setup: () => ({ n: ref(2), price: ref(9.5) }) }])
doc('SqOtpInput', 'Forms', 'One-time-code boxes with paste and auto-advance.', [{ title: 'OTP', code: `<SqOtpInput v-model="code" @finish="done = $event" /><div class="sq-mt-2">Finished: {{ done }}</div>`, setup: () => ({ code: ref(''), done: ref('—') }) }])
doc('SqSelect', 'Forms', 'Select with chips, multiple, search and a virtualized option list (100k+ options).', [
  { title: 'Single & multiple', code: `<div class="sq-d-grid sq-gap-3" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
  <SqSelect v-model="one" label="Fruit" :items="fruits" clearable />
  <SqSelect v-model="many" label="Team" :items="people" multiple chips closable-chips />
</div>`, setup: () => ({ one: ref('Mango'), many: ref(['Dara Sok']), fruits, people }) },
  { title: '100,000 options (virtualized)', code: `<SqAutocomplete v-model="id" label="Customer" :items="big" item-title="name" item-value="id" placeholder="Search 100k customers" clearable style="max-width:360px" />
<div class="sq-mt-2">Selected id: {{ id }}</div>`, setup: () => ({ id: ref<number | undefined>(undefined), big: Array.from({ length: 100_000 }, (_, i) => ({ id: i, name: `${people[i % 8]} ${i}`, subtitle: `#${i}` })) }) },
])
doc('SqAutocomplete', 'Forms', 'SqSelect with type-to-filter.', [{ title: 'Autocomplete', code: `<SqAutocomplete v-model="v" label="Country" :items="['Cambodia','Canada','Chile','China','Colombia','Croatia','Cuba']" multiple chips />`, setup: () => ({ v: ref(['Cambodia']) }) }])
doc('SqCombobox', 'Forms', 'Select that accepts new values (press Enter).', [{ title: 'Tags', code: `<SqCombobox v-model="tags" label="Tags" :items="['vue','nuxt','squircle']" multiple chips closable-chips />`, setup: () => ({ tags: ref(['vue']) }) }])
doc('SqCheckbox', 'Forms', 'Squircle checkbox; boolean or array model, indeterminate.', [{ title: 'Checkboxes', code: `<SqCheckbox v-model="a" label="Accept terms" /><SqCheckbox v-model="list" value="email" label="Email" /><SqCheckbox v-model="list" value="sms" label="SMS" color="success" /><SqCheckbox indeterminate label="Indeterminate" /> <code>{{ a }} {{ list }}</code>`, setup: () => ({ a: ref(true), list: ref(['email']) }) }])
doc('SqRadioGroup', 'Forms', 'Radio buttons, inline or stacked.', [{ title: 'Radios', code: `<SqRadioGroup v-model="plan" label="Plan" inline :items="['Free','Pro','Team']" /> <code>{{ plan }}</code>`, setup: () => ({ plan: ref('Pro') }) }])
doc('SqRadio', 'Forms', 'Single radio (usually inside SqRadioGroup).', [])
doc('SqSwitch', 'Forms', 'iOS-style switch, inset variant, loading.', [{ title: 'Switches', code: `<SqSwitch v-model="on" label="Notifications" /><SqSwitch v-model="on" inset color="success" label="Inset" /><SqSwitch :model-value="true" loading label="Loading" />`, setup: () => ({ on: ref(true) }) }])
doc('SqSlider', 'Forms', 'Slider with thumb label, ticks and keyboard.', [{ title: 'Slider', code: `<SqSlider v-model="v" label="Volume" thumb-label /><SqSlider v-model="s" :min="0" :max="10" :step="1" show-ticks color="secondary" />`, setup: () => ({ v: ref(40), s: ref(4) }) }])
doc('SqRangeSlider', 'Forms', 'Two-thumb slider; v-model = [start, end].', [{ title: 'Range', code: `<SqRangeSlider v-model="r" label="Price" :max="1000" :step="10" thumb-label :format="v => '$' + v" /> {{ r }}`, setup: () => ({ r: ref([200, 640]) }) }])
doc('SqFileInput', 'Forms', 'Drag-and-drop file picker with size limit.', [{ title: 'Drop zone', code: `<SqFileInput v-model="files" multiple hint="PNG, JPG up to 2 MB" :max-size="2097152" />`, setup: () => ({ files: ref([]) }) }])
doc('SqForm', 'Forms', 'Validates all child fields; @submit receives { valid, errors }.', [
  { title: 'Sign-up form', code: `<SqForm @submit="result = $event" style="max-width:360px">
  <SqTextField label="Name" :rules="[v => !!v || 'Name is required']" />
  <SqTextField label="Email" :rules="[v => /.+@.+/.test(v || '') || 'Valid email required']" />
  <SqCheckbox label="I agree" :rules="[v => !!v || 'Required']" />
  <SqBtn type="submit" block>Create account</SqBtn>
</SqForm><pre>{{ result }}</pre>`, setup: () => ({ result: ref(null) }) },
])
doc('SqColorPicker', 'Forms', 'HSV picker with hue/alpha sliders, hex input and swatches.', [{ title: 'Picker', code: `<div class="sq-d-flex sq-gap-4 sq-flex-wrap"><SqColorPicker v-model="c" alpha /><SqSheet :color="c" width="120" height="120" elevation="2" /></div>`, setup: () => ({ c: ref('#5b5bf0') }) }])
doc('SqDatePicker', 'Forms', 'Calendar picker: single, range, multiple, min/max, events, year view, keyboard.', [
  { title: 'Single & range', code: `<div class="sq-d-flex sq-gap-4 sq-flex-wrap"><SqDatePicker v-model="d" show-header title="Select date" /><SqDatePicker v-model="r" range color="secondary" /></div>`, setup: () => ({ d: ref(new Date().toISOString().slice(0, 10)), r: ref([]) }) },
])
doc('SqDateField', 'Forms', 'Text field that opens a date picker.', [{ title: 'Date field', code: `<SqDateField v-model="d" label="Due date" clearable style="max-width:280px" />`, setup: () => ({ d: ref('') }) }])
doc('SqTimePicker', 'Forms', 'Hour/minute columns, 24h or AM/PM.', [{ title: 'Time', code: `<div class="sq-d-flex sq-gap-4 sq-flex-wrap"><SqTimePicker v-model="t" /><SqTimePicker v-model="t" format="ampm" /></div> {{ t }}`, setup: () => ({ t: ref('14:30') }) }])

/* ───────── Data & performance ───────── */
doc('SqVirtualScroll', 'Data', 'Windowed list for big data — fixed or measured heights, infinite loading via @load-more.', [
  { title: '1,000,000 rows', code: `<SqVirtualScroll :items="rows" :item-height="44" height="320" style="border:1px solid var(--sq-border);border-radius:16px">
  <template #default="{ item }"><div style="display:flex;align-items:center;height:44px;padding:0 16px;border-bottom:1px solid var(--sq-border)">Row #{{ item }}</div></template>
</SqVirtualScroll>`, setup: () => ({ rows: Array.from({ length: 1_000_000 }, (_, i) => i + 1) }) },
  { title: 'Infinite scroll (simulated API)', code: `<SqVirtualScroll :items="items" :estimated-item-height="64" height="320" infinite :loading="loading" :has-more="items.length < 500" @load-more="load" style="border:1px solid var(--sq-border);border-radius:16px">
  <template #default="{ item }"><SqListItem :title="item.title" :subtitle="item.body" :prepend-avatar="item.avatar" /></template>
  <template #end><span>All {{ items.length }} items loaded</span></template>
</SqVirtualScroll>`, setup: () => {
    const items = ref<{ title: string; body: string; avatar: string }[]>([])
    const loading = ref(false)
    const load = () => {
      loading.value = true
      setTimeout(() => {
        const n = items.value.length
        items.value = [...items.value, ...Array.from({ length: 50 }, (_, i) => ({ title: `Post ${n + i + 1}`, body: 'Variable height rows are measured automatically.'.repeat(((n + i) % 3) + 1), avatar: `https://i.pravatar.cc/60?img=${(n + i) % 70}` }))]
        loading.value = false
      }, 600)
    }
    return { items, loading, load }
  } },
])
doc('SqInfiniteScroll', 'Data', 'Non-virtual infinite list with IntersectionObserver (or manual "Load more").', [
  { title: 'Feed', code: `<SqInfiniteScroll :loading="loading" :has-more="n < 60" height="260" @load="more"><div v-for="i in n" :key="i" style="padding:10px 4px;border-bottom:1px solid var(--sq-border)">Item {{ i }}</div><template #end>No more items</template></SqInfiniteScroll>`, setup: () => {
    const n = ref(15)
    const loading = ref(false)
    return { n, loading, more: () => { loading.value = true; setTimeout(() => { n.value += 15; loading.value = false }, 500) } }
  } },
])
doc('SqLazy', 'Data', 'Mounts content only when scrolled into view.', [{ title: 'Lazy', code: `<SqLazy min-height="80"><SqAlert type="success" text="I was rendered lazily." /></SqLazy>` }])

/* ───────── Add-on packages ───────── */
doc('SqDataGrid', 'Add-ons', 'Enterprise data grid (@squirkle/datagrid). See the dedicated showcase.', [], { component: SqDataGrid, pkg: '@squirkle/datagrid', route: '/datagrid' })
doc('SqLineChart', 'Add-ons', 'Charts (@squirkle/charts): line/area, bar, donut, sparkline.', [], { component: SqLineChart, pkg: '@squirkle/charts', route: '/charts' })
doc('SqBarChart', 'Add-ons', 'Grouped / stacked / horizontal bars with squircle ends.', [], { component: SqBarChart, pkg: '@squirkle/charts', route: '/charts' })
doc('SqDonutChart', 'Add-ons', 'Pie / donut chart.', [], { component: SqDonutChart, pkg: '@squirkle/charts', route: '/charts' })
doc('SqSparkline', 'Add-ons', 'Inline trend line.', [], { component: SqSparkline, pkg: '@squirkle/charts', route: '/charts' })
doc('SqSwiper', 'Add-ons', 'Touch swiper with loop, effects, autoplay (@squirkle/swiper).', [], { component: SqSwiper, pkg: '@squirkle/swiper', route: '/swiper' })
doc('SqCalendar', 'Add-ons', 'Event calendar (@squirkle/calendar).', [], { component: SqCalendar, pkg: '@squirkle/calendar', route: '/calendar' })
doc('SqMap', 'Add-ons', 'Leaflet map with squircle markers (@squirkle/map).', [], { component: SqMap, pkg: '@squirkle/map', route: '/map' })
doc('SqIconPicker', 'Add-ons', 'Iconify browser + helpers (@squirkle/icons).', [], { component: SqIconPicker, pkg: '@squirkle/icons', route: '/icons' })

doc('SqIcon', 'Content', 'Built-in icons, any Iconify icon (`mdi:home`, `lucide:heart` — loaded on demand), `$aliases`, or raw SVG paths.', [
  { title: 'Icon sources', code: `<div class="sq-d-flex sq-gap-3 sq-align-center"><SqIcon icon="check" size="large" /><SqIcon icon="lucide:rocket" size="x-large" color="primary" /><SqIcon icon="mdi:github" size="x-large" /><SqIcon icon="$heart" size="x-large" color="error" /><SqIcon icon="M12 2 2 22h20z" size="large" color="warning" /></div>` },
])
doc('SqShape', 'Utilities', 'The squircle painter: put inside any `.sq-surface` to get SVG squircles where CSS `corner-shape` is unsupported.', [
  { title: 'Custom surface', code: `<div class="sq-surface" :style="{ '--sq-r': r + 'px', '--sq-smoothing': s, '--sq-bg': 'var(--sq-primary)', '--sq-shadow-filter': 'var(--sq-elevation-3-filter)', width: '180px', height: '120px' }"><SqShape :watch-key="r" /></div>
<SqSlider v-model="r" :min="0" :max="60" label="Radius" thumb-label class="sq-mt-4" /><SqSlider v-model="s" :min="0" :max="1" :step="0.05" label="Smoothing" thumb-label />`, setup: () => ({ r: ref(36), s: ref(0.6) }) },
])
doc('SqPortal', 'Utilities', 'Vue 2/3-compatible Teleport replacement used by every overlay.', [])
doc('SqExpandTransition', 'Utilities', 'Height transition for collapsible content.', [])
doc('SqSpacer', 'Utilities', 'Flex spacer.', [])
doc('SqMain', 'Layout', 'Main content area inside SqApp.', [])
doc('SqCardTitle', 'Content', 'Card title block.', [])
doc('SqCardText', 'Content', 'Card body text block.', [])
doc('SqCardActions', 'Content', 'Card action row.', [])
doc('SqField', 'Forms', 'Shared input shell used by text-like controls (label, icons, messages).', [])

export const registry = entries.sort((a, b) => a.name.localeCompare(b.name))
export const categories = ['Layout', 'Buttons', 'Content', 'Navigation', 'Overlays', 'Forms', 'Feedback', 'Data', 'Utilities', 'Add-ons']
export const bySlug = (s: string) => entries.find((e) => e.slug === s)
export const docState = reactive({ search: '' })
export const searchResults = computed(() => {
  const q = docState.search.trim().toLowerCase()
  return q ? entries.filter((e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)).slice(0, 12) : []
})
