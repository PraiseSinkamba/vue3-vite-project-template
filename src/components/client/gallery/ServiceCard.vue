<template>
  <Card
    class="service-card overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
  >
    <!-- Hero Image -->
    <div class="relative aspect-[4/3] overflow-hidden">
      <img
        :src="service.hero_image_url || defaultImage"
        :alt="getLocalizedText(service.name, service.name_tr)"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        @error="handleImageError"
      />

      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"
      />

      <!-- Category Badge -->
      <Badge class="absolute top-3 left-3 bg-white/90 text-gray-800">
        {{ getLocalizedText(service.category_name, service.category_name_tr) }}
      </Badge>

      <!-- Gallery Indicator -->
      <div v-if="service.total_images > 0" class="absolute top-3 right-3">
        <Badge variant="secondary" class="bg-black/60 text-white">
          <Camera class="w-3 h-3 mr-1" />
          {{ service.total_images }}
        </Badge>
      </div>

      <!-- View Gallery Button (appears on hover) -->
      <div
        class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <Button
          variant="secondary"
          size="sm"
          @click.stop="$emit('view-gallery', service)"
          class="bg-white/90 text-gray-800 hover:bg-white"
        >
          <Eye class="w-4 h-4 mr-2" />
          {{ $t('service.viewGallery', 'View Gallery') }}
        </Button>
      </div>
    </div>

    <!-- Card Content -->
    <CardContent class="p-5 space-y-4">
      <!-- Title and Description -->
      <div class="space-y-2">
        <h3 class="font-bold text-xl text-gray-800 group-hover:text-pink-600 transition-colors">
          {{ getLocalizedText(service.name, service.name_tr) }}
        </h3>

        <p class="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {{
            getLocalizedText(service.description, service.description_tr) ||
            $t('service.noDescription', 'Professional nail service')
          }}
        </p>
      </div>

      <!-- Service Stats -->
      <div class="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
        <div class="text-center">
          <div class="text-lg font-bold text-gray-800">
            {{ service.duration_minutes }}
          </div>
          <div class="text-xs text-gray-500 uppercase tracking-wide">
            {{ $t('service.minutes', 'Minutes') }}
          </div>
        </div>

        <div class="text-center">
          <div class="text-lg font-bold text-pink-600">₺{{ service.base_price }}</div>
          <div class="text-xs text-gray-500 uppercase tracking-wide">
            {{ $t('service.starting', 'Starting') }}
          </div>
        </div>

        <div class="text-center">
          <div class="text-lg font-bold text-purple-600">
            {{ service.past_work_count }}
          </div>
          <div class="text-xs text-gray-500 uppercase tracking-wide">
            {{ $t('service.examples', 'Examples') }}
          </div>
        </div>
      </div>

      <!-- Past Work Preview -->
      <div v-if="service.past_work_count > 0" class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">
            {{ $t('service.recentWork', 'Recent Work') }}
          </span>
          <Button
            variant="ghost"
            size="sm"
            @click.stop="$emit('view-gallery', service)"
            class="text-xs text-pink-600 hover:text-pink-700"
          >
            {{ $t('service.seeAll', 'See All') }} →
          </Button>
        </div>

        <!-- Mini gallery preview would go here -->
        <div class="flex items-center gap-1">
          <div
            v-for="n in Math.min(service.past_work_count, 4)"
            :key="n"
            class="w-8 h-8 bg-gray-200 rounded-full"
          />
          <span v-if="service.past_work_count > 4" class="text-xs text-gray-500 ml-2">
            +{{ service.past_work_count - 4 }} {{ $t('service.more', 'more') }}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 pt-2">
        <Button
          @click.stop="$emit('book-service', service)"
          class="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <Calendar class="w-4 h-4 mr-2" />
          {{ $t('service.bookNow', 'Book Now') }}
        </Button>

        <Button
          variant="outline"
          @click.stop="$emit('view-gallery', service)"
          class="px-3 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600"
        >
          <Eye class="w-4 h-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Camera, Eye, Calendar } from 'lucide-vue-next'

// Types
interface Service {
  id: string
  name: string
  name_tr: string
  description: string
  description_tr: string
  category_name: string
  category_name_tr: string
  duration_minutes: number
  base_price: number
  hero_image_url?: string
  total_images: number
  past_work_count: number
}

// Props
interface Props {
  service: Service
  locale?: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'view-gallery': [service: Service]
  'book-service': [service: Service]
}>()

// Composables
const { t: $t, locale } = useI18n()

// Default image for services without hero images
const defaultImage = computed(
  () =>
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=400&fit=crop&crop=center',
)

// Methods
const getLocalizedText = (enText: string, trText?: string): string => {
  if (props.locale === 'tr' && trText) {
    return trText
  }
  if (locale.value === 'tr' && trText) {
    return trText
  }
  return enText || trText || ''
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = defaultImage.value
}
</script>

<style scoped>
.service-card {
  border-radius: 1rem;
  border: 0;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-4\/3 {
  aspect-ratio: 4 / 3;
}

/* Custom gradient button styles */
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

.hover\:from-pink-600:hover {
  --tw-gradient-from: #db2777;
}

.hover\:to-purple-700:hover {
  --tw-gradient-to: #7c3aed;
}
</style>
