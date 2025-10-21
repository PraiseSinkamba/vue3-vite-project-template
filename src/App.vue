<script setup lang="ts">
import { PiniaColadaDevtools } from '@pinia/colada-devtools'
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
onMounted(() => {
  auth.initialize()
})
</script>

<template>
  <RouterView />
  <PiniaColadaDevtools />
</template>

<style scoped>

</style>
