import { type ColumnDef, createColumnHelper } from '@tanstack/vue-table'
import type { DTFilter } from '@/views/tasks/components/types.ts'

export function useDataTable<T>() {
  const columnHelper = createColumnHelper<T>()

  function defineColumns(columns: ColumnDef<T>[]): ColumnDef<T>[] {
    return columns
  }

  function defineFilters(filters: DTFilter<T>[]): DTFilter<T>[] {
    return filters
  }

  return {
    columnHelper,
    defineColumns,
    defineFilters,
  }
}
