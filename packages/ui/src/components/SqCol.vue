<template>
  <div class="sq-col" :class="classes"><slot /></div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

const bp = ['sm', 'md', 'lg', 'xl'] as const

export default defineComponent({
  name: 'SqCol',
  props: {
    cols: { type: [Number, String], default: undefined },
    sm: { type: [Number, String], default: undefined },
    md: { type: [Number, String], default: undefined },
    lg: { type: [Number, String], default: undefined },
    xl: { type: [Number, String], default: undefined },
    offset: { type: [Number, String], default: undefined },
  },
  setup(props) {
    const classes = computed(() => {
      const c: string[] = []
      if (props.cols) c.push(`sq-col-${props.cols}`)
      for (const b of bp) if (props[b]) c.push(`sq-col-${b}-${props[b]}`)
      if (props.offset) c.push(`sq-offset-${props.offset}`)
      return c
    })
    return { classes }
  },
})
</script>

<style>
.sq-col { flex: 1 0 0; max-width: 100%; padding: calc(var(--sq-gutter, 24px) / 2); min-width: 0; }
.sq-col-auto { flex: 0 0 auto; width: auto; }
.sq-col-1 { flex: 0 0 8.3333%; max-width: 8.3333%; } .sq-col-2 { flex: 0 0 16.6667%; max-width: 16.6667%; } .sq-col-3 { flex: 0 0 25%; max-width: 25%; }
.sq-col-4 { flex: 0 0 33.3333%; max-width: 33.3333%; } .sq-col-5 { flex: 0 0 41.6667%; max-width: 41.6667%; } .sq-col-6 { flex: 0 0 50%; max-width: 50%; }
.sq-col-7 { flex: 0 0 58.3333%; max-width: 58.3333%; } .sq-col-8 { flex: 0 0 66.6667%; max-width: 66.6667%; } .sq-col-9 { flex: 0 0 75%; max-width: 75%; }
.sq-col-10 { flex: 0 0 83.3333%; max-width: 83.3333%; } .sq-col-11 { flex: 0 0 91.6667%; max-width: 91.6667%; } .sq-col-12 { flex: 0 0 100%; max-width: 100%; }
.sq-offset-1 { margin-inline-start: 8.3333%; } .sq-offset-2 { margin-inline-start: 16.6667%; } .sq-offset-3 { margin-inline-start: 25%; } .sq-offset-4 { margin-inline-start: 33.3333%; }
@media (min-width: 600px) {
  .sq-col-sm-3 { flex: 0 0 25%; max-width: 25%; } .sq-col-sm-4 { flex: 0 0 33.3333%; max-width: 33.3333%; } .sq-col-sm-6 { flex: 0 0 50%; max-width: 50%; } .sq-col-sm-8 { flex: 0 0 66.6667%; max-width: 66.6667%; } .sq-col-sm-12 { flex: 0 0 100%; max-width: 100%; }
}
@media (min-width: 960px) {
  .sq-col-md-2 { flex: 0 0 16.6667%; max-width: 16.6667%; } .sq-col-md-3 { flex: 0 0 25%; max-width: 25%; } .sq-col-md-4 { flex: 0 0 33.3333%; max-width: 33.3333%; } .sq-col-md-5 { flex: 0 0 41.6667%; max-width: 41.6667%; }
  .sq-col-md-6 { flex: 0 0 50%; max-width: 50%; } .sq-col-md-7 { flex: 0 0 58.3333%; max-width: 58.3333%; } .sq-col-md-8 { flex: 0 0 66.6667%; max-width: 66.6667%; } .sq-col-md-9 { flex: 0 0 75%; max-width: 75%; } .sq-col-md-12 { flex: 0 0 100%; max-width: 100%; }
}
@media (min-width: 1280px) {
  .sq-col-lg-2 { flex: 0 0 16.6667%; max-width: 16.6667%; } .sq-col-lg-3 { flex: 0 0 25%; max-width: 25%; } .sq-col-lg-4 { flex: 0 0 33.3333%; max-width: 33.3333%; } .sq-col-lg-6 { flex: 0 0 50%; max-width: 50%; } .sq-col-lg-8 { flex: 0 0 66.6667%; max-width: 66.6667%; }
}
@media (min-width: 1920px) {
  .sq-col-xl-2 { flex: 0 0 16.6667%; max-width: 16.6667%; } .sq-col-xl-3 { flex: 0 0 25%; max-width: 25%; } .sq-col-xl-4 { flex: 0 0 33.3333%; max-width: 33.3333%; } .sq-col-xl-6 { flex: 0 0 50%; max-width: 50%; }
}
</style>
