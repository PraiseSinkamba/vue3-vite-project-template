<template>
  <div class="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
    <!-- Image Container -->
    <div class="relative aspect-square overflow-hidden">
      <img
        :src="currentImage"
        :alt="work.title || 'Past work'"
        class="h-full w-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
        @click="openLightbox"
        loading="lazy"
      />

      <!-- Image Overlay with Gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <!-- Status Badges - Top Left -->
      <div class="absolute left-3 top-3 flex flex-wrap gap-2 max-w-[60%]">
        <Badge
          v-if="work.is_featured"
          variant="secondary"
          class="bg-yellow-500/90 text-white backdrop-blur-sm text-xs"
        >
          <Star class="mr-1 h-3 w-3 fill-current" />
          Featured
        </Badge>

        <Badge
          v-if="work.approval_status === 'pending'"
          variant="secondary"
          class="bg-orange-500/90 text-white backdrop-blur-sm text-xs"
        >
          <Clock class="mr-1 h-3 w-3" />
          Pending
        </Badge>

        <Badge
          v-if="work.approval_status === 'approved'"
          variant="secondary"
          class="bg-green-600/90 text-white backdrop-blur-sm text-xs"
        >
          <Check class="mr-1 h-3 w-3" />
          Approved
        </Badge>

        <Badge
          v-if="!work.is_public"
          variant="secondary"
          class="bg-gray-600/90 text-white backdrop-blur-sm text-xs"
        >
          <EyeOff class="mr-1 h-3 w-3" />
          Private
        </Badge>
      </div>

      <!-- Action Buttons - Top Right -->
      <div class="absolute top-3 right-3 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
        <!-- Primary Actions -->
        <Button
          size="icon"
          :variant="work.is_featured ? 'default' : 'secondary'"
          class="h-9 w-9 rounded-full backdrop-blur-sm shadow-lg transition-all duration-200"
          :class="work.is_featured ? 'bg-yellow-500/90 text-white hover:bg-yellow-600' : 'bg-white/90 text-gray-900 hover:bg-white'"
          @click="$emit('toggle-featured', work.id, !work.is_featured)"
        >
          <Heart class="h-4 w-4" :class="work.is_featured ? 'fill-current' : ''" />
        </Button>

        <Button
          size="icon"
          :variant="work.is_public ? 'default' : 'secondary'"
          class="h-9 w-9 rounded-full backdrop-blur-sm shadow-lg transition-all duration-200"
          :class="work.is_public ? 'bg-green-600/90 text-white hover:bg-green-700' : 'bg-white/90 text-gray-900 hover:bg-white'"
          @click="$emit('toggle-public', work.id, !work.is_public)"
        >
          <Eye class="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          class="h-9 w-9 rounded-full bg-white/90 text-gray-900 backdrop-blur-sm hover:bg-white shadow-lg"
          @click="$emit('edit', work)"
        >
          <Edit class="h-4 w-4" />
        </Button>

        <!-- More Actions Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              class="h-9 w-9 rounded-full bg-white/90 text-gray-900 backdrop-blur-sm hover:bg-white shadow-lg"
            >
              <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              v-if="work.approval_status === 'pending'"
              @click="$emit('approve', work.id)"
              class="text-green-600"
            >
              <Check class="w-4 h-4 mr-2" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem @click="copyImageUrl">
              <Copy class="w-4 h-4 mr-2" />
              Copy Image URL
            </DropdownMenuItem>
            <DropdownMenuItem @click="downloadImage">
              <Download class="w-4 h-4 mr-2" />
              Download Image
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              @click="$emit('delete', work.id)"
              class="text-red-600 focus:text-red-600"
            >
              <Trash2 class="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Before/After Toggle - Bottom Left -->
      <div v-if="work.before_image_url" class="absolute bottom-3 left-3 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
        <Button
          size="sm"
          variant="secondary"
          class="bg-white/90 text-gray-900 backdrop-blur-sm hover:bg-white shadow-lg text-xs"
          @click="toggleBeforeAfter"
        >
          {{ showBefore ? 'After' : 'Before' }}
        </Button>
      </div>

      <!-- Detail Images Indicator -->
      <div v-if="work.detail_images?.length > 0" class="absolute bottom-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
        <Badge variant="secondary" class="bg-white/90 text-gray-900 backdrop-blur-sm text-xs">
          <Images class="w-3 h-3 mr-1" />
          +{{ work.detail_images.length }}
        </Badge>
      </div>

      <!-- Data Reveal Panel - Bottom -->
      <div class="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
        <div class="bg-white/95 backdrop-blur-sm px-4 py-3 border-t border-white/20">
          <div class="flex items-center justify-between text-xs text-gray-700">
            <span class="font-medium">{{ formatDate(work.created_at) }}</span>
            <span class="text-muted-foreground">{{ work.service_name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Content Section -->
    <div class="p-4 space-y-2">
      <!-- Title and Service Info -->
      <div class="space-y-1">
        <h3 class="font-semibold text-sm leading-tight line-clamp-1">
          {{ work.title || 'Untitled Work' }}
        </h3>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{{ work.category_name }}</span>
          <span v-if="work.tags?.length > 0">•</span>
          <span v-if="work.tags?.length > 0" class="line-clamp-1">
            {{ work.tags.slice(0, 2).map(tag => `#${tag}`).join(' ') }}
            <span v-if="work.tags.length > 2">+{{ work.tags.length - 2 }}</span>
          </span>
        </div>
        <p v-if="work.description" class="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {{ work.description }}
        </p>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Dialog v-model:open="showLightbox">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{{ work.title }}</DialogTitle>
          <DialogDescription>
            {{ work.service_name }} • {{ work.category_name }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <!-- Image Navigation -->
          <div class="flex justify-center">
            <div class="flex gap-2">
              <Button
                v-if="work.before_image_url"
                :variant="lightboxImage === 'before' ? 'default' : 'outline'"
                size="sm"
                @click="lightboxImage = 'before'"
              >
                Before
              </Button>
              <Button
                :variant="lightboxImage === 'after' ? 'default' : 'outline'"
                size="sm"
                @click="lightboxImage = 'after'"
              >
                After
              </Button>
              <Button
                v-if="work.detail_images?.length > 0"
                :variant="lightboxImage.startsWith('detail') ? 'default' : 'outline'"
                size="sm"
                @click="lightboxImage = 'detail-0'"
              >
                Details ({{ work.detail_images.length }})
              </Button>
            </div>
          </div>

          <!-- Main Image Display -->
          <div class="flex justify-center">
            <img
              :src="currentLightboxImageUrl"
              :alt="lightboxImageAlt"
              class="max-h-[60vh] max-w-full object-contain rounded"
            />
          </div>

          <!-- Detail Images Navigation -->
          <div
            v-if="lightboxImage.startsWith('detail') && work.detail_images?.length > 0"
            class="flex justify-center gap-2 flex-wrap"
          >
            <Button
              v-for="(detail, index) in work.detail_images"
              :key="index"
              :variant="lightboxImage === `detail-${index}` ? 'default' : 'outline'"
              size="sm"
              @click="lightboxImage = `detail-${index}`"
            >
              {{ index + 1 }}
            </Button>
          </div>

          <!-- Image Info -->
          <div class="text-center space-y-2">
            <p v-if="work.description" class="text-sm text-muted-foreground">
              {{ work.description }}
            </p>
            <p v-if="work.technique_notes" class="text-sm text-muted-foreground">
              <strong>Techniques:</strong> {{ work.technique_notes }}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Star,
  Clock,
  Check,
  EyeOff,
  Images,
  Heart,
  Eye,
  Edit,
  MoreHorizontal,
  Copy,
  Download,
  Trash2,
} from 'lucide-vue-next'

// Props
interface PastWork {
  id: string
  service_id: string
  category_id: string
  service_name: string
  category_name: string
  before_image_url?: string
  after_image_url: string
  detail_images?: Array<{ url: string; alt?: string }>
  title: string
  description: string
  technique_notes?: string
  tags: string[]
  is_featured: boolean
  is_public: boolean
  approval_status: 'pending' | 'approved' | 'rejected'
  client_consent: boolean
  created_at: string
}

interface Props {
  work: PastWork
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  edit: [work: PastWork]
  delete: [id: string]
  approve: [id: string]
  'toggle-featured': [id: string, featured: boolean]
  'toggle-public': [id: string, isPublic: boolean]
}>()

// State
const showBefore = ref(false)
const showLightbox = ref(false)
const lightboxImage = ref<'before' | 'after' | string>('after')

// Computed
const currentImage = computed(() => {
  if (showBefore.value && props.work.before_image_url) {
    return props.work.before_image_url
  }
  return props.work.after_image_url
})

const currentLightboxImageUrl = computed(() => {
  if (lightboxImage.value === 'before' && props.work.before_image_url) {
    return props.work.before_image_url
  }
  if (lightboxImage.value === 'after') {
    return props.work.after_image_url
  }
  if (lightboxImage.value.startsWith('detail-') && props.work.detail_images) {
    const index = parseInt(lightboxImage.value.split('-')[1])
    return props.work.detail_images[index]?.url || props.work.after_image_url
  }
  return props.work.after_image_url
})

const lightboxImageAlt = computed(() => {
  if (lightboxImage.value === 'before') return 'Before image'
  if (lightboxImage.value === 'after') return 'After image'
  if (lightboxImage.value.startsWith('detail-')) {
    const index = parseInt(lightboxImage.value.split('-')[1])
    return `Detail image ${index + 1}`
  }
  return props.work.title || 'Past work'
})

// Methods
const toggleBeforeAfter = () => {
  showBefore.value = !showBefore.value
}

const openLightbox = () => {
  showLightbox.value = true
  lightboxImage.value = 'after'
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy')
}

const copyImageUrl = async () => {
  try {
    await navigator.clipboard.writeText(props.work.after_image_url)
    // You might want to show a toast notification here
  } catch (error) {
    console.error('Failed to copy URL:', error)
  }
}

const downloadImage = () => {
  const link = document.createElement('a')
  link.href = currentLightboxImageUrl.value
  link.download = `${props.work.title || 'past-work'}.jpg`
  link.click()
}
</script>

<style scoped>
.past-work-card {
  transition: all 0.2s ease-in-out;
}

.past-work-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>
