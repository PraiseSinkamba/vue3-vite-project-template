<script setup lang="ts">
import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail, SidebarContent
} from '@/components/ui/sidebar'
import type { SidebarProps } from '@/components/layout'
import AppSidebarContent from '@/components/layout/AppSidebarContent.vue'

const {
  collapsible,
  side = 'left',
  variant,
  rail = true,
} = defineProps<SidebarProps>()
</script>

<template>
  <Sidebar :collapsible="collapsible" :variant="variant" :side="side">
    <SidebarHeader v-if="$slots.header">
      <SidebarMenu>
        <SidebarMenuItem>
          <slot name="header" />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent class="overflow-x-hidden">
      <AppSidebarContent :groups="content"/>
    </SidebarContent>
    <SidebarFooter v-if="$slots.footer">
      <SidebarMenu>
        <SidebarMenuItem>
          <slot name="footer" />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail v-if="rail" />
  </Sidebar>
</template>

<style scoped></style>
