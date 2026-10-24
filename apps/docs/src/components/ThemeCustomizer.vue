<template>
  <SqNavigationDrawer v-model="open" location="end" temporary :width="340">
    <div class="doc-custom">
      <div class="doc-custom__head">
        <div class="doc-custom__title">Customize</div>
        <SqBtn icon="close" variant="text" color="surface" size="small" aria-label="Close" @click="open = false" />
      </div>

      <section>
        <h4>Mode</h4>
        <SqBtnToggle :model-value="isDark ? 'dark' : 'light'" mandatory @update:model-value="setMode">
          <SqBtn value="light" prepend-icon="sun" variant="text">Light</SqBtn>
          <SqBtn value="dark" prepend-icon="moon" variant="text">Dark</SqBtn>
        </SqBtnToggle>
      </section>

      <section>
        <h4>Theme preset</h4>
        <div class="doc-custom__presets">
          <button v-for="(p, key) in themePresets" :key="key" type="button" class="doc-custom__preset sq-squircle" :class="{ active: state.preset === key && !state.brand }" :aria-label="p.label" @click="pickPreset(String(key))">
            <span class="doc-custom__swatch" :style="{ background: `linear-gradient(135deg, ${p.primary}, ${p.accent ?? p.primary})` }"></span>{{ p.label }}
          </button>
        </div>
      </section>

      <section>
        <h4>Custom brand color</h4>
        <SqColorPicker :model-value="state.brand ?? themePresets[state.preset].primary" flat :swatches="[]" @update:model-value="pickBrand" />
      </section>

      <section>
        <h4>Font</h4>
        <SqSelect :model-value="state.font" :items="fonts" placeholder="Geist (default)" density="compact" hide-details @update:model-value="pickFont" />
      </section>

      <section>
        <h4>Shape</h4>
        <SqSlider :model-value="state.radiusScale" :min="0" :max="1.6" :step="0.1" label="Corner radius" thumb-label :format="fmtScale" @update:model-value="setRadius" />
        <SqSlider :model-value="state.smoothing" :min="0" :max="1" :step="0.05" label="Corner smoothing" thumb-label @update:model-value="setSmoothing" />
        <SqSelect :model-value="state.mode" :items="modes" label="Squircle renderer" density="compact" hide-details @update:model-value="setRenderer" />
      </section>

      <section class="doc-custom__preview">
        <SqBtn>Primary</SqBtn><SqBtn variant="tonal" color="secondary">Secondary</SqBtn><SqChip color="accent">Accent</SqChip>
      </section>

      <div class="doc-custom__actions">
        <SqBtn variant="text" color="surface" prepend-icon="refresh" @click="reset">Reset</SqBtn>
        <SqBtn variant="tonal" prepend-icon="copy" @click="copyConfig">{{ copied ? 'Copied' : 'Copy config' }}</SqBtn>
      </div>
    </div>
  </SqNavigationDrawer>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { config, themePresets, useTheme, type SquircleMode } from '@squirkle/ui'

const open = defineModel<boolean>({ default: false })
const theme = useTheme()
const isDark = theme.isDark
const STORAGE = 'sq-docs-appearance'
const fonts = [
  { title: 'Geist (default)', value: '' },
  { title: 'Inter', value: "'Inter', ui-sans-serif, system-ui, sans-serif" },
  { title: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" },
  { title: 'Manrope', value: "'Manrope', ui-sans-serif, system-ui, sans-serif" },
  { title: 'DM Sans', value: "'DM Sans', ui-sans-serif, system-ui, sans-serif" },
  { title: 'System UI', value: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
]
const modes = [{ title: 'Auto', value: 'auto' }, { title: 'SVG', value: 'svg' }, { title: 'Native CSS', value: 'native' }, { title: 'Plain radius', value: 'css' }]

interface Saved { dark: boolean; preset: string; brand: string | null; font: string; radiusScale: number; smoothing: number; mode: SquircleMode }
const defaults: Saved = { dark: false, preset: 'iris', brand: null, font: '', radiusScale: 1, smoothing: 0.6, mode: 'auto' }
const state = reactive<Saved>({ ...defaults })

function apply() {
  if (state.brand) theme.setBrand(state.brand)
  else theme.applyPreset(state.preset)
  theme.setAppearance({ font: state.font || undefined, radiusScale: state.radiusScale === 1 ? undefined : state.radiusScale, smoothing: state.smoothing })
  config.squircle.mode = state.mode
  theme.name.value = state.dark ? 'dark' : 'light'
}
function save() {
  try { localStorage.setItem(STORAGE, JSON.stringify(state)) } catch { /* storage unavailable */ }
}
function update(p: Partial<Saved>) {
  Object.assign(state, p)
  apply()
  save()
}
const setMode = (v: string) => update({ dark: v === 'dark' })
const pickPreset = (k: string) => update({ preset: k, brand: null })
const pickBrand = (hex: string) => /^#[0-9a-f]{6}$/i.test(hex) && update({ brand: hex })
const pickFont = (f: string) => update({ font: f })
const fmtScale = (v: number) => `${v}×`
const setRadius = (v: number | number[]) => update({ radiusScale: Number(v) })
const setSmoothing = (v: number | number[]) => update({ smoothing: Number(v) })
const setRenderer = (v: SquircleMode) => update({ mode: v })
function reset() {
  Object.assign(state, defaults, { dark: isDark.value })
  theme.reset()
  apply()
  save()
}
const copied = ref(false)
async function copyConfig() {
  const code = `createSquirkle({
  theme: { defaultTheme: '${state.dark ? 'dark' : 'light'}', themes: ${state.brand ? `createBrandTheme('${state.brand}')` : `presetThemes('${state.preset}')`} },
  appearance: { ${[state.font && `font: "${state.font}"`, state.radiusScale !== 1 && `radiusScale: ${state.radiusScale}`, `smoothing: ${state.smoothing}`].filter(Boolean).join(', ')} },
  squircle: { mode: '${state.mode}' },
})`
  try { await navigator.clipboard.writeText(code); copied.value = true; setTimeout(() => (copied.value = false), 1500) } catch { /* clipboard blocked */ }
}

// Restore saved choices (guarded: storage may be unavailable).
try {
  const raw = localStorage.getItem(STORAGE)
  if (raw) Object.assign(state, { ...defaults, ...JSON.parse(raw) })
  else state.dark = isDark.value
} catch { /* ignore */ }
apply()
// Keep the saved mode in sync when the app-bar toggle is used.
watch(isDark, (d) => { if (state.dark !== d) { state.dark = d; save() } })
</script>

<style>
.doc-custom { display: flex; flex-direction: column; gap: 18px; padding: 8px 6px 24px; }
.doc-custom__head { display: flex; align-items: center; justify-content: space-between; }
.doc-custom__title { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
.doc-custom h4 { margin: 0 0 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--sq-muted); }
.doc-custom section { display: flex; flex-direction: column; gap: 8px; }
.doc-custom section > h4 { margin-bottom: 0; }
.doc-custom__presets { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.doc-custom__preset { --sq-r: var(--sq-radius-md); display: flex; align-items: center; gap: 8px; padding: 8px 10px; border: 1px solid var(--sq-border); background: var(--sq-surface); color: var(--sq-on-surface); font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; text-align: start; }
.doc-custom__preset:hover { border-color: var(--sq-border-strong); }
.doc-custom__preset.active { border-color: var(--sq-primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--sq-primary) 30%, transparent); }
.doc-custom__swatch { width: 20px; height: 20px; border-radius: 7px; flex: none; }
.doc-custom__preview { flex-direction: row !important; flex-wrap: wrap; align-items: center; padding: 12px; border-radius: var(--sq-radius-lg); background: var(--sq-surface-variant); }
.doc-custom__actions { display: flex; justify-content: space-between; }
.doc-custom .sq-color-picker { width: 100%; }
</style>
