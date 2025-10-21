<script setup lang="ts">
import { useDarkMode } from '@/composables/useDarkMode.ts'
import {Sun, Moon} from 'lucide-vue-next'
const { toggleTheme } = useDarkMode()
</script>

<template>
  <Button variant="ghost" @click="toggleTheme">
    <Sun class="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    <Moon class="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
  </Button>
</template>

<style scoped>

</style>
