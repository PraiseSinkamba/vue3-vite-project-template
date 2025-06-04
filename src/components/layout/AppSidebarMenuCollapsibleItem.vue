<script lang="ts" setup>
import type { MenuItem } from '@/components/layout/index.ts'
import {
  // SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {Plus,Minus} from 'lucide-vue-next'

defineProps<{
  item: MenuItem
}>()

</script>
<template>
   <Collapsible class="group/collapsible">
     <SidebarMenuItem>
       <CollapsibleTrigger as-child>
         <SidebarMenuButton as-child>
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
             <SidebarMenuSubButton>
               <a :href="sub.path || '#'" class="size-full">{{ sub.text }}</a>
             </SidebarMenuSubButton>
           </SidebarMenuSubItem>
         </SidebarMenuSub>
       </CollapsibleContent>
     </SidebarMenuItem>
   </Collapsible>
</template>

