<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import type { Table } from '@tanstack/vue-table'
import type { DTBulkAction } from '@/components/ui/data-table/types.ts'
import { CommandShortcut } from '@/components/ui/command'

const props = defineProps<{
  table: Table<T>
  actions: DTBulkAction<T>[]
}>()

const selected = computed(() =>
  props.table.getFilteredSelectedRowModel().rows.map(r => r.original)
)
const count = computed(() => selected.value.length)
</script>

<template>
  <Transition name="fade">
    <div
      v-if="count > 0"
      class="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center space-x-3 rounded-xl border border-secondary bg-white px-4 py-2 shadow-md dark:border-neutral-700 dark:bg-neutral-900"
    >
      <span class="text-sm font-medium whitespace-nowrap">
        {{ count }} selected
      </span>

      <template v-for="(action, i) in props.actions" :key="i">
        <Button
          size="sm"
          :variant="action.variant ?? 'default'"
          class="flex items-center gap-1 font-semibold tracking-tight px-3"
          @click="() => action.onClick(selected)"
        >
          <component v-if="action.icon" :is="action.icon"  />
          {{ action.label }}
          <CommandShortcut
            v-if="action.shortcut"
            class="ml-2 rounded bg-white/30 px-1 text-xs text-muted-foreground border border-border"
          >
            {{ action.shortcut }}
          </CommandShortcut>
        </Button>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
