<template>
  <form class="sq-form" novalidate @submit.prevent="onSubmit" @reset.prevent="reset"><slot :validate="validate" :reset="reset" /></form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { provideForm } from '../composables/validation'

/** Collects child field validation. `@submit` receives { valid, errors }. Expose via ref: validate(), reset(), resetValidation(). */
export default defineComponent({
  name: 'SqForm',
  props: { disabled: Boolean, readonly: Boolean },
  emits: ['submit'],
  setup(props, { emit }) {
    const form = provideForm(props)
    const onSubmit = async () => emit('submit', await form.validate())
    return { ...form, onSubmit }
  },
})
</script>

<style>
.sq-form { display: flex; flex-direction: column; gap: var(--sq-space-3); }
</style>
