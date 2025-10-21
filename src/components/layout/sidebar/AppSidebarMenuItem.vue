<script lang="ts" setup>
import type { MenuItem, SeparatorItem, SingleItem } from '@/components/layout'
import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { QuickDropdown } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import SidebarLink from '@/components/layout/sidebar/SidebarLink.vue'

const { item } = defineProps<{
  item: SingleItem | MenuItem
}>()
const route = useRoute()
const is_active = ((item: SingleItem|MenuItem|SeparatorItem) => {
  if (item.type !== 'item') return false
  else return item?.path === route.path || item.active
})
</script>
<template>
  <SidebarMenuItem>
    <SidebarMenuButton :is-active="is_active(item)" as-child>
      <SidebarLink :item="item"/>
    </SidebarMenuButton>
    <SidebarMenuBadge v-if="item.type === 'item' && item.badge">{{ item.badge }}</SidebarMenuBadge>
    <template v-if="item.type === 'menu'">
      <SidebarMenuSub v-if="item.submenu && item.children">
        <SidebarMenuSubItem v-for="(sub, index) in item.children" :key="index">
          <SidebarMenuSubButton :is-active="is_active(sub)" as-child>
            <SidebarLink :item="sub"/>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
      <QuickDropdown v-else :items="item.children">
        <SidebarMenuAction show-on-hover>
          <MoreHorizontal />
          <span class="sr-only">More</span>
        </SidebarMenuAction>
      </QuickDropdown>
    </template>
  </SidebarMenuItem>
</template>
