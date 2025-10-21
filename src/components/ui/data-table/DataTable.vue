<script setup lang="ts" generic="T">
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'

import { ref, watch } from 'vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type Table as TSTable,
} from '@tanstack/vue-table'

import { valueUpdater } from '@/lib/utils'

import DataTablePagination from './DataTablePagination.vue'
import DataTableSelectionBar from './DataTableSelectionBar.vue'
import DataTableToolbar from './DataTableToolbar.vue'

import { FolderSearch } from 'lucide-vue-next'
import type { DTBulkAction, Pagination, DTFilter, TableChangeData } from './types'
import { useDebounceFn } from '@vueuse/core'
import { Skeleton } from '@/components/ui/skeleton'

interface DataTableProps {
  columns: ColumnDef<T>[]
  placeholder: string
  data: T[]
  loading?: boolean
  filters?: DTFilter<T>[]
  pagination: Pagination
  bulkActions?: (table: TSTable<T>) => DTBulkAction<T>[]
}

const emit = defineEmits<{
  (e: 'query', query: TableChangeData<T>): void
}>()

const props = withDefaults(defineProps<DataTableProps>(), { placeholder: 'Search...' })
const search = defineModel<string>('search', { required: true })

// Reactive state
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const emitQuery = useDebounceFn((changeType: string, pagination?: PaginationState) => {
  const payload = {
    current_page: pagination?.pageIndex + 1 || table.getState().pagination.pageIndex + 1,
    pagesize: pagination?.pageSize || table.getState().pagination.pageSize,
    sort_column: sorting.value[0]?.id,
    sort_direction: sorting.value[0]?.desc ? 'desc' : 'asc',
    search: search.value,
    column_filters:
      columnFilters.value?.map((f) => ({
        field: f.id,
        value: f.value,
      })) || [],
    change_type: changeType,
  }
  console.log('payload', payload)
  emit('query', payload)
}, 500)

function setPagination(paginationState: PaginationState): PaginationState {
  emitQuery('pagination', paginationState)
  return paginationState
}

// Init TanStack Vue Table
const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get pagination() {
      return {
        pageIndex: props.pagination.currentPage - 1,
        pageSize: props.pagination.pageSize,
      }
    },
  },
  rowCount: props.pagination.totalItems,
  pageCount: props.pagination.totalPages,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  enableRowSelection: true,
  onSortingChange: (updaterOrValue) => {
    valueUpdater(updaterOrValue, sorting)
    emitQuery('sort')
  },
  onPaginationChange: (updater) => {
    if (typeof updater === 'function') {
      setPagination(
        updater({
          pageIndex: props.pagination.currentPage - 1,
          pageSize: props.pagination.pageSize,
        }),
      )
    } else {
      setPagination(updater)
    }
  },
  onColumnFiltersChange: (updaterOrValue) => {
    valueUpdater(updaterOrValue, columnFilters)
    emitQuery('filter')
  },
  onColumnVisibilityChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) => valueUpdater(updaterOrValue, rowSelection),
  onGlobalFilterChange: (val) => {
    search.value = val
    emitQuery('search')
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
})
watch(search, () => {
  emitQuery('search')
})
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar with search and filters -->
    <DataTableToolbar
      :placeholder="placeholder"
      :table="table"
      :filters="props.filters"
      v-model:search="search"
    />

    <!-- Table Display -->
    <div class="rounded-md border w-full overflow-x-auto">
      <Table class="w-full">
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody class="relative">
          <div v-if="loading" class="absolute top-0 bottom-0 left-0 right-0 inset-x-0 z-20 space-y-2 overflow-auto bg-background px-2">
            <slot name="loading">
              <Skeleton v-for="row in 20"
                        :key="row" class="h-8" />
            </slot>
          </div>
          <!-- Rows -->
          <template v-if="table.getFilteredRowModel().rows?.length">
            <template v-for="row in table.getFilteredRowModel().rows" :key="row.id">
              <TableRow
                :data-state="row.getIsSelected() && 'selected'"
                :class="row.getIsSelected() ? 'border-primary border-l-4' : ''"
              >
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
            </template>
          </template>

          <!-- No Results -->
          <TableRow v-else>
            <TableCell :colspan="props.columns.length" class="h-24 text-center">
              <slot name="empty">
                <div class="flex flex-col gap-2 w-full items-center justify-center">
                  <FolderSearch class="text-muted-foreground size-25" stroke-width="1" />
                  <h1 class="text-lg text-muted-foreground">No Results</h1>
                </div>
              </slot>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination & Row selection bar -->
    <DataTablePagination :table="table" />
  </div>

  <DataTableSelectionBar
    :table="table"
    v-if="props.bulkActions"
    :actions="props.bulkActions(table)"
  />
</template>
