<script lang="ts">
import { defineComponent } from 'vue'
import SqDialog from './SqDialog.vue'

/** SqDialog anchored to the bottom edge with a drag handle. */
export default defineComponent({
  ...(SqDialog as object),
  name: 'SqBottomSheet',
  props: { ...(SqDialog as unknown as { props: Record<string, unknown> }).props, position: { type: String, default: 'bottom' } },
})
</script>
