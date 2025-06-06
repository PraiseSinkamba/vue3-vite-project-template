import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import TaskExample from '@/views/tasks/TaskExample.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children:[
        {
          path: '/',
          name: 'home',
          component: HomeView,
        },
        {
          path: '/tasks',
          name: 'tasks',
          component: TaskExample,
        },
        {
          path: '/about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/AboutView.vue'),
        }
      ]
    },
  ],
})

export default router
