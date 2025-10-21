<template>
  <div class="past-work-display group cursor-pointer">
    <Card class="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <!-- Main Image Container -->
      <div class="relative aspect-square overflow-hidden">
        <!-- Before/After Toggle Button -->
        <div v-if="work.before_image_url" class="absolute top-3 left-3 z-10">
          <Button
            size="sm"
            variant="secondary"
            @click.stop="toggleBeforeAfter"
            class="text-xs bg-black/70 text-white hover:bg-black/80 transition-all duration-300"
          >
            <RotateCcw class="w-3 h-3 mr-1" />
            {{ showBefore ? $t('pastWork.after', 'After') : $t('pastWork.before', 'Before') }}
          </Button>
        </div>

        <!-- Featured Badge -->
        <div v-if="work.is_featured" class="absolute top-3 right-3 z-10">
          <Badge class="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <Star class="w-3 h-3 mr-1 fill-current" />
            {{ $t('pastWork.featured', 'Featured') }}
          </Badge>
        </div>

        <!-- Main Display Image -->
        <div class="relative w-full h-full">
          <img
            :src="currentDisplayImage"
            :alt="getLocalizedText(work.title, work.title_tr) || 'Past work'"
            class="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            @click="viewFullImage"
            loading="lazy"
          />

          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

          <!-- View Full Button (appears on hover) -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              variant="secondary"
              size="sm"
              @click.stop="viewFullImage"
              class="bg-white/90 text-gray-800 hover:bg-white transform scale-95 group-hover:scale-100 transition-all duration-200"
            >
              <ZoomIn class="w-4 h-4 mr-2" />
              {{ $t('pastWork.viewFull', 'View Full') }}
            </Button>
          </div>
        </div>

        <!-- Detail Images Indicator -->
        <div v-if="work.detail_images?.length > 0" class="absolute bottom-3 left-3">
          <Badge variant="secondary" class="bg-black/70 text-white text-xs">
            <Images class="w-3 h-3 mr-1" />
            +{{ work.detail_images.length }}
          </Badge>
        </div>

        <!-- Quick Actions -->
        <div class="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            v-if="work.before_image_url"
            variant="ghost"
            size="sm"
            @click.stop="toggleBeforeAfter"
            class="w-8 h-8 p-0 bg-black/70 hover:bg-black/80 text-white"
          >
            <RotateCcw class="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            @click.stop="viewFullImage"
            class="w-8 h-8 p-0 bg-black/70 hover:bg-black/80 text-white"
          >
            <Maximize2 class="w-3 h-3" />
          </Button>
        </div>
      </div>

      <!-- Content Section -->
      <CardContent class="p-4 space-y-3">
        <!-- Title -->
        <div class="space-y-1">
          <h3 class="font-semibold text-lg leading-tight group-hover:text-pink-600 transition-colors duration-200">
            {{ getLocalizedText(work.title, work.title_tr) || $t('pastWork.untitled', 'Beautiful Nail Art') }}
          </h3>

          <p v-if="work.description || work.description_tr" class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {{ getLocalizedText(work.description, work.description_tr) }}
          </p>
        </div>

        <!-- Tags -->
        <div v-if="work.tags?.length > 0 || work.tags_tr?.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="tag in getLocalizedTags().slice(0, 3)"
            :key="tag"
            variant="outline"
            class="text-xs px-2 py-1 bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 transition-colors"
          >
            #{{ tag }}
          </Badge>

          <Badge
            v-if="getLocalizedTags().length > 3"
            variant="outline"
            class="text-xs px-2 py-1 bg-gray-50 text-gray-600 border-gray-200"
          >
            +{{ getLocalizedTags().length - 3 }}
          </Badge>
        </div>

        <!-- Technique Preview -->
        <div v-if="work.technique_notes" class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette class="w-4 h-4" />
            <span class="font-medium">{{ $t('pastWork.techniques', 'Techniques') }}</span>
          </div>
          <p class="text-sm text-muted-foreground line-clamp-2 pl-6">
            {{ work.technique_notes }}
          </p>
        </div>

        <!-- Interactive Elements -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <!-- View Options -->
          <div class="flex items-center gap-2">
            <Button
              v-if="work.before_image_url"
              variant="ghost"
              size="sm"
              @click.stop="toggleBeforeAfter"
              class="text-xs text-muted-foreground hover:text-pink-600"
            >
              <Eye class="w-3 h-3 mr-1" />
              {{ showBefore ? $t('pastWork.showAfter', 'Show After') : $t('pastWork.showBefore', 'Show Before') }}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              @click.stop="viewFullImage"
              class="text-xs text-muted-foreground hover:text-pink-600"
            >
              <ZoomIn class="w-3 h-3 mr-1" />
              {{ $t('pastWork.fullSize', 'Full Size') }}
            </Button>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-3 text-xs text-muted-foreground">
            <div v-if="work.detail_images?.length > 0" class="flex items-center gap-1">
              <Images class="w-3 h-3" />
              <span>{{ work.detail_images.length + 1 }}</span>
            </div>

            <div v-if="work.before_image_url" class="flex items-center gap-1">
              <RotateCcw class="w-3 h-3" />
              <span>{{ $t('pastWork.beforeAfter', 'B/A') }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Card, CardContent,
} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {
  Star, RotateCcw, ZoomIn, Images, Maximize2, Eye, Palette
} from 'lucide-vue-next'

// Types
interface PastWork {
  id: string
  title: string
  title_tr?: string
  description: string
  description_tr?: string
  after_image_url: string
  before_image_url?: string
  detail_images?: Array<{ url: string; alt?: string }>
  tags: string[]
  tags_tr?: string[]
  technique_notes?: string
  is_featured: boolean
  created_at: string
}

// Props
interface Props {
  work: PastWork
  locale?: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'view-full': [imageUrl: string, title?: string, description?: string]
}>()

// Composables
const { t: $t, locale } = useI18n()

// State
const showBefore = ref(false)

// Computed
const currentDisplayImage = computed(() => {
  if (showBefore.value && props.work.before_image_url) {
    return props.work.before_image_url
  }
  return props.work.after_image_url
})

const getLocalizedTags = computed(() => {
  const currentLocale = props.locale || locale.value
  if (currentLocale === 'tr' && props.work.tags_tr?.length > 0) {
    return props.work.tags_tr
  }
  return props.work.tags || []
})

// Methods
const getLocalizedText = (enText: string, trText?: string): string => {
  const currentLocale = props.locale || locale.value
  if (currentLocale === 'tr' && trText) {
    return trText
  }
  return enText || trText || ''
}

const toggleBeforeAfter = () => {
  if (props.work.before_image_url) {
    showBefore.value = !showBefore.value
  }
}

const viewFullImage = () => {
  const title = getLocalizedText(props.work.title, props.work.title_tr)
  const description = getLocalizedText(props.work.description, props.work.description_tr)

  emit('view-full', currentDisplayImage.value, title, description)
}
</script>

<style scoped>
.past-work-display {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.past-work-display:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

/* Custom backdrop blur */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Smooth image transitions */
.past-work-display img {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom gradient backgrounds */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-pink-500 {
  --tw-gradient-from: #ec4899;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(236, 72, 153, 0));
}

.to-purple-600 {
  --tw-gradient-to: #9333ea;
}

/* Hover animations */
.group:hover .transform {
  transform: scale(1.05);
}

/* Custom scrollbar for technique notes */
.line-clamp-2::-webkit-scrollbar {
  display: none;
}

/* Badge hover effects */
.past-work-display .badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Button hover effects */
.past-work-display .button {
  transition: all 0.2s ease-in-out;
}

.past-work-display .button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Featured work glow effect */
.past-work-display[data-featured="true"] {
  box-shadow: 0 0 20px rgba(236, 72, 153, 0.2);
}

/* Loading state placeholder */
.past-work-display img[src=""] {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 2s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .past-work-display {
    margin-bottom: 1rem;
  }

  .past-work-display .absolute.bottom-3.right-3 {
    opacity: 1; /* Always show action buttons on mobile */
  }

  .past-work-display .group-hover\:opacity-100 {
    opacity: 0.8; /* Slightly visible on mobile */
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .past-work-display .bg-white\/80 {
    background-color: rgba(31, 41, 55, 0.8);
  }

  .past-work-display .text-muted-foreground {
    color: #9ca3af;
  }

  .past-work-display .border-gray-100 {
    border-color: #374151;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .past-work-display {
    border: 2px solid;
  }

  .past-work-display .bg-black\/70 {
    background-color: rgba(0, 0, 0, 0.9);
  }

  .past-work-display .text-muted-foreground {
    color: inherit;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .past-work-display,
  .past-work-display img,
  .past-work-display .transition-all {
    transition: none;
  }

  .past-work-display:hover {
    transform: none;
  }

  .group:hover .transform {
    transform: none;
  }
}
</style>
