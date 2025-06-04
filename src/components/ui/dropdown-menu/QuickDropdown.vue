<script setup lang="ts">

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu/index.ts'
import { useSidebar } from '@/components/ui/sidebar'
import type { SeparatorItem, SingleItem } from '@/components/layout'

const { isMobile } = useSidebar()
defineProps<{
  items: (SingleItem | SeparatorItem)[]
}>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <slot></slot>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="w-56 rounded-lg"
      :side="isMobile ? 'bottom' : 'right'"
      :align="isMobile ? 'end' : 'start'"
    >
      <template v-for="(menu, index) in items" :key="index">
        <DropdownMenuSeparator v-if="menu.type === 'separator'" />
        <DropdownMenuItem @click="menu?.onClick" v-else :variant="menu.variant" :class="menu.classes || ''">
          <component v-if="menu.icon" :is="menu.icon" class="text-muted-foreground" />
          <span>{{ menu.text }}</span>
        </DropdownMenuItem>
      </template>
      <!--          <DropdownMenuSeparator />-->
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>

</style>
