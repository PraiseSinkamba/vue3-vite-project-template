<script lang="ts" setup>
import { type GroupItem, actionHas,handleAction } from '@/components/layout'
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'
import AppSidebarMenuItem from '@/components/layout/AppSidebarMenuItem.vue'
import AppSidebarMenuCollapsibleItem from '@/components/layout/AppSidebarMenuCollapsibleItem.vue'

defineProps<{
  group: GroupItem
}>()

</script>
<template>
  <SidebarGroup>
    <SidebarGroupLabel
      class="group/label text-xs"
    >{{ group.text }}
    </SidebarGroupLabel>
    <SidebarGroupAction v-if="group.action" @click="handleAction(group.action)">
      <component v-if="actionHas('icon', group.action)" :is="group.action.icon"></component>
      <span class="sr-only" v-if="actionHas('text', group.action)">{{
        group.action?.label || ''
      }}</span>
    </SidebarGroupAction>
    <SidebarMenu>
      <template v-for="(item, index) in group.children" :key="index">
        <AppSidebarMenuCollapsibleItem
          v-if="item.type === 'menu' && item.collapsible"
          :item="item"
        />
        <AppSidebarMenuItem v-else :item="item" />
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
