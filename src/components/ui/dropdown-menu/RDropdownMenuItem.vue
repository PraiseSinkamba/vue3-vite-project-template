<script setup lang="ts">
import { cn } from '@/lib/utils.ts'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  type MenuItem,
} from '@/components/ui/dropdown-menu'

const props = defineProps<{
  item: MenuItem
}>()

const emit = defineEmits<{
  (e: 'item-selected', item: MenuItem): void
}>()

function onSelect(item: MenuItem) {
  emit('item-selected', item)
}
</script>

<template>
  <!-- 1. Separator -->
  <template v-if="props.item.separator">
    <DropdownMenuSeparator />
  </template>

  <!-- 2. Leaf item (no children) -->
  <template v-else-if="!props.item.children || props.item.children.length === 0">
    <DropdownMenuItem
      :variant="props.item.variant"
      :disabled="props.item.disabled"
      :class="cn('flex items-center justify-between cursor-pointer')"
      @click="onSelect(props.item)"
    >
      <span class="flex items-center gap-2 flex-1">
        <component v-if="props.item.icon" :is="props.item.icon" />
        {{ props.item.label }}
      </span>
    </DropdownMenuItem>
  </template>

  <!-- 3. Submenu branch -->
  <template v-else>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        :class="cn('flex items-center justify-between cursor-pointer')"
      >
        <span class="flex items-center gap-2 flex-1">
          <component v-if="props.item.icon" :is="props.item.icon" />
          {{ props.item.label }}
        </span>
      </DropdownMenuSubTrigger>

      <!-- Wrap the SubContent in a Portal, exactly like the official demo: -->
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <template v-for="child in props.item.children" :key="child.id">
            <!-- Each child also re‐emits "item-selected" up the chain -->
            <RDropdownMenuItem
              :item="child"
              @item-selected="onSelect"
            />
          </template>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  </template>
</template>

<style scoped>
/* no extra CSS needed here */
</style>
