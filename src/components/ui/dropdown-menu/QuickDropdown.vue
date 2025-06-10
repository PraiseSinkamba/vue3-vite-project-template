<script setup lang="ts">

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu/index.ts'
import { useSidebar } from '@/components/ui/sidebar'
import type { SeparatorItem, SingleItem } from '@/components/layout'
import type { Action } from '@/components/ui/page'

const { isMobile } = useSidebar()
defineProps<{
  items: (SingleItem | SeparatorItem|Action)[]
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
        <DropdownMenuSeparator v-if="'type' in menu && menu.type === 'separator'" />
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
