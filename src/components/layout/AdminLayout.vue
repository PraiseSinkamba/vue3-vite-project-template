<script setup lang="ts">
import { createAction, type SidebarItem } from '@/components/layout'
import {
  LayoutDashboardIcon,
  User,
  Calendar,
  BadgeDollarSign,
  Package,
  ChartColumn,
  GalleryHorizontal,
  ImageIcon,
  Settings,
} from 'lucide-vue-next'
import { SidebarInset, SidebarProvider, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import AppSidebar from '@/components/layout/sidebar/AppSidebar.vue'
import { ref } from 'vue'
import { provideLayoutContext } from './utils.ts'
import ThemeSwitcher from '../ThemeSwitcher.vue'
import Separator from '../ui/separator/Separator.vue'
import { RouterLink } from 'vue-router'

const title = ref('')
const showSideMenuButton = ref(true)
provideLayoutContext({
  title,
  setTitle: (newTitle: string) => (title.value = newTitle),
  showSideMenuButton: () => (showSideMenuButton.value = true),
  hideSideMenuButton: () => (showSideMenuButton.value = false),
})
// Sidebar items definition
const sidebarContent = ref<SidebarItem[]>([
  {
    type: 'group',
    text: 'Menu',
    collapsible: false,
    children: [
      {
        type: 'item',
        text: 'Dashboard',
        icon: LayoutDashboardIcon,
        to: '/admin',
      },
      {
        type: 'item',
        text: 'Appointments',
        icon: Calendar,
        to: '/admin/appointments',
      },
      {
        type: 'item',
        text: 'Clients',
        icon: User,
        to: '/admin/clients',
      },
      {
        type: 'item',
        text: 'Gallery',
        icon: ImageIcon,
        to: '/admin/gallery',
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    type: 'group',
    text: 'Products & Services',
    children: [
      {
        type: 'item',
        text: 'Services',
        icon: BadgeDollarSign,
        to: '/admin/services',
      },
      {
        type: 'item',
        text: 'Inventory',
        icon: Package,
        to: '/admin/inventory',
      },
      {
        type: 'item',
        text: 'Reports',
        icon: ChartColumn,
        to: '/admin/reports',
      },
    ],
  },
])
</script>

<template>
  <SidebarProvider>
    <AppSidebar
      :variant="'inset'"
      :rail="false"
      collapsible="offcanvas"
      :content="sidebarContent"
    >
      <template #footer>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton as-child tooltip="Settings">
              <RouterLink to="/admin/settings">
                <Settings />
                <span>Settings</span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </template>
    </AppSidebar>
    <SidebarInset>
      <header
        class="flex flex-row border-b shrink-0 items-center justify-between py-1 px-2 gap-2 top-0 sticky z-10 bg-background"
      >
        <div class="flex items-center gap-1 flex-row">
          <SidebarTrigger v-if="showSideMenuButton" />
          <Separator v-if="showSideMenuButton" orientation="vertical" class="mr-2 h-4" />
          <h1>{{ title }}</h1>
        </div>
        <div class="flex flex-row gap-2">
          <ThemeSwitcher />
        </div>
      </header>
      <div class="flex-1 p-2">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped></style>
