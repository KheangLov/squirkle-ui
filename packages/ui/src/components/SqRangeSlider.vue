<script lang="ts">
import { defineComponent } from 'vue'
import SqSlider from './SqSlider.vue'

/** Two-thumb slider: v-model = [start, end]. Same props as SqSlider. */
export default defineComponent({
  ...(SqSlider as object),
  name: 'SqRangeSlider',
  props: { ...(SqSlider as unknown as { props: Record<string, unknown> }).props, range: { type: Boolean, default: true } },
})
</script>
