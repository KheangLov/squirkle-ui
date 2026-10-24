<script lang="ts">
import { defineComponent } from 'vue'
import SqSelect from './SqSelect.vue'

/** SqSelect that also accepts free-typed values (Enter to add). */
export default defineComponent({
  ...(SqSelect as object),
  name: 'SqCombobox',
  props: { ...(SqSelect as unknown as { props: Record<string, unknown> }).props, combobox: { type: Boolean, default: true }, searchable: { type: Boolean, default: true } },
})
</script>
