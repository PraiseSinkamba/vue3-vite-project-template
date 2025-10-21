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
})
// router.beforeEach((to, from) => {
//   const auth = useAuthStore()
//   if(to.path.startsWith("/admin")){

//   }
// })
if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
