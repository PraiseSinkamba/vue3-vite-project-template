<script setup lang="ts">
import { createAction, type SidebarItem } from '@/components/layout'
import { SaveIcon, LayoutDashboardIcon, FileSpreadsheetIcon, SettingsIcon,User,LogOut } from 'lucide-vue-next'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { RouterView } from 'vue-router'
import { ref } from 'vue'
// import HelloWorld from '@/components/HelloWorld.vue'

const saveAction = createAction(() => console.log('Saving...'), {
  text: 'Save',
  icon: SaveIcon,
})

const exportMenu = createAction(() => console.log('Export menu opened'), {
  text: 'Export',
  items: [
    { text: 'PDF', onClick: () => console.log('Export PDF') },
    { text: 'CSV', onClick: () => console.log('Export CSV') },
  ],
})

// Sidebar items definition
const sidebarContent = ref<SidebarItem[]>([
  {
    type: 'group',
    text: 'Documents',
    icon: FileSpreadsheetIcon,
    collapsible: true,
    defaultOpen: true,
    children: [
      {
        type: 'item',
        text: 'tasks',
        icon: LayoutDashboardIcon,
        to: '/tasks',
      },
      {
        type: 'item',
        text: 'Templates',
        onClick: saveAction,
        badge: 5,
        active: true,
      },
      {
        type: 'item',
        text: 'Reports',
        onClick: exportMenu,
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    type: 'group',
    text: 'Settings',
    action: {
      icon: FileSpreadsheetIcon,
      onClick: () => console.log('Export PDF'),
    },
    children: [
      {
        type: 'menu',
        text: 'Settings',
        defaultOpen: true,
        icon: SettingsIcon,
        children: [
          {
            type: 'item',
            icon: User,
            text: 'Account',
            onClick: () => console.log('Navigate to Profile'),
          },
          {
            type: 'separator'
          },
          {
            type: 'item',
            variant:'destructive',
            icon: LogOut,
            text: 'Logout',
            onClick: () => console.log('Logout'),
          },
        ],
      },
    ],
  },
])
</script>

<template>
  <SidebarProvider>
    <AppSidebar :rail="false" collapsible="icon" :content="sidebarContent" />
    <SidebarInset>
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped></style>
