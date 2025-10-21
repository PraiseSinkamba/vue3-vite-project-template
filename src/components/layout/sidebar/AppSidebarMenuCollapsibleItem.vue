<script lang="ts" setup>
import type { MenuItem, SeparatorItem, SingleItem } from '@/components/layout'
import {
  // SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem, SidebarSeparator
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Plus, Minus } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import SidebarLink from '@/components/layout/sidebar/SidebarLink.vue'

defineProps<{
  item: MenuItem
}>()
const route = useRoute()
const is_active = ((item: SingleItem|MenuItem|SeparatorItem) => {
  if (item.type !== 'item') return false
  else return item?.path === route.path || item.active
})
</script>
<template>
  <Collapsible class="group/collapsible" :default-open="item.defaultOpen">
    <SidebarMenuItem>
      <CollapsibleTrigger as-child>
        <SidebarMenuButton :is-active="is_active(item)" as-child>
          <a href="#">
            <component v-if="item.icon" :is="item.icon" />
            <span>{{ item.text }}</span>
            <Plus class="ml-auto group-data-[state=open]/collapsible:hidden" />
            <Minus class="ml-auto group-data-[state=closed]/collapsible:hidden" />
          </a>
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <!--       <SidebarMenuBadge v-if="item.type === 'item' && item.badge">{{ item.badge }}</SidebarMenuBadge>-->
      <CollapsibleContent>
        <SidebarMenuSub v-if="item.children">
          <SidebarMenuSubItem v-for="(sub, index) in item.children" :key="index">
            <SidebarMenuSubButton v-if="sub.type==='item'" :is-active="is_active(sub)">
              <SidebarLink :item="sub"/>
            </SidebarMenuSubButton>
            <SidebarSeparator v-else />
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenuItem>
  </Collapsible>
</template>
