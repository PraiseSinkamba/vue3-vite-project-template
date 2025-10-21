<script setup lang="ts">
import { Check, Eye, File, RefreshCcw, Trash2, XCircle } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { cn } from '@/lib/utils'

import type { FileRecord, DisplayMode } from './index'
import StatusBadge from './StatusBadge.vue'

// Props
const props = withDefaults(
  defineProps<{
    file: FileRecord
    displayMode?: DisplayMode
    showProgress?: boolean
    showActions?: boolean
    showPreview?: boolean
    itemClasses?: string
  }>(),
  {
    displayMode: 'grid',
    showProgress: true,
    showActions: true,
    showPreview: true,
    itemClasses: '',
  }
)

// Emits
const emit = defineEmits<{
  delete: [file: FileRecord]
  retry: [file: FileRecord]
  preview: [file: FileRecord]
}>()

// State
const imageLoaded = ref(false)
const imageError = ref(false)

// Computed
const isImage = computed(() => {
  if (props.file.type?.startsWith('image/')) return true
  if (props.file.url && /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(props.file.url)) return true
  return false
})

const previewUrl = computed(() => {
  if (props.file.previewUrl) return props.file.previewUrl
  if (props.file.url) return props.file.url
  if (props.file.file && isImage.value) return URL.createObjectURL(props.file.file)
  return ''
})

const containerClasses = computed(() => {
  const classes = [
    'group relative overflow-hidden transition-all duration-200',
    'border rounded-lg',
  ]

  if (props.displayMode === 'list') {
    classes.push(
      'flex items-center gap-3 p-3',
      'bg-background hover:bg-muted/50',
      'border-border'
    )
  } else {
    classes.push(
      'bg-background hover:shadow-md cursor-pointer',
      'border-border hover:border-primary/50'
    )
  }

  // Status-based border colors
  if (props.file.status === 'failed') {
    classes.push('border-destructive/50')
  } else if (props.file.status === 'completed') {
    classes.push('border-primary/50')
  } else if (props.file.status === 'uploading') {
    classes.push('border-primary')
  }

  return cn(classes, props.itemClasses)
})

// Methods
function handleClick(): void {
  if (props.file.status === 'completed' && props.showPreview) {
    emit('preview', props.file)
  }
}

function onImageLoad(): void {
  imageLoaded.value = true
  imageError.value = false
}

function onImageError(): void {
  imageLoaded.value = false
  imageError.value = true
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
</script>

<template>
  <div :class="containerClasses" @click="handleClick">
    <!-- Grid/Single Mode -->
    <template v-if="displayMode !== 'list'">
      <!-- File Preview -->
      <div class="relative w-full aspect-square">
        <!-- Image Preview -->
        <div v-if="isImage && previewUrl" class="relative w-full h-full overflow-hidden">
          <img
            :src="previewUrl"
            :alt="file.name"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            @load="onImageLoad"
            @error="onImageError"
          />
        </div>

        <!-- Document/File Preview -->
        <div
          v-else
          class="flex flex-col items-center justify-center w-full h-full bg-muted/50"
        >
          <File class="size-10 text-muted-foreground mb-2" />
          <span class="text-xs text-center text-muted-foreground px-2 line-clamp-2 break-all">
            {{ file.name }}
          </span>
        </div>

        <!-- Upload Progress Overlay -->
        <div
          v-if="showProgress && file.status === 'uploading'"
          class="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center"
        >
          <div class="relative size-16">
            <svg class="size-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
                class="text-muted"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
                stroke-dasharray="175.929"
                :stroke-dashoffset="175.929 * (1 - (file.uploadPercentage || 0) / 100)"
                stroke-linecap="round"
                class="text-primary transition-all duration-300"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-medium text-foreground">
                {{ file.uploadPercentage || 0 }}%
              </span>
            </div>
          </div>
          <span class="mt-2 text-xs text-muted-foreground">Uploading...</span>
        </div>

        <!-- Failed Overlay -->
        <div
          v-if="file.status === 'failed'"
          class="absolute inset-0 bg-destructive/80 backdrop-blur-sm flex flex-col items-center justify-center"
        >
          <XCircle class="size-8 text-destructive-foreground" />
          <span class="mt-1 text-xs text-destructive-foreground">Failed</span>
        </div>

        <!-- Success Indicator -->
        <div
          v-if="file.status === 'completed'"
          class="absolute top-2 right-2 rounded-full bg-primary p-1"
        >
          <Check class="size-3 text-primary-foreground" />
        </div>
      </div>

      <!-- Action Buttons Overlay (Grid Mode) -->
      <div
        v-if="showActions && file.status !== 'uploading'"
        class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <!-- Retry Button -->
        <button
          v-if="file.status === 'failed'"
          type="button"
          @click.stop="$emit('retry', file)"
          class="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          title="Retry upload"
        >
          <RefreshCcw class="size-4" />
        </button>

        <!-- Preview Button -->
        <button
          v-if="showPreview && isImage"
          type="button"
          @click.stop="$emit('preview', file)"
          class="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
          title="Preview"
        >
          <Eye class="size-4" />
        </button>

        <!-- Delete Button -->
        <button
          type="button"
          @click.stop="$emit('delete', file)"
          class="p-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          title="Delete"
        >
          <Trash2 class="size-4" />
        </button>
      </div>
    </template>

    <!-- List Mode -->
    <template v-else>
      <!-- File Icon/Preview -->
      <div class="flex-shrink-0">
        <div
          v-if="isImage && previewUrl"
          class="size-12 rounded-md overflow-hidden bg-muted"
        >
          <img
            :src="previewUrl"
            :alt="file.name"
            class="w-full h-full object-cover"
            @load="onImageLoad"
            @error="onImageError"
          />
        </div>
        <div
          v-else
          class="size-12 rounded-md bg-muted flex items-center justify-center"
        >
          <File class="size-6 text-muted-foreground" />
        </div>
      </div>

      <!-- File Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium text-foreground truncate">
            {{ file.name }}
          </p>
          <StatusBadge :status="file.status" />
        </div>

        <div class="flex items-center gap-2 mt-1">
          <span v-if="file.size" class="text-xs text-muted-foreground">
            {{ formatFileSize(file.size) }}
          </span>
          <span v-if="file.type" class="text-xs text-muted-foreground">
            {{ file.type.split('/')[1]?.toUpperCase() }}
          </span>
        </div>

        <!-- Progress Bar (List Mode) -->
        <div v-if="showProgress && file.status === 'uploading'" class="mt-2">
          <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary transition-all duration-300"
              :style="{ width: `${file.uploadPercentage || 0}%` }"
            />
          </div>
        </div>

        <!-- Error Message -->
        <p v-if="file.status === 'failed' && file.error" class="mt-1 text-xs text-destructive">
          {{ file.error }}
        </p>
      </div>

      <!-- Actions (List Mode) -->
      <div v-if="showActions" class="flex items-center gap-1 flex-shrink-0">
        <button
          v-if="file.status === 'failed'"
          type="button"
          @click.stop="$emit('retry', file)"
          class="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
          title="Retry"
        >
          <RefreshCcw class="size-4" />
        </button>

        <button
          v-if="showPreview && isImage"
          type="button"
          @click.stop="$emit('preview', file)"
          class="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
          title="Preview"
        >
          <Eye class="size-4" />
        </button>

        <button
          type="button"
          @click.stop="$emit('delete', file)"
          class="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          title="Delete"
        >
          <Trash2 class="size-4" />
        </button>
      </div>
    </template>
  </div>
</template>
