export { default as FileUpload } from './FileUpload.vue'
export { default as FileItem } from './FileItem.vue'
export { default as StatusBadge } from './StatusBadge.vue'
export { default as DropZone } from './DropZone.vue'

// File record interface
export interface FileRecord {
  id: string
  file?: File
  url?: string
  name: string
  size?: number
  type?: string
  status?: 'pending' | 'uploading' | 'completed' | 'failed'
  uploadPercentage?: number
  previewUrl?: string
  error?: string
  [key: string]: any
}

// Display variants
export type DisplayMode = 'grid' | 'list' | 'single'
export type FileType = 'image' | 'document' | 'video' | 'file'
export type ValidationRule = (file: File) => string | null

// Shape variants for styling
export type ShapeVariant = 'rectangle' | 'square' | 'circle' | 'rounded'

// Size variants
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Upload configuration
export interface UploadConfig {
  url?: string
  method?: 'POST' | 'PUT'
  headers?: Record<string, string>
  fieldName?: string
  withCredentials?: boolean
}

// Component props type helpers
export interface FileUploadProps {
  // Upload configuration
  uploadUrl?: string
  uploadFn?: (file: File) => Promise<{ url?: string; path?: string }>
  uploadConfig?: UploadConfig

  // File constraints
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in bytes
  minSize?: number // in bytes

  // Validation
  validationRules?: ValidationRule[]

  // Display options
  displayMode?: DisplayMode
  fileType?: FileType
  shape?: ShapeVariant
  size?: SizeVariant

  // Behavior
  readonly?: boolean
  disabled?: boolean
  autoUpload?: boolean
  showProgress?: boolean
  showPreview?: boolean
  disableDragDrop?: boolean

  // Visual customization (Tailwind classes)
  containerClass?: string
  itemClass?: string
  emptyStateClass?: string

  // Grid/Layout options
  gridCols?: number | 'auto'
  gap?: 'none' | 'sm' | 'md' | 'lg'

  // Height presets
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto'
}
