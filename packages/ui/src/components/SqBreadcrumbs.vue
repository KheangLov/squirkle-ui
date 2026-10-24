<template>
  <nav class="sq-breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <li v-for="(item, i) in items" :key="i" class="sq-breadcrumbs__item">
        <component :is="item.to ? 'router-link' : item.href ? 'a' : 'span'" :to="item.to" :href="item.href" class="sq-breadcrumbs__link" :class="{ 'sq-breadcrumbs__link--active': i === items.length - 1 || item.disabled }" :aria-current="i === items.length - 1 ? 'page' : undefined">
          <SqIcon v-if="item.icon" :icon="item.icon" size="16px" />{{ item.title }}
        </component>
        <span v-if="i < items.length - 1" class="sq-breadcrumbs__divider" aria-hidden="true"><SqIcon v-if="divider === 'chevron'" icon="chevronRight" size="16px" /><template v-else>{{ divider }}</template></span>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SqIcon from './SqIcon.vue'

export interface BreadcrumbItem { title: string; href?: string; to?: string | object; icon?: string; disabled?: boolean }

export default defineComponent({
  name: 'SqBreadcrumbs',
  components: { SqIcon },
  props: {
    items: { type: Array as PropType<BreadcrumbItem[]>, default: () => [] },
    divider: { type: String, default: 'chevron' },
  },
})
</script>

<style>
.sq-breadcrumbs ol { display: flex; flex-wrap: wrap; align-items: center; gap: var(--sq-space-1); list-style: none; margin: 0; padding: 0; font-size: var(--sq-text-sm); }
.sq-breadcrumbs__item { display: inline-flex; align-items: center; gap: var(--sq-space-1); }
.sq-breadcrumbs__link { display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: var(--sq-radius-xs); color: var(--sq-muted); text-decoration: none; }
a.sq-breadcrumbs__link:hover { color: var(--sq-primary); background: color-mix(in srgb, var(--sq-primary) 8%, transparent); }
.sq-breadcrumbs__link--active { color: var(--sq-on-surface); font-weight: var(--sq-weight-medium); pointer-events: none; }
.sq-breadcrumbs__divider { display: inline-flex; color: var(--sq-border-strong); }
</style>
