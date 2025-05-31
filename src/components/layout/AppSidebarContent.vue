<script setup lang="ts">
import type { SidebarItem } from '@/components/layout/index.ts'
import { SidebarSeparator } from '@/components/ui/sidebar'
import AppSidebarGroup from '@/components/layout/AppSidebarGroup.vue'
import AppSidebarGroupCollapsible from '@/components/layout/AppSidebarGroupCollapsible.vue'

defineProps<{
  groups: SidebarItem[]
}>()
</script>

<template>
  <template v-for="(item, index) in groups" :key="index">
    <template v-if="item.type === 'group'">
      <AppSidebarGroupCollapsible v-if="item.collapsible" :group="item" />
      <AppSidebarGroup v-else :group="item" />
    </template>
    <SidebarSeparator v-else />
  </template>
</template>
