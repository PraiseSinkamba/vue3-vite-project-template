<script setup lang="ts">
import { CloudUpload, Plus } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useFileDialog } from '@vueuse/core'
import { cn } from '@/lib/utils'

import type {
  FileRecord,
  DisplayMode,
  FileType,
  ValidationRule,
  ShapeVariant,
  SizeVariant,
  UploadConfig,
} from './index'

import DropZone from './DropZone.vue'
import FileItem from './FileItem.vue'

// Model
const modelValue = defineModel<FileRecord[]>({ default: () => [] })

// Props with sensible defaults
const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    // Sensible defaults for quick development
    accept: '*/*',
    multiple: false,
    maxFiles: 0, // unlimited
    maxSize: 10 * 1024 * 1024, // 10MB
    minSize: 0,
    validationRules: () => [],
    displayMode: 'grid',
    fileType: 'file',
    shape: 'rounded',
    size: 'md',
    readonly: false,
    disabled: false,
    autoUpload: false,
    showProgress: true,
    showPreview: true,
    disableDragDrop: false,
    containerClass: '',
    itemClass: '',
    emptyStateClass: '',
    gridCols: 'auto',
    gap: 'md',
    height: 'md',
  }
)

// Emits
const emit = defineEmits<{
  'files-added': [files: FileRecord[]]
  'file-deleted': [file: FileRecord]
  'file-uploaded': [file: FileRecord]
  'file-failed': [file: FileRecord, error: string]
  'validation-failed': [file: File, errors: string[]]
  preview: [file: FileRecord]
}>()

// Use modelValue directly as the source of truth
const files = computed({
  get: () => modelValue.value,
  set: (value) => {
    modelValue.value = value
  },
})

// VueUse file dialog - create with computed options to be reactive
const fileDialogOptions = computed(() => ({
  accept: props.accept,
  multiple: props.multiple,
  reset: true,
}))

const { open: openFileDialog, onChange: onFileDialogChange } = useFileDialog(fileDialogOptions)

// Watch for file dialog changes
onFileDialogChange((selectedFiles) => {
  if (selectedFiles) {
    handleFileSelection(Array.from(selectedFiles))
  }
})

// Computed classes
const containerClasses = computed(() =>
  cn(
    'w-full',
    props.disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
    props.containerClass
  )
)

const gridClasses = computed(() => {
  if (props.displayMode === 'single') {
    return 'flex items-center justify-center'
  }

  if (props.displayMode === 'list') {
    return cn('flex flex-col space-y-2')
  }

  // Grid mode with responsive columns
  const gapMap = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }

  const colsMap = {
    xs: 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8',
    sm: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    md: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    lg: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    xl: 'grid-cols-1 sm:grid-cols-2',
    '2xl': 'grid-cols-1',
  }

  const cols = typeof props.gridCols === 'number' ? `grid-cols-${props.gridCols}` : colsMap[props.size]

  return cn('grid auto-rows-fr', cols, gapMap[props.gap])
})

const emptyStateClasses = computed(() => {
  const heightMap = {
    xs: 'min-h-32',
    sm: 'min-h-40',
    md: 'min-h-48',
    lg: 'min-h-64',
    xl: 'min-h-80',
    full: 'h-full',
    auto: 'h-auto',
  }

  const shapeClasses = {
    rectangle: 'rounded-lg',
    square: 'rounded-lg aspect-square',
    circle: 'rounded-full aspect-square',
    rounded: 'rounded-2xl',
  }

  return cn(
    'flex flex-col items-center justify-center w-full border-2 border-dashed transition-colors',
    'border-border bg-muted/30 hover:bg-muted/50',
    'cursor-pointer',
    heightMap[props.height],
    shapeClasses[props.shape],
    props.readonly && 'cursor-default opacity-60 hover:bg-muted/30',
    props.emptyStateClass
  )
})

const canAddMore = computed(() => {
  if (props.readonly || props.disabled) return false
  if (!props.multiple && files.value.length > 0) return false
  if (props.maxFiles > 0 && files.value.length >= props.maxFiles) return false
  return true
})

const acceptInfo = computed(() => {
  if (!props.accept || props.accept === '*/*') return ''

  const types = props.accept.split(',').map((t) => t.trim().replace('.', '').toUpperCase())
  if (types.length <= 3) {
    return types.join(', ')
  }
  return `${types.slice(0, 2).join(', ')} +${types.length - 2} more`
})

// Methods
function getItemClasses(index: number): string {
  const shapeClasses = {
    rectangle: 'rounded-lg',
    square: 'rounded-lg aspect-square',
    circle: 'rounded-full aspect-square',
    rounded: 'rounded-2xl',
  }

  return cn(shapeClasses[props.shape], props.itemClass)
}

function validateFile(file: File): string[] {
  const errors: string[] = []

  // Size validation
  if (props.maxSize > 0 && file.size > props.maxSize) {
    errors.push(`File size exceeds ${formatFileSize(props.maxSize)}`)
  }

  if (props.minSize > 0 && file.size < props.minSize) {
    errors.push(`File size must be at least ${formatFileSize(props.minSize)}`)
  }

  // Custom validation rules
  for (const rule of props.validationRules) {
    const error = rule(file)
    if (error) errors.push(error)
  }

  return errors
}

function createFileItem(file: File): FileRecord {
  const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined

  return {
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'pending',
    uploadPercentage: 0,
    previewUrl,
  }
}

function addFiles(newFiles: File[]): FileRecord[] {
  const validFiles: FileRecord[] = []

  for (const file of newFiles) {
    // Check if we can add more files
    if (!props.multiple && files.value.length > 0) break
    if (props.maxFiles > 0 && files.value.length + validFiles.length >= props.maxFiles) break

    // Validate file
    const errors = validateFile(file)
    if (errors.length > 0) {
      emit('validation-failed', file, errors)
      continue
    }

    // Create file item
    const fileItem = createFileItem(file)
    validFiles.push(fileItem)
  }

  if (validFiles.length > 0) {
    if (!props.multiple) {
      // Replace existing file in single mode
      files.value = validFiles
    } else {
      // Create new array to trigger reactivity
      files.value = [...files.value, ...validFiles]
    }

    emit('files-added', validFiles)

    if (props.autoUpload && (props.uploadUrl || props.uploadFn)) {
      uploadFiles(validFiles)
    }
  }

  return validFiles
}

function removeFile(file: FileRecord): void {
  // Revoke preview URL to prevent memory leaks
  if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(file.previewUrl)
  }

  const index = files.value.indexOf(file)
  if (index > -1) {
    // Create new array without the removed file
    files.value = files.value.filter((f) => f !== file)
    emit('file-deleted', file)
  }
}

function triggerFileInput(): void {
  if (props.readonly || props.disabled || !canAddMore.value) return
  openFileDialog()
}

function handleFileSelection(newFiles: File[]): void {
  addFiles(newFiles)
}

function handleDelete(file: FileRecord): void {
  removeFile(file)
}

function handleRetry(file: FileRecord): void {
  if (props.uploadUrl || props.uploadFn) {
    uploadFile(file)
  }
}

function handlePreview(file: FileRecord): void {
  emit('preview', file)
}

// Upload functionality
async function uploadFile(file: FileRecord): Promise<void> {
  if (!file.file) return

  file.status = 'uploading'
  file.uploadPercentage = 0

  try {
    let result: { url?: string; path?: string }

    if (props.uploadFn) {
      // Use custom upload function
      result = await props.uploadFn(file.file)
    } else if (props.uploadUrl) {
      // Use default fetch upload
      const formData = new FormData()
      const fieldName = props.uploadConfig?.fieldName || 'file'
      formData.append(fieldName, file.file)

      const response = await fetch(props.uploadUrl, {
        method: props.uploadConfig?.method || 'POST',
        body: formData,
        headers: props.uploadConfig?.headers,
        credentials: props.uploadConfig?.withCredentials ? 'include' : 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      result = await response.json()
    } else {
      throw new Error('No upload URL or function provided')
    }

    file.status = 'completed'
    file.uploadPercentage = 100
    file.url = result.url || result.path

    emit('file-uploaded', file)
  } catch (error) {
    file.status = 'failed'
    file.error = error instanceof Error ? error.message : 'Upload failed'
    emit('file-failed', file, file.error)
  }
}

async function uploadFiles(filesToUpload: FileRecord[]): Promise<void> {
  await Promise.allSettled(filesToUpload.map((file) => uploadFile(file)))
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Expose public methods
defineExpose({
  addFiles,
  removeFile,
  uploadFiles,
  triggerFileInput,
  files,
})
</script>

<template>
  <DropZone
    :class="containerClasses"
    :disabled="disableDragDrop || disabled || readonly"
    @files-dropped="handleFileSelection"
  >
    <template #default="{ dropZoneActive }">
      <!-- Files Grid/List View -->
      <div v-if="files.length" class="relative" :class="gridClasses">
        <!-- Drop Zone Overlay -->
        <div
          v-if="dropZoneActive && !readonly && canAddMore"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm transition-all"
        >
          <div class="text-center">
            <CloudUpload class="mx-auto size-8 text-primary" />
            <span class="mt-2 text-sm font-medium text-primary">Drop {{ fileType }}s here</span>
          </div>
        </div>

        <!-- File Items -->
        <FileItem
          v-for="(file, index) in files"
          :key="file.id"
          :file="file"
          :display-mode="displayMode"
          :show-progress="showProgress"
          :show-actions="!readonly"
          :show-preview="showPreview"
          :item-classes="getItemClasses(index)"
          @delete="handleDelete"
          @retry="handleRetry"
          @preview="handlePreview"
        />

        <!-- Add More Button (grid mode) -->
        <button
          v-if="canAddMore && displayMode !== 'single'"
          type="button"
          @click="triggerFileInput"
          :class="
            cn(
              'flex flex-col items-center justify-center min-h-24 border-2 border-dashed rounded-lg transition-colors group',
              'border-border bg-muted/30 hover:border-primary hover:bg-muted/50',
              getItemClasses(files.length)
            )
          "
        >
          <Plus class="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
          <span class="mt-1 text-xs text-muted-foreground group-hover:text-foreground">
            Add {{ fileType }}
          </span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-else>
        <slot name="empty-state" :on-click="triggerFileInput" :drop-zone-active="dropZoneActive">
          <div
            :class="
              cn(
                emptyStateClasses,
                dropZoneActive && !readonly && 'border-primary bg-primary/10'
              )
            "
            @click="!readonly && !disabled && triggerFileInput()"
          >
            <div class="flex flex-col items-center justify-center p-6 text-center">
              <slot name="empty-icon">
                <CloudUpload
                  :class="
                    cn(
                      'size-12 transition-colors',
                      dropZoneActive && !readonly
                        ? 'text-primary'
                        : 'text-muted-foreground/50'
                    )
                  "
                />
              </slot>

              <div class="mt-4 space-y-1">
                <p
                  v-if="dropZoneActive && !readonly"
                  class="text-sm font-medium text-primary"
                >
                  Drop your {{ fileType }}{{ multiple ? 's' : '' }} here
                </p>
                <template v-else>
                  <p v-if="!readonly" class="text-sm font-medium text-foreground">
                    <span>Click to upload</span>
                    <span v-if="!disableDragDrop" class="text-muted-foreground">
                      or drag and drop
                    </span>
                  </p>
                  <p v-else class="text-sm text-muted-foreground">
                    No {{ fileType }}{{ multiple ? 's' : '' }} uploaded
                  </p>
                </template>

                <p v-if="acceptInfo && !readonly" class="text-xs text-muted-foreground">
                  {{ acceptInfo }}
                  <span v-if="maxSize"> (Max: {{ formatFileSize(maxSize) }})</span>
                </p>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </template>
  </DropZone>
</template>
