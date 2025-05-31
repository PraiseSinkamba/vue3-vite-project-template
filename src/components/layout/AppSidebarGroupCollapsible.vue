<script lang="ts" setup>
import { type GroupItem, actionHas } from '@/components/layout'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-vue-next'
import AppSidebarMenuItem from '@/components/layout/AppSidebarMenuItem.vue'
import AppSidebarMenuCollapsibleItem from '@/components/layout/AppSidebarMenuCollapsibleItem.vue'

defineProps<{
  group: GroupItem
}>()
</script>
<template>
  <Collapsible class="group/collapsible" :default-open="group.defaultOpen">
    <SidebarGroup>
      <SidebarGroupLabel class="group/label text-xs" as-child>
        <CollapsibleTrigger>
          <!--          <component v-if="group.action?.icon" :is="group.icon"></component>-->
          {{ group.label }}
          <ChevronDown
            class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
          />
        </CollapsibleTrigger>
      </SidebarGroupLabel>
      <CollapsibleContent>
        <SidebarGroupContent>
          <SidebarMenu>
            <template v-for="(item, index) in group.children" :key="index">
              <AppSidebarMenuCollapsibleItem
                v-if="item.type === 'menu' && item.collapsible"
                :item="item"
              />
              <AppSidebarMenuItem v-else :item="item" />
            </template>
          </SidebarMenu>
        </SidebarGroupContent>
      </CollapsibleContent>
    </SidebarGroup>
  </Collapsible>
</template>
