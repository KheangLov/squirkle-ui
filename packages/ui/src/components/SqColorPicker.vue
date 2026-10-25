<template>
  <div class="sq-color-picker sq-surface" :class="{ 'sq-color-picker--flat': flat }">
    <SqShape v-if="!flat" />
    <div ref="area" class="sq-color-picker__area sq-squircle" :style="{ background: `hsl(${hsv.h} 100% 50%)` }" @pointerdown="startDrag($event, 'area')">
      <div class="sq-color-picker__area-white"></div>
      <div class="sq-color-picker__area-black"></div>
      <div class="sq-color-picker__handle" :style="{ left: hsv.s * 100 + '%', top: (1 - hsv.v) * 100 + '%', background: hexNoAlpha }"></div>
    </div>
    <div class="sq-color-picker__row">
      <div class="sq-color-picker__preview sq-squircle"><div :style="{ background: rgbaString }"></div></div>
      <div class="sq-color-picker__sliders">
        <div ref="hue" class="sq-color-picker__slider sq-color-picker__slider--hue" @pointerdown="startDrag($event, 'hue')"><div class="sq-color-picker__knob" :style="{ left: (hsv.h / 360) * 100 + '%' }"></div></div>
        <div v-if="alpha" ref="alphaEl" class="sq-color-picker__slider sq-color-picker__slider--alpha" :style="{ '--sq-cp-color': hexNoAlpha }" @pointerdown="startDrag($event, 'alpha')"><div class="sq-color-picker__knob" :style="{ left: hsv.a * 100 + '%' }"></div></div>
      </div>
    </div>
    <div class="sq-color-picker__inputs">
      <input class="sq-color-picker__hex sq-squircle" :value="hexValue" spellcheck="false" aria-label="Hex color" @change="onHex" />
    </div>
    <div v-if="swatches.length" class="sq-color-picker__swatches">
      <button v-for="c in swatches" :key="c" type="button" class="sq-color-picker__swatch sq-squircle" :class="{ active: c.toLowerCase() === hexValue.toLowerCase() }" :style="{ background: c }" :aria-label="c" @click="setHex(c)"></button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { clamp } from '@squirkle-ui/core'
import SqShape from './SqShape.vue'
import { useProxiedModel, vModel } from '../composables/model'

interface HSVA { h: number; s: number; v: number; a: number }

function hexToHsva(hex: string): HSVA | null {
  const m = hex.replace('#', '').trim()
  const full = m.length === 3 || m.length === 4 ? m.split('').map((c) => c + c).join('') : m
  if (!/^([0-9a-f]{6}|[0-9a-f]{8})$/i.test(full)) return null
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
  const a = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  let h = 0
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max, a }
}
function hsvaToRgb({ h, s, v }: HSVA): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
  }
  return [f(5), f(3), f(1)]
}
const hex2 = (n: number) => n.toString(16).padStart(2, '0')

/** v-model: hex string (`#rrggbb`, or `#rrggbbaa` with alpha). */
export default defineComponent({
  name: 'SqColorPicker',
  components: { SqShape },
  model: vModel,
  props: {
    modelValue: { type: String, default: '#5b5bf0' },
    alpha: Boolean,
    flat: Boolean,
    swatches: { type: Array as PropType<string[]>, default: () => ['#5b5bf0', '#7c5cff', '#ff5c8a', '#e5484d', '#e8920c', '#f5d90a', '#1f9d63', '#1e88e5', '#0bb5c4', '#171a26'] },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useProxiedModel<string>(props, emit)
    const hsv = ref<HSVA>(hexToHsva(model.value) ?? { h: 240, s: 0.6, v: 0.9, a: 1 })
    let selfUpdate = false
    watch(model, (v) => {
      if (selfUpdate) return void (selfUpdate = false)
      const n = v && hexToHsva(v)
      if (n) hsv.value = n
    })
    const rgb = computed(() => hsvaToRgb(hsv.value))
    const hexNoAlpha = computed(() => `#${rgb.value.map(hex2).join('')}`)
    const hexValue = computed(() => (props.alpha && hsv.value.a < 1 ? hexNoAlpha.value + hex2(Math.round(hsv.value.a * 255)) : hexNoAlpha.value))
    const rgbaString = computed(() => `rgb(${rgb.value.join(' ')} / ${hsv.value.a})`)
    const commit = () => {
      selfUpdate = true
      model.value = hexValue.value
    }
    const area = ref<HTMLElement | null>(null)
    const hue = ref<HTMLElement | null>(null)
    const alphaEl = ref<HTMLElement | null>(null)
    let mode: 'area' | 'hue' | 'alpha' | null = null
    const update = (e: PointerEvent) => {
      const el = mode === 'area' ? area.value : mode === 'hue' ? hue.value : alphaEl.value
      if (!el) return
      const r = el.getBoundingClientRect()
      const x = clamp((e.clientX - r.left) / r.width, 0, 1)
      const y = clamp((e.clientY - r.top) / r.height, 0, 1)
      if (mode === 'area') hsv.value = { ...hsv.value, s: x, v: 1 - y }
      else if (mode === 'hue') hsv.value = { ...hsv.value, h: x * 360 }
      else hsv.value = { ...hsv.value, a: Math.round(x * 100) / 100 }
      commit()
    }
    const stop = () => {
      mode = null
      window.removeEventListener('pointermove', update)
      window.removeEventListener('pointerup', stop)
    }
    const startDrag = (e: PointerEvent, m: 'area' | 'hue' | 'alpha') => {
      mode = m
      update(e)
      window.addEventListener('pointermove', update)
      window.addEventListener('pointerup', stop)
      e.preventDefault()
    }
    onBeforeUnmount(stop)
    const setHex = (c: string) => {
      const n = hexToHsva(c)
      if (n) { hsv.value = n; commit() }
    }
    const onHex = (e: Event) => setHex((e.target as HTMLInputElement).value)
    return { hsv, area, hue, alphaEl, hexNoAlpha, hexValue, rgbaString, startDrag, setHex, onHex }
  },
})
</script>

<style>
.sq-color-picker { --sq-bg: var(--sq-surface-raised); --sq-r: var(--sq-radius-xl); --sq-bd: var(--sq-border); --sq-bw: 1px; display: inline-flex; flex-direction: column; gap: var(--sq-space-3); width: 280px; max-width: 100%; padding: var(--sq-space-3); }
.sq-color-picker--flat { --sq-bw: 0px; --sq-bg: transparent; padding: 0; }
.sq-color-picker__area { --sq-r: var(--sq-radius-md); position: relative; height: 160px; cursor: crosshair; touch-action: none; overflow: hidden; }
.sq-color-picker__area-white { position: absolute; inset: 0; background: linear-gradient(to right, #fff, transparent); }
.sq-color-picker__area-black { position: absolute; inset: 0; background: linear-gradient(to top, #000, transparent); }
.sq-color-picker__handle { position: absolute; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 1px rgb(0 0 0 / 0.2), 0 2px 4px rgb(0 0 0 / 0.3); pointer-events: none; }
.sq-color-picker__row { display: flex; align-items: center; gap: var(--sq-space-3); }
.sq-color-picker__preview { --sq-r: var(--sq-radius-sm); width: 36px; height: 36px; flex: none; overflow: hidden; background: repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 10px 10px; }
.sq-color-picker__preview > div { width: 100%; height: 100%; }
.sq-color-picker__sliders { flex: 1; display: flex; flex-direction: column; gap: var(--sq-space-2); }
.sq-color-picker__slider { position: relative; height: 12px; border-radius: var(--sq-radius-pill); cursor: pointer; touch-action: none; }
.sq-color-picker__slider--hue { background: linear-gradient(to right, red, #ff0, lime, cyan, blue, #f0f, red); }
.sq-color-picker__slider--alpha { background: linear-gradient(to right, transparent, var(--sq-cp-color)), repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 8px 8px; }
.sq-color-picker__knob { position: absolute; top: 50%; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgb(0 0 0 / 0.35); pointer-events: none; }
.sq-color-picker__hex { --sq-r: var(--sq-radius-md); box-sizing: border-box; width: 100%; height: var(--sq-control-md); padding: 0 var(--sq-space-3); border: 1px solid var(--sq-border-strong); background: var(--sq-surface); color: var(--sq-on-surface); font-family: var(--sq-font-mono); font-size: var(--sq-text-sm); text-transform: uppercase; outline: none; }
.sq-color-picker__hex:focus { border-color: var(--sq-primary); box-shadow: var(--sq-focus-ring); }
.sq-color-picker__swatches { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; }
.sq-color-picker__swatch { --sq-r: 6px; aspect-ratio: 1; border: 0; cursor: pointer; transition: transform var(--sq-duration-fast) var(--sq-ease-spring); }
.sq-color-picker__swatch:hover, .sq-color-picker__swatch.active { transform: scale(1.18); box-shadow: 0 0 0 2px var(--sq-surface), 0 0 0 3.5px var(--sq-on-surface); }
</style>
