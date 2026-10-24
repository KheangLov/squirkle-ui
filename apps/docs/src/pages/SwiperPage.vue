<template>
  <div class="doc-page">
    <h1>Swiper</h1>
    <p class="lead"><code>@squirkle-ui/swiper</code> — touch & mouse drag, true infinite loop without cloned slides, effects, autoplay, keyboard, breakpoints and three pagination styles.</p>
    <h2>Loop + autoplay</h2>
    <SqSwiper v-model="i" :items="photos" loop :autoplay="3500" :height="340">
      <template #default="{ item }"><div class="doc-slide" :style="{ backgroundImage: `url(${item.src})` }"><span>{{ item.title }}</span></div></template>
    </SqSwiper>
    <h2>Slides per view (responsive)</h2>
    <SqSwiper :items="photos" :slides-per-view="1" :breakpoints="{ 560: { slidesPerView: 2 }, 900: { slidesPerView: 3 } }" :space-between="12" :height="200" pagination="progress" rounded="lg">
      <template #default="{ item }"><SqImg :src="item.src" cover rounded="lg" height="100%" eager /></template>
    </SqSwiper>
    <h2>Effects</h2>
    <SqBtnToggle v-model="effect" mandatory class="sq-mb-4"><SqBtn v-for="e in ['fade','coverflow','cards']" :key="e" :value="e" variant="text">{{ e }}</SqBtn></SqBtnToggle>
    <SqSwiper :key="effect" :items="photos" :effect="effect" :height="300" pagination="fraction" :loop="effect !== 'cards'" :style="effect === 'cards' ? 'max-width:320px;margin:0 auto' : ''">
      <template #default="{ item }"><div class="doc-slide" :style="{ backgroundImage: `url(${item.src})` }"><span>{{ item.title }}</span></div></template>
    </SqSwiper>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const ids = ['1506744038136-46273834b3fb', '1470071459604-3b5ec3a7fe05', '1441974231531-c6227db76b6e', '1500530855697-b586d89ba3ee', '1469474968028-56623f02e42e', '1426604966848-d7adac402bff']
const photos = ids.map((id, i) => ({ src: `https://images.unsplash.com/photo-${id}?w=1200&q=60`, title: ['Valley', 'Forest', 'Sunbeams', 'Coast', 'Ridge', 'Lake'][i] }))
const i = ref(0)
const effect = ref<'fade' | 'coverflow' | 'cards'>('coverflow')
</script>

<style>
.doc-slide { height: 100%; background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 20px; border-radius: inherit; }
.doc-slide span { padding: 6px 14px; border-radius: 999px; background: rgb(0 0 0 / 0.45); color: #fff; font-weight: 600; backdrop-filter: blur(6px); }
.sq-swiper--coverflow .doc-slide, .sq-swiper--cards .doc-slide { border-radius: 28px; }
</style>
