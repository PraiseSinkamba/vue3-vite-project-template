<template>
  <div class="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
    <!-- Image Container -->
    <div class="relative aspect-square overflow-hidden">
      <img
        :src="image.image_url"
        :alt="image.alt_text || image.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />

      <!-- Image Overlay with Gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <!-- Status Badges - Top Row -->
      <div class="absolute left-3 top-3 flex gap-2">
        <Badge
          v-if="image.is_featured"
          variant="secondary"
          class="bg-yellow-500/90 text-white backdrop-blur-sm"
        >
          <Star class="mr-1 h-3 w-3 fill-current" />
          Featured
        </Badge>

        <Badge
          :variant="getImageTypeBadgeVariant(image.image_type)"
          class="backdrop-blur-sm"
        >
          {{ formatImageType(image.image_type) }}
        </Badge>
      </div>

      <!-- Floating Action Buttons - Bottom Right -->
      <div class="absolute top-3 right-3 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
        <!-- Quick Actions Menu -->
        <ResponsiveMenu :items="actionMenuItems" align="end">
          <Button
            size="icon"
            variant="secondary"
            class="h-9 w-9 rounded-full bg-white/90 text-gray-900 backdrop-blur-sm hover:bg-white shadow-lg"
          >
            <MoreHorizontal class="h-4 w-4" />
          </Button>
        </ResponsiveMenu>

        <!-- Primary Actions -->
        <Button
          size="icon"
          :variant="image.is_featured ? 'default' : 'secondary'"
          class="h-9 w-9 rounded-full backdrop-blur-sm shadow-lg transition-all duration-200"
          :class="image.is_featured ? 'bg-yellow-500/90 text-white hover:bg-yellow-600' : 'bg-white/90 text-gray-900 hover:bg-white'"
          @click="$emit('toggle-featured', image.id, !image.is_featured)"
        >
          <Star class="h-4 w-4" :class="image.is_featured ? 'fill-current' : ''" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          class="h-9 w-9 rounded-full bg-white/90 text-gray-900 backdrop-blur-sm hover:bg-white shadow-lg"
          @click="$emit('edit', image)"
        >
          <Edit class="h-4 w-4" />
        </Button>
      </div>

      <!-- Order Controls - Left Side -->
      <div class="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
        <Button
          size="icon"
          variant="secondary"
          class="h-8 w-8 rounded-full bg-white/90 text-gray-900 backdrop-blur-sm hover:bg-white shadow-lg"
          @click="moveUp"
          :disabled="image.display_order === 0"
        >
          <ChevronUp class="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          class="h-8 w-8 rounded-full bg-white/90 text-gray-900 backdrop-blur-sm hover:bg-white shadow-lg"
          @click="moveDown"
        >
          <ChevronDown class="h-3 w-3" />
        </Button>
      </div>

      <!-- Data Reveal Panel - Bottom -->
      <div class="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
        <div class="bg-white/95 backdrop-blur-sm px-4 py-3 border-t border-white/20">
          <div class="flex items-center justify-between text-xs text-gray-700">
            <span class="font-medium">Order: {{ image.display_order }}</span>
            <span v-if="image.image_metadata?.width && image.image_metadata?.height" class="text-muted-foreground">
              {{ image.image_metadata.width }}×{{ image.image_metadata.height }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-4 space-y-3">
      <!-- Title and Description -->
      <div class="space-y-1">
        <h3 class="font-semibold text-sm leading-tight line-clamp-1">
          {{ image.title || 'Untitled' }}
        </h3>
        <p v-if="image.description" class="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {{ image.description }}
        </p>
      </div>

      <!-- Progress Indicator -->
      <div class="h-1 bg-muted rounded-full overflow-hidden">
        <div
          class="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          :style="{ width: `${Math.min(100, (image.display_order + 1) * 20)}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ResponsiveMenu, type MenuItem } from '@/components/ui/dropdown-menu'
import {
  Star,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Copy,
  Download,
  ExternalLink
} from 'lucide-vue-next'

interface ServiceImage {
  id: string
  service_id: string
  image_url: string
  title: string
  description?: string
  alt_text?: string
  image_type: 'hero' | 'gallery' | 'before_after' | 'technique' | 'detail'
  is_featured: boolean
  display_order: number
  image_metadata?: {
    width?: number
    height?: number
    thumbnail_url?: string
  }
}

interface Props {
  image: ServiceImage
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [image: ServiceImage]
  delete: [imageId: string]
  'toggle-featured': [imageId: string, featured: boolean]
  'move-up': [imageId: string]
  'move-down': [imageId: string]
  duplicate: [imageId: string]
  download: [imageId: string]
  'view-full': [imageId: string]
}>()

const getImageTypeBadgeVariant = (type: string) => {
  const variants = {
    hero: 'default',
    gallery: 'secondary',
    before_after: 'outline',
    technique: 'secondary',
    detail: 'outline'
  }
  return variants[type as keyof typeof variants] || 'secondary'
}

const formatImageType = (type: string) => {
  const labels = {
    hero: 'Hero',
    gallery: 'Gallery',
    before_after: 'Before/After',
    technique: 'Technique',
    detail: 'Detail'
  }
  return labels[type as keyof typeof labels] || type
}

const actionMenuItems = computed<MenuItem[]>(() => [
  {
    id: 'view-full',
    label: 'View Full Size',
    icon: ExternalLink,
    onClick: () => emit('view-full', props.image.id)
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    onClick: () => emit('duplicate', props.image.id)
  },
  {
    id: 'download',
    label: 'Download',
    icon: Download,
    onClick: () => emit('download', props.image.id)
  },
  {
    id: 'separator',
    separator: true,
    label: '',
    onClick: () => {}
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    onClick: () => confirmDelete()
  }
])

const confirmDelete = () => {
  if (confirm(`Delete "${props.image.title || 'this image'}"?`)) {
    emit('delete', props.image.id)
  }
}

const moveUp = () => {
  emit('move-up', props.image.id)
}

const moveDown = () => {
  emit('move-down', props.image.id)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
