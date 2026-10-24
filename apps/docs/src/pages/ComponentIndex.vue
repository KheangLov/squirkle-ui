<template>
  <div class="doc-page">
    <h1>Components</h1>
    <p class="lead">{{ registry.length }} documented components. Click one for live examples and its generated API table.</p>
    <div v-for="cat in categories" :key="cat">
      <h2>{{ cat }}</h2>
      <div class="doc-grid">
        <SqCard v-for="e in registry.filter((r) => r.category === cat)" :key="e.slug" :title="e.name" :subtitle="e.pkg" :text="e.description" :to="e.route ?? '/components/' + e.slug" variant="outlined" hover />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { categories, registry } from '../registry'
</script>
