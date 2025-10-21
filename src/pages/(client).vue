<script setup lang="ts">
import ClientLayout from '@/components/layout/ClientLayout.vue'
import { useDarkMode } from '@/composables/useDarkMode';
import { onMounted } from 'vue';
const theme = useDarkMode()
onMounted(()=>{
  theme.setDarkMode(false)
})
</script>
<template>
  <ClientLayout>
    <RouterView />
  </ClientLayout>
</template>
