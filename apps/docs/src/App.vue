<template>
  <SqApp>
    <SqAppBar>
      <template #prepend>
        <SqBtn icon="menu" variant="text" color="surface" aria-label="Toggle navigation" @click="drawer = !drawer" />
        <RouterLink to="/" class="doc-logo"><span class="doc-logo__mark sq-squircle"></span>Squirkle<span class="doc-logo__ui">UI</span></RouterLink>
      </template>
      <div class="doc-search">
        <SqMenu v-model="searchOpen" :close-on-content-click="true" match-width :open-on-click="false">
          <template #activator>
            <SqTextField v-model="docState.search" placeholder="Search components…" prepend-inner-icon="search" density="compact" variant="filled" hide-details @focus="searchOpen = true" @update:model-value="searchOpen = !!$event" />
          </template>
          <SqList nav density="compact">
            <SqListItem v-for="r in searchResults" :key="r.slug" :title="r.name" :subtitle="r.description" link @click="go(r)" />
            <SqListItem v-if="!searchResults.length" title="No matches" />
          </SqList>
        </SqMenu>
      </div>
      <template #append>
        <SqSelect v-model="squircle.mode" :items="modes" density="compact" variant="filled" hide-details class="doc-mode" aria-label="Squircle renderer" />
        <SqTooltip :text="isDark ? 'Light mode' : 'Dark mode'"><SqBtn :icon="isDark ? 'sun' : 'moon'" variant="text" color="surface" @click="toggle" /></SqTooltip>
        <SqTooltip text="Customize theme"><SqBtn id="customize" icon="lucide:palette" variant="tonal" aria-label="Customize theme" @click="customize = true" /></SqTooltip>
      </template>
    </SqAppBar>
    <SqNavigationDrawer v-model="drawer" width="268">
      <SqList nav density="compact">
        <SqListSubheader>Getting started</SqListSubheader>
        <SqListItem v-for="g in guides" :key="g.to" :title="g.title" :prepend-icon="g.icon" :to="g.to" :active="route.path === g.to" />
        <SqListSubheader>Showcases</SqListSubheader>
        <SqListItem v-for="s in showcases" :key="s.to" :title="s.title" :prepend-icon="s.icon" :to="s.to" :active="route.path === s.to" />
        <template v-for="cat in categories" :key="cat">
          <SqListGroup :title="cat" :model-value="openCat === cat">
            <SqListItem v-for="e in byCat(cat)" :key="e.slug" :title="e.name.replace(/^Sq/, '')" :to="'/components/' + e.slug" :active="route.path === '/components/' + e.slug" />
          </SqListGroup>
        </template>
      </SqList>
    </SqNavigationDrawer>
    <ThemeCustomizer v-model="customize" />
    <SqMain>
      <RouterView v-slot="{ Component }"><transition name="sq-fade" mode="out-in"><component :is="Component" :key="route.fullPath" /></transition></RouterView>
    </SqMain>
  </SqApp>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { config, useTheme } from '@squirkle-ui/ui'
import { categories, docState, registry, searchResults, type DocEntry } from './registry'
import ThemeCustomizer from './components/ThemeCustomizer.vue'

const route = useRoute()
const router = useRouter()
const drawer = ref<boolean | undefined>(undefined)
const searchOpen = ref(false)
const customize = ref(false)
const { isDark, toggle } = useTheme()
const squircle = config.squircle
const modes = [{ title: 'Auto squircle', value: 'auto' }, { title: 'SVG squircle', value: 'svg' }, { title: 'Native CSS', value: 'native' }, { title: 'Plain radius', value: 'css' }]
const guides = [
  { title: 'Introduction', to: '/', icon: 'home' },
  { title: 'Installation', to: '/guide/installation', icon: 'download' },
  { title: 'Theming', to: '/guide/theming', icon: 'lucide:palette' },
  { title: 'Squircle engine', to: '/guide/squircle', icon: 'lucide:squircle' },
  { title: 'Vue 2 & Nuxt', to: '/guide/compatibility', icon: 'lucide:layers' },
  { title: 'All components', to: '/components', icon: 'columns' },
  { title: 'Playground', to: '/playground', icon: 'lucide:flask-conical' },
]
const showcases = [
  { title: 'DataGrid', to: '/datagrid', icon: 'lucide:table-2' },
  { title: 'Charts', to: '/charts', icon: 'lucide:chart-column' },
  { title: 'Swiper', to: '/swiper', icon: 'lucide:gallery-horizontal' },
  { title: 'Calendar', to: '/calendar', icon: 'calendar' },
  { title: 'Map', to: '/map', icon: 'place' },
  { title: 'Icons', to: '/icons', icon: 'lucide:smile' },
]
const byCat = (c: string) => registry.filter((e) => e.category === c)
const openCat = computed(() => registry.find((e) => route.path === '/components/' + e.slug)?.category)
const go = (e: DocEntry) => { docState.search = ''; router.push(e.route ?? '/components/' + e.slug) }
</script>
