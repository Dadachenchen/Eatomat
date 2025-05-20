<script lang="ts" setup>
import { ref } from 'vue';
import type { SheetItem } from './types/sheet';
import GoogleAuth from './components/GoogleAuth.vue';
import SlotMachine from './components/SlotMachine.vue';

const items = ref<SheetItem[]>([]);

function handleFileSelected(newItems: SheetItem[]) {
  items.value = newItems;
}

function resetSelection() {
  items.value = [];
}
</script>

<template>
  <div class="app">
    <div class="content">
      <h1>Eatomat</h1>
      <GoogleAuth v-if="!items.length" @file-selected="handleFileSelected" />
      <div v-else class="slot-container">
        <SlotMachine :items="items" />
        <button @click="resetSelection" class="reset-button">Neue Datei auswählen</button>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  height: 100%;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  background-color: #1a1a1a;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  color: #ffffff;
}

#app {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.app {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a1a1a;
}

.content {
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  text-align: center;
}

h1 {
  font-size: 3rem;
  margin: 0;
  color: #4CAF50;
  text-align: center;
  width: 100%;
}

.slot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  text-align: center;
}

.reset-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: #2d2d2d;
  color: white;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background: #4CAF50;
  transform: translateY(-2px);
}
</style>
