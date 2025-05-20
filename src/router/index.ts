import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Keine Routen mehr, da HomeView entfernt wurde
  ],
})

export default router
