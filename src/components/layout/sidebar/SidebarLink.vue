<script setup lang="ts">
import type { SingleItem, MenuItem } from '@/components/layout'
import { useSidebar } from '@/components/ui/sidebar';
import { useRouter } from 'vue-router'

const { setOpen } = useSidebar()
const { item } = defineProps<{
  item: SingleItem | MenuItem
}>()
const router = useRouter()
function handleAction() {
  if (item.type === 'item') {
    try {
      if (item.onClick) item.onClick()
      else if (item.path) window.open(item.path)
      else if (item.to) router.push(item.to)
    } finally {
      setOpen(false)
    }
  }
}
</script>

<template>
  <RouterLink v-if="item.type === 'item' && item?.to" :to="item.to">
    <component v-if="item.icon" :is="item.icon" />
    <span>{{ item.text }}</span>
  </RouterLink>
  <a v-else-if="item?.path" :href="item.type === 'item' ? item.path || '#' : '#'">
    <component v-if="item.icon" :is="item.icon" />
    <span>{{ item.text }}</span>
  </a>
  <a v-else @click="handleAction">
    <component v-if="item.icon" :is="item.icon" />
    <span>{{ item.text }}</span>
  </a>
</template>

<style scoped></style>
