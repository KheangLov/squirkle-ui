<template>
  <div class="doc-page">
    <h1>Icons</h1>
    <p class="lead"><code>SqIcon</code> renders built-in icons, any of 200,000+ Iconify icons on demand (batched, cached), <code>$aliases</code> and raw SVG paths. <code>@squirkle/icons</code> adds a picker, alias presets and offline collections.</p>
    <SqRow>
      <SqCol cols="12" md="7"><SqIconPicker v-model="icon" /></SqCol>
      <SqCol cols="12" md="5">
        <SqCard title="Selected" variant="outlined">
          <div class="sq-pa-6 sq-d-flex sq-flex-column sq-align-center sq-gap-4">
            <SqAvatar :icon="icon" size="x-large" rounded="xl" />
            <div class="sq-d-flex sq-gap-2"><SqBtn :prepend-icon="icon">Button</SqBtn><SqChip :prepend-icon="icon">Chip</SqChip><SqBtn :icon="icon" variant="tonal" /></div>
            <code>&lt;SqIcon icon="{{ icon }}" /&gt;</code>
          </div>
        </SqCard>
      </SqCol>
    </SqRow>
    <h2>Offline use</h2>
    <pre class="doc-code" style="padding:16px;border-radius:16px">import { addCollection } from '@squirkle/icons'
import mdi from '@iconify-json/mdi/icons.json'
addCollection(mdi)                           // no network
createSquirkle({ icons: { api: false } })    // disable the Iconify API</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const icon = ref('lucide:rocket')
</script>
