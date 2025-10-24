import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return savedPosition ?? { top: 0 }
  },
})/*
router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/admin')) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated()) {
      return next('/auth/admin-signin?redirect=' + to.path)
    }
    if (auth.isClient) {
      return next('/')
    }
  }
})*/
if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
