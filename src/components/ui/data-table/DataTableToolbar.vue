<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-vue-next'
import DataTableFacetedFilter from './DataTableFacetedFilter.vue'

import type { Table } from '@tanstack/vue-table'
import type { DTFilter } from '@/components/ui/data-table'

const props = defineProps<{
  table: Table<T>
  placeholder: string
  filters?: DTFilter<T>[]
}>()
const search = defineModel<string>('search', { required: true })
const emit = defineEmits(['update:search'])

const isFiltered = computed(() => {
  return props.table.getState().columnFilters.length > 0 || search.value
})

function clearFilters() {
  props.table.resetColumnFilters()
  emit('update:search', '')
}
</script>

<template>
  <div class="flex items-center flex-row flex-wrap gap-2">
    <Input
      :placeholder="placeholder"
      v-model="search"
      class="h-8 w-full lg:w-[350px]"
    />
    <template v-for="filter in filters" :key="filter.field">
      <DataTableFacetedFilter
        v-if="props.table.getColumn(filter.field)"
        :column="props.table.getColumn(filter.field)"
        :single="filter.single"
        :title="filter.title"
        :filter-key="filter.field"
        :options="filter.options"
      />
    </template>

    <Button v-if="isFiltered" variant="ghost" class="h-8 px-2 lg:px-3" @click="clearFilters">
      Reset
      <XIcon class="ml-2 h-4 w-4" />
    </Button>
  </div>
</template>
