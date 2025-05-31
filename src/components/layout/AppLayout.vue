<script setup lang="ts">
import { createAction, type SidebarItem } from '@/components/layout'
import { SaveIcon, LayoutDashboardIcon, FileSpreadsheetIcon, SettingsIcon,User,LogOut } from 'lucide-vue-next'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { RouterView } from 'vue-router'
import { ref } from 'vue'
// import HelloWorld from '@/components/HelloWorld.vue'

const saveAction = createAction(() => console.log('Saving...'), {
  label: 'Save',
  icon: SaveIcon,
})

const exportMenu = createAction(() => console.log('Export menu opened'), {
  label: 'Export',
  items: [
    { label: 'PDF', action: () => console.log('Export PDF') },
    { label: 'CSV', action: () => console.log('Export CSV') },
  ],
})

// Sidebar items definition
const sidebarContent = ref<SidebarItem[]>([
  {
    type: 'group',
    label: 'Documents',
    icon: FileSpreadsheetIcon,
    collapsible: true,
    defaultOpen: true,
    children: [
      {
        type: 'item',
        label: 'Dashboard',
        icon: LayoutDashboardIcon,
        to: '/about',
      },
      {
        type: 'item',
        label: 'Templates',
        action: saveAction,
        badge: 5,
        active: true,
      },
      {
        type: 'item',
        label: 'Reports',
        action: exportMenu,
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    type: 'group',
    label: 'Settings',
    action: {
      icon: FileSpreadsheetIcon,
      action: () => console.log('Export PDF'),
    },
    children: [
      {
        type: 'menu',
        label: 'Settings',
        defaultOpen: true,
        icon: SettingsIcon,
        children: [
          {
            type: 'item',
            icon: User,
            label: 'Account',
            action: () => console.log('Navigate to Profile'),
          },
          {
            type: 'item',
            variant:'destructive',
            icon: LogOut,
            label: 'Logout',
            action: () => console.log('Logout'),
          },
        ],
      },
    ],
  },
])
</script>

<template>
  <SidebarProvider>
    <AppSidebar :rail="false" variant="inset" :content="sidebarContent" />
    <SidebarInset>
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped></style>
