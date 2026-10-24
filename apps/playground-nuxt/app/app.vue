<template>
  <SqApp>
    <SqAppBar title="Squirkle UI · Nuxt 4">
      <template #append>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/grid">Grid</NuxtLink>
        <SqBtn id="theme" :icon="isDark ? 'sun' : 'moon'" variant="text" color="surface" @click="toggle" />
      </template>
    </SqAppBar>
    <SqMain padded><NuxtPage /></SqMain>
  </SqApp>
</template>

<script setup lang="ts">
import { useTheme } from '@squirkle/ui'

const { isDark, toggle } = useTheme()
</script>

<style>
.sq-app-bar a { margin-inline-end: 12px; color: var(--sq-primary); }
</style>
