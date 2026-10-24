<template>
  <span
    class="sq-icon"
    :class="{ 'sq-icon--clickable': clickable }"
    :style="style"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <svg v-if="resolved.kind === 'path'" viewBox="0 0 24 24" focusable="false"><path :d="resolved.d" /></svg>
    <!-- Iconify SVG bodies come only from addIcons/addCollection or the configured Iconify API host (.ai/SECURITY.md). -->
    <svg
      v-else-if="resolved.kind === 'svg'"
      :viewBox="`0 0 ${resolved.data.width} ${resolved.data.height}`"
      focusable="false"
      v-html="resolved.data.body"
    ></svg>
    <slot v-else />
  </span>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { toUnit } from '@squirkle-ui/core'
import { resolveIcon } from '../icons'
import { colorValue } from '../composables/style'

const SIZES: Record<string, string> = { 'x-small': '14px', small: '18px', default: '1.25em', large: '24px', 'x-large': '32px' }

export default defineComponent({
  name: 'SqIcon',
  props: {
    /** `$alias`, built-in name, Iconify name (`mdi:home`) or raw SVG path data. */
    icon: { type: String, default: undefined },
    size: { type: [String, Number], default: 'default' },
    color: { type: String, default: undefined },
    /** Accessible label; omit for decorative icons. */
    label: { type: String, default: undefined },
    clickable: Boolean,
  },
  setup(props) {
    const resolved = computed(() => resolveIcon(props.icon))
    const style = computed(() => ({
      '--sq-icon-size': SIZES[props.size as string] ?? toUnit(props.size),
      color: colorValue(props.color),
    }))
    return { resolved, style }
  },
})
</script>

<style>
.sq-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--sq-icon-size, 1.25em);
  height: var(--sq-icon-size, 1.25em);
  line-height: 1;
  vertical-align: middle;
}
.sq-icon svg { width: 100%; height: 100%; fill: currentColor; }
.sq-icon--clickable { cursor: pointer; border-radius: var(--sq-radius-xs); }
.sq-icon--clickable:hover { color: var(--sq-primary); }
</style>
