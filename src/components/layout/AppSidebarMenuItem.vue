<script lang="ts" setup>
import type { MenuItem, SingleItem } from '@/components/layout'
import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-vue-next'

const props = defineProps<{
  item: SingleItem | MenuItem
}>()
const { isMobile } = useSidebar()
</script>
<template>
  <SidebarMenuItem>
    <SidebarMenuButton :is-active="item.type === 'item' && item?.active" as-child>
      <RouterLink v-if="item.type === 'item' && item?.to" :to="item.to">
        <component v-if="item.icon" :is="item.icon" />
        <span>{{ item.label }}</span>
      </RouterLink>
      <a v-else :href="item.type === 'item' ? item.path || '#' : '#'">
        <component v-if="item.icon" :is="item.icon" />
        <span>{{ item.label }}</span>
      </a>
    </SidebarMenuButton>
    <SidebarMenuBadge v-if="item.type === 'item' && item.badge">{{ item.badge }}</SidebarMenuBadge>
    <template v-if="item.type === 'menu'">
      <SidebarMenuSub v-if="item.submenu && item.children">
        <SidebarMenuSubItem v-for="(sub, index) in item.children" :key="index">
          <SidebarMenuSubButton>
            <a :href="sub.path || '#'">{{ sub.label }}</a>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
      <DropdownMenu v-else>
        <DropdownMenuTrigger as-child>
          <SidebarMenuAction show-on-hover>
            <MoreHorizontal />
            <span class="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          :align="isMobile ? 'end' : 'start'"
        >
          <DropdownMenuItem
            :variant="menu.variant"
            :class="menu.classes ||''"
            v-for="(menu, index) in item.children"
            :key="index"
          >
            <component v-if="menu.icon" :is="menu.icon" class="text-muted-foreground" />
            <span>{{ menu.label }}</span>
          </DropdownMenuItem>
          <!--          <DropdownMenuSeparator />-->
        </DropdownMenuContent>
      </DropdownMenu>
    </template>
  </SidebarMenuItem>
</template>
