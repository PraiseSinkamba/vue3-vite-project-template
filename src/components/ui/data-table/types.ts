import type {Component} from "vue";

/*export type DTFilter<T> = {
    field: keyof T
    title: string
  single?:boolean
    options: {
        label: string
        value: string
        icon?: Component
    }[]
}*/

export type DTOption<T,K> = {
  label: string
  value: T[K]
  icon?: Component
}
export type DTFilter<T> = {
  [K in keyof T]: {
    field: K
    title: string
    single?: boolean
    options: DTOption<T, K>[]
  }
}[keyof T]


export type DTBulkAction<T> = {
  label: string
  shortcut?: string
  icon?: Component
  onClick: (selected: T[]) => void
  variant?: 'default' | 'destructive' | 'ghost'
}
export interface Pagination {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}
export interface TableChangeData<T> {
  current_page: number
  pagesize: number
  sort_column?: keyof T
  sort_direction?: 'asc' | 'desc'
  search?: string
  column_filters?: Array<{
    [K in keyof T]: { field: K; value: T[K] }
  }[keyof T]>
}
