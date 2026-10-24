<script lang="ts">
import { defineComponent } from 'vue'
import SqSelect from './SqSelect.vue'

/** SqSelect with type-to-filter enabled. */
export default defineComponent({
  ...(SqSelect as object),
  name: 'SqAutocomplete',
  props: { ...(SqSelect as unknown as { props: Record<string, unknown> }).props, searchable: { type: Boolean, default: true } },
})
</script>
