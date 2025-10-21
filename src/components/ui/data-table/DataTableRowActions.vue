<script setup lang="ts" generic="T">
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontalIcon } from 'lucide-vue-next'
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

defineProps<{
  row: Row<T>
  actions: {
    text: string
    onClick: (record: T) => void
    icon?: Component
    variant?: 'default' | 'destructive' | 'ghost' | 'outline'
    class?: string
  }[]
}>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="h-8 w-8 p-0">
        <MoreHorizontalIcon class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[180px]">
      <DropdownMenuItem
        v-for="(action, i) in actions"
        :key="i"
        @click="() => action.onClick(row.original)"
        :class="[action.variant === 'destructive' ? 'text-red-600' : '', action.class]"
      >
        <component
          :is="action.icon"
          v-if="action.icon"
          class="mr-2 h-4 w-4 text-muted-foreground"
        />
        {{ action.text }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
