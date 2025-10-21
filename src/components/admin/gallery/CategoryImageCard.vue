<template>
  <div class="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
    <!-- Image Container - Focus on the image -->
    <div class="relative aspect-video overflow-hidden">
      <!-- Hero Image or Placeholder -->
      <div v-if="heroImage" class="relative h-full w-full">
        <img
          :src="heroImage.image_url"
          :alt="heroImage.alt_text || category.name"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div v-else class="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
        <div class="text-center transition-transform duration-300 group-hover:scale-105">
          <ImageIcon class="mx-auto h-16 w-16 text-muted-foreground/60 mb-3" />
          <p class="text-sm text-muted-foreground font-medium">No hero image</p>
          <p class="text-xs text-muted-foreground/70 mt-1">Upload one to get started</p>
        </div>
      </div>

      <!-- Subtle overlay on hover -->
      <div class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <!-- Status indicator - minimal -->
      <div v-if="heroImage" class="absolute left-3 top-3">
        <div class="h-2 w-2 rounded-full bg-green-400 shadow-sm" />
      </div>

      <!-- Single action menu - clean and minimal -->
      <div class="absolute top-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
        <ResponsiveMenu :items="actionMenuItems" align="end">
          <Button
            size="icon"
            variant="ghost"
            class="h-8 w-8 rounded-full bg-white/90 text-foreground backdrop-blur-sm hover:bg-white shadow-sm"
          >
            <MoreHorizontal class="h-4 w-4" />
          </Button>
        </ResponsiveMenu>
      </div>
    </div>

    <!-- Minimal card content -->
    <div class="p-3">
      <h3 class="font-medium text-sm leading-tight text-foreground line-clamp-1 mb-1">
        {{ category.name }}
      </h3>
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>{{ servicesCount }} services</span>
        <span>{{ totalImages }} images</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ResponsiveMenu, type MenuItem } from '@/components/ui/dropdown-menu'
import {
  Upload,
  Edit,
  Trash2,
  Eye,
  Image,
  ImageIcon,
  MoreHorizontal,
  Settings,
  Download,
  Copy
} from 'lucide-vue-next'

interface CategoryImage {
  id: string
  category_id: string
  image_url: string
  title?: string
  alt_text?: string
  is_hero_image: boolean
}

interface ServiceCategory {
  id: string
  name: string
  name_tr?: string
  description?: string
  hero_image?: CategoryImage
  services_count?: number
  total_images?: number
  featured_work_count?: number
}

interface Props {
  category: ServiceCategory
}

const props = defineProps<Props>()

const emit = defineEmits<{
  upload: [categoryId: string]
  edit: [image: CategoryImage]
  delete: [categoryId: string]
  settings: [categoryId: string]
  'view-services': [categoryId: string]
  'view-gallery': [categoryId: string]
  duplicate: [categoryId: string]
  'export-data': [categoryId: string]
}>()

const heroImage = computed(() => props.category.hero_image)
const servicesCount = computed(() => props.category.services_count || 0)
const totalImages = computed(() => props.category.total_images || 0)

const actionMenuItems = computed<MenuItem[]>(() => [
  {
    id: 'upload',
    label: 'Upload Image',
    icon: Upload,
    onClick: () => emit('upload', props.category.id)
  },
  {
    id: 'edit',
    label: heroImage.value ? 'Edit Image' : 'Upload Image',
    icon: heroImage.value ? Edit : Upload,
    onClick: () => heroImage.value ? emit('edit', heroImage.value) : emit('upload', props.category.id)
  },
  {
    id: 'separator1',
    separator: true,
    label: '',
    onClick: () => {}
  },
  {
    id: 'view-services',
    label: 'View Services',
    icon: Eye,
    onClick: () => emit('view-services', props.category.id)
  },
  {
    id: 'view-gallery',
    label: 'View Gallery',
    icon: Image,
    onClick: () => emit('view-gallery', props.category.id)
  },
  {
    id: 'separator2',
    separator: true,
    label: '',
    onClick: () => {}
  },
  {
    id: 'settings',
    label: 'Category Settings',
    icon: Settings,
    onClick: () => emit('settings', props.category.id)
  },
  {
    id: 'duplicate',
    label: 'Duplicate Category',
    icon: Copy,
    onClick: () => emit('duplicate', props.category.id)
  },
  {
    id: 'export',
    label: 'Export Data',
    icon: Download,
    onClick: () => emit('export-data', props.category.id)
  },
  {
    id: 'separator3',
    separator: true,
    label: '',
    onClick: () => {}
  },
  {
    id: 'delete',
    label: 'Delete Category',
    icon: Trash2,
    variant: 'destructive',
    onClick: () => confirmDelete()
  }
])

const confirmDelete = () => {
  if (confirm(`Delete category "${props.category.name}" and all its data?`)) {
    emit('delete', props.category.id)
  }
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
