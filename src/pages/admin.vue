<script setup lang="ts">
import { RouterView } from 'vue-router/auto'
import {definePage } from 'unplugin-vue-router/runtime'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/components/layout/AdminLayout.vue'

definePage({
  beforeEnter: (to, from, next) => {
    const auth = useAuthStore()

    if (!auth.isAuthenticated) {
      if (to.path.startsWith('/auth/') || !to.path.startsWith('/admin/')) {
        next()
      } else {
        next(`/auth/admin-signin?redirect=${to.path}`)
      }
    } else {
      if (auth.isClient) {
        next('/')
      } else {
        next()
      }
    }
  },
})
</script>

<template>
  <AdminLayout>
    <RouterView />
  </AdminLayout>
</template>

<style></style>
