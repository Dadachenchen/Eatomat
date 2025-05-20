<template>
  <div class="slot-machine">
    <div class="slot-container">
      <div class="slot" :class="{ spinning }" :style="slotStyle">
        <div v-for="(item, index) in repeatedItems" :key="index" class="slot-item">
          <img :src="item.imageUrl" :alt="item.title" @error="setFallbackImg" />
          <div class="slot-label">{{ item.title }}</div>
        </div>
      </div>
    </div>
    <button @click="spin" :disabled="spinning || !imagesLoaded">Drehen</button>
    <div v-if="result" class="result">Gewählt: {{ result.title }}</div>
    <div v-if="!imagesLoaded" class="loading">Bilder werden geladen...</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onUnmounted, watch } from 'vue';
import type { SheetItem } from '../types/sheet';

const props = defineProps<{
  items: SheetItem[];
}>();

const spinning = ref(false);
const result = ref<SheetItem | null>(null);
const selectedIndex = ref(0);
const imagesLoaded = ref(false);

let animationFrame: number | null = null;
let spinStartTime = 0;
const fastSpinDuration = 2000; // 2 Sekunden
let targetIdx = 0;
let lastUpdate = 0;
let currentDelay = 60;

const fallbackImg = '/fallback.png'; // Lege ein Platzhalterbild ins public-Verzeichnis

// Bilder vorladen
function preloadImages(urls: string[]): Promise<void> {
  return Promise.all(
    urls.map(
      url =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Fehler ignorieren
          img.src = url;
        })
    )
  ).then(() => { imagesLoaded.value = true; });
}

watch(
  () => props.items,
  (newItems) => {
    imagesLoaded.value = false;
    if (newItems.length > 0) {
      preloadImages(newItems.map(item => item.imageUrl));
    }
  },
  { immediate: true }
);

const repeatedItems = computed(() => {
  return Array(20).fill(props.items).flat();
});

const slotStyle = computed(() => {
  return {
    transform: `translateX(${-selectedIndex.value * 400}px)`
  };
});

function getRandomTargetIndex(): number {
  const chosen = Math.floor(Math.random() * props.items.length);
  const target = repeatedItems.value.findIndex(item => item.title === props.items[chosen].title);
  return target;
}

function animateSpin(now: number) {
  if (!spinning.value) return;
  if (!lastUpdate) lastUpdate = now;
  const elapsed = now - spinStartTime;

  // Geschwindigkeit bleibt konstant
  currentDelay = 60;

  if (now - lastUpdate >= currentDelay) {
    selectedIndex.value = (selectedIndex.value + 1) % repeatedItems.value.length;
    lastUpdate = now;
  }

  // Stoppen, wenn schnelle Phase vorbei
  if (elapsed >= fastSpinDuration) {
    spinning.value = false;
    selectedIndex.value = targetIdx;
    result.value = repeatedItems.value[targetIdx];
    animationFrame = null;
    return;
  }

  animationFrame = requestAnimationFrame(animateSpin);
}

async function spin() {
  if (spinning.value || props.items.length === 0 || !imagesLoaded.value) return;
  spinning.value = true;
  result.value = null;
  lastUpdate = 0;
  spinStartTime = performance.now();
  targetIdx = getRandomTargetIndex();
  animationFrame = requestAnimationFrame(animateSpin);
}

function setFallbackImg(e: Event) {
  const target = e.target as HTMLImageElement | null;
  if (target) target.src = fallbackImg;
}

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
});
</script>

<style scoped>
.slot-machine {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
}

.slot-container {
  width: 400px;
  height: 400px;
  border: 3px solid #404040;
  border-radius: 20px;
  background: #2d2d2d;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  position: relative;
  margin: 0 auto;
}

.slot {
  display: flex;
  position: absolute;
  left: 0;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  height: 100%;
}

.slot.spinning {
  animation: spin 3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slot-item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #2d2d2d;
  text-align: center;
}

.slot-item img {
  width: 75%;
  height: 75%;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.slot-label {
  margin-top: 1rem;
  font-weight: bold;
  font-size: 1.2rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #ffffff;
  text-align: center;
}

.result {
  font-size: 1.8rem;
  color: #4CAF50;
  font-weight: bold;
  text-align: center;
  width: 100%;
}

button {
  padding: 1rem 3rem;
  font-size: 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px #0002;
}

button:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px #0003;
}

button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  background: #ccc;
  transform: none;
  box-shadow: none;
}

@keyframes spin {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(calc(-400px * 20));
  }
}
</style>