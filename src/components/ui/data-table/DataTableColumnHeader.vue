<script setup lang="ts" generic="T">
import type { Column } from '@tanstack/vue-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon } from '@radix-icons/vue'

interface DataTableColumnHeaderProps {
  column: Column<T, unknown>
  title: string
}

const {title,column} =defineProps<DataTableColumnHeaderProps>()

function toggleSorting() {
  if(column.getCanSort()){
    column.toggleSorting(null)
  }
}
</script>

<template>
  <div :class="cn('flex items-center space-x-2', $attrs.class ?? '')">
    <!-- ContextMenu wrapper for the dropdown button -->
    <ContextMenu>
      <ContextMenuTrigger>
        <Button
          variant="ghost"
          size="sm"
          class="h-8 w-full justify-between pr-0"
          @click="toggleSorting"
        >
          <span>{{ title }}</span>
          <!-- Sorting icons based on current state -->
          <template v-if="column.getCanSort()">
            <ArrowDownIcon v-if="column.getIsSorted() === 'desc'" class="ml-2 h-4 w-4" />
            <ArrowUpIcon v-else-if="column.getIsSorted() === 'asc'" class="ml-2 h-4 w-4" />
            <CaretSortIcon v-else class="ml-2 h-4 w-4" />
          </template>
        </Button>
      </ContextMenuTrigger>

      <!-- ContextMenu content with sorting options -->
      <ContextMenuContent class="w-48">
        <ContextMenuItem @click="column.toggleSorting(true)">
          <ArrowUpIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Ascending
        </ContextMenuItem>
        <ContextMenuItem @click="column.toggleSorting(false)">
          <ArrowDownIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Descending
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem @click="column.toggleSorting(null)">
          <CaretSortIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          None
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>
</template>
