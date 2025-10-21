<script setup lang="ts">
import { cn } from '@/lib/utils.ts'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  type MenuItem,
} from '@/components/ui/dropdown-menu'
import RDropdownMenuItem from '@/components/ui/dropdown-menu/RDropdownMenuItem.vue'

const props = defineProps<{
  items: MenuItem[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  contentClassName?: string
}>()

const emit = defineEmits<{
  (e: 'item-selected', item: MenuItem): void
}>()

// We keep a simple `ref(false)` for open/close state.
const open = defineModel<boolean>('open')

function handleSelect(item: MenuItem) {
  emit('item-selected', item)
}
</script>

<template>
  <DropdownMenu v-model:open="open">
    <DropdownMenuTrigger as-child>
      <!-- Wrap your trigger slot in a div so `props.className` can apply -->
      <div :class="props.className">
        <slot />
      </div>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      :align="props.align"
      :side="props.side"
      :class="cn('w-56', props.contentClassName)"
    >
      <template v-for="item in props.items" :key="item.id">
        <RDropdownMenuItem
          :item="item"
          @item-selected="handleSelect"
        />
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>
/* no changes here */
</style>
