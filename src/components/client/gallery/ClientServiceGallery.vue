<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@pinia/colada'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConditionalContent } from '@/components/ui/conditional'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Calendar,
  Eye,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

// Composables
const { t, locale } = useI18n()
const router = useRouter()

// State
const selectedCategory = ref<string>('all')
const selectedImage = ref<any>(null)
const showImageModal = ref(false)
const activeTab = ref<'gallery' | 'pastwork'>('gallery')

// Helper function for localized text
const getLocalizedText = (en: string, tr: string | null) => {
  return locale.value === 'tr' && tr ? tr : en
}

// Fetch service categories
const { data: categories, isLoading: categoriesLoading } = useQuery({
  key: ['service-categories'],
  query: async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('id, name, name_tr')
      .order('name')

    if (error) throw error
    return data || []
  },
})

// Fetch service images (gallery tab)
const { data: serviceImages, isLoading: serviceImagesLoading } = useQuery({
  key: computed(() => ['service-images-public', selectedCategory.value]),
  query: async () => {
    let query = supabase
      .from('service_images')
      .select(`
        id, service_id, image_url, title, title_tr, description, description_tr,
        image_type, is_featured, display_order,
        services!inner (id, name, name_tr, category_id),
        service_categories!inner (id, name, name_tr)
      `)
      .eq('is_active', true)

    if (selectedCategory.value !== 'all') {
      query = query.eq('services.category_id', selectedCategory.value)
    }

    query = query
      .order('is_featured', { ascending: false })
      .order('display_order')
      .order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error

    return (data || []).map(item => ({
      ...item,
      service_name: getLocalizedText(item.services?.name || '', item.services?.name_tr),
      category_name: getLocalizedText(item.service_categories?.name || '', item.service_categories?.name_tr),
      display_title: getLocalizedText(item.title || '', item.title_tr),
      display_description: getLocalizedText(item.description || '', item.description_tr),
    }))
  },
})

// Fetch past work (portfolio tab)
const { data: pastWork, isLoading: pastWorkLoading } = useQuery({
  key: computed(() => ['past-work-public', selectedCategory.value]),
  query: async () => {
    let query = supabase
      .from('past_work_gallery')
      .select(`
        id, service_id, category_id, before_image_url, after_image_url,
        detail_images, title, title_tr, description, description_tr,
        tags, tags_tr, is_featured, created_at,
        services (name, name_tr),
        service_categories (name, name_tr)
      `)
      .eq('is_public', true)
      .eq('approval_status', 'approved')

    if (selectedCategory.value !== 'all') {
      query = query.eq('category_id', selectedCategory.value)
    }

    query = query
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error

    return (data || []).map(item => ({
      ...item,
      service_name: getLocalizedText(item.services?.name || '', item.services?.name_tr),
      category_name: getLocalizedText(item.service_categories?.name || '', item.service_categories?.name_tr),
      display_title: getLocalizedText(item.title || '', item.title_tr),
      display_description: getLocalizedText(item.description || '', item.description_tr),
      display_tags: locale.value === 'tr' && item.tags_tr ? item.tags_tr : item.tags,
    }))
  },
})

// Computed
const filteredCategories = computed(() => categories.value || [])

const isLoading = computed(() =>
  categoriesLoading.value ||
  (activeTab.value === 'gallery' ? serviceImagesLoading.value : pastWorkLoading.value)
)

// Methods
const openImageModal = (image: any) => {
  selectedImage.value = image
  showImageModal.value = true
}

const closeImageModal = () => {
  selectedImage.value = null
  showImageModal.value = false
}

const navigateToBooking = () => {
  router.push('/booking')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-card to-background">
    <!-- Hero Section -->
    <section class="relative py-16 lg:py-24">
      <div class="absolute inset-0 bg-[url('@/assets/img/banner.png')] bg-cover bg-center opacity-5" />

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
          {{ t('gallery.title', 'Our Gallery') }}
          <span class="block text-primary text-xl md:text-2xl lg:text-3xl font-normal mt-2">
            {{ t('gallery.subtitle', 'Showcasing Our Beautiful Work') }}
          </span>
        </h1>

        <p class="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          {{ t('gallery.description', 'Browse our collection of stunning transformations and get inspired for your next beauty journey. Each piece represents our commitment to excellence and artistry.') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" @click="navigateToBooking" class="text-lg px-8 py-3">
            <Calendar class="h-5 w-5 mr-2" />
            {{ t('gallery.bookNow', 'Book Your Appointment') }}
          </Button>
        </div>
      </div>
    </section>

    <!-- Category Filter -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-wrap gap-3 justify-center">
        <Button
          :variant="selectedCategory === 'all' ? 'default' : 'outline'"
          @click="selectedCategory = 'all'"
          class="rounded-full"
        >
          {{ t('gallery.allCategories', 'All Categories') }}
        </Button>

        <Button
          v-for="category in filteredCategories"
          :key="category.id"
          :variant="selectedCategory === category.id ? 'default' : 'outline'"
          @click="selectedCategory = category.id"
          class="rounded-full"
        >
          {{ getLocalizedText(category.name, category.name_tr) }}
        </Button>
      </div>
    </section>

    <!-- Gallery Tabs -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="gallery">
            {{ t('gallery.serviceImages', 'Service Gallery') }}
          </TabsTrigger>
          <TabsTrigger value="pastwork">
            {{ t('gallery.pastWork', 'Past Work') }}
          </TabsTrigger>
        </TabsList>

        <!-- Service Images Tab -->
        <TabsContent value="gallery">
          <ConditionalContent
            :is-loading="serviceImagesLoading"
            :has-error="false"
            :error="null"
            :retry="() => {}"
            :is-empty="!serviceImages || serviceImages.length === 0"
            empty-title="No Images Found"
            empty-message="We're still building our gallery. Check back soon!"
            empty-icon="package"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card
                v-for="image in serviceImages"
                :key="image.id"
                class="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                @click="openImageModal(image)"
              >
                <div class="relative aspect-square overflow-hidden">
                  <img
                    :src="image.image_url"
                    :alt="image.display_title || image.service_name"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />

                  <!-- Overlay -->
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                      <Eye class="h-8 w-8 mx-auto mb-2" />
                      <p class="text-sm font-medium">{{ t('gallery.viewImage', 'View Image') }}</p>
                    </div>
                  </div>

                  <!-- Featured Badge -->
                  <div v-if="image.is_featured" class="absolute top-3 right-3">
                    <Badge variant="secondary" class="bg-primary/90 text-primary-foreground">
                      <Star class="h-3 w-3 mr-1" />
                      {{ t('gallery.featured', 'Featured') }}
                    </Badge>
                  </div>
                </div>

                <CardContent class="p-4">
                  <h3 class="font-semibold text-foreground mb-1 line-clamp-1">
                    {{ image.display_title || image.service_name }}
                  </h3>
                  <p class="text-sm text-muted-foreground line-clamp-1">
                    {{ image.category_name }}
                  </p>
                  <p v-if="image.display_description" class="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {{ image.display_description }}
                  </p>
                </CardContent>
              </Card>
            </div>
          </ConditionalContent>
        </TabsContent>

        <!-- Past Work Tab -->
        <TabsContent value="pastwork">
          <ConditionalContent
            :is-loading="pastWorkLoading"
            :has-error="false"
            :error="null"
            :retry="() => {}"
            :is-empty="!pastWork || pastWork.length === 0"
            empty-title="No Past Work Found"
            empty-message="We're building our portfolio. Check back soon for amazing transformations!"
            empty-icon="package"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card
                v-for="work in pastWork"
                :key="work.id"
                class="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                @click="openImageModal(work)"
              >
                <div class="relative">
                  <!-- Before/After Images -->
                  <div class="grid grid-cols-2 gap-1">
                    <div v-if="work.before_image_url" class="relative aspect-square overflow-hidden">
                      <img
                        :src="work.before_image_url"
                        :alt="`Before - ${work.display_title || work.service_name}`"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div class="absolute bottom-2 left-2">
                        <Badge variant="secondary" class="text-xs">
                          {{ t('gallery.before', 'Before') }}
                        </Badge>
                      </div>
                    </div>

                    <div class="relative aspect-square overflow-hidden">
                      <img
                        :src="work.after_image_url"
                        :alt="`After - ${work.display_title || work.service_name}`"
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div class="absolute bottom-2 right-2">
                        <Badge variant="secondary" class="text-xs">
                          {{ t('gallery.after', 'After') }}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <!-- Overlay -->
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                      <Eye class="h-8 w-8 mx-auto mb-2" />
                      <p class="text-sm font-medium">{{ t('gallery.viewDetails', 'View Details') }}</p>
                    </div>
                  </div>

                  <!-- Featured Badge -->
                  <div v-if="work.is_featured" class="absolute top-3 right-3">
                    <Badge variant="secondary" class="bg-primary/90 text-primary-foreground">
                      <Star class="h-3 w-3 mr-1" />
                      {{ t('gallery.featured', 'Featured') }}
                    </Badge>
                  </div>
                </div>

                <CardContent class="p-6">
                  <h3 class="font-semibold text-foreground mb-2 line-clamp-1">
                    {{ work.display_title || work.service_name }}
                  </h3>
                  <p class="text-sm text-muted-foreground mb-3">
                    {{ work.category_name }}
                  </p>
                  <p v-if="work.display_description" class="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {{ work.display_description }}
                  </p>

                  <!-- Tags -->
                  <div v-if="work.display_tags && work.display_tags.length > 0" class="flex flex-wrap gap-1">
                    <Badge
                      v-for="tag in work.display_tags.slice(0, 3)"
                      :key="tag"
                      variant="outline"
                      class="text-xs"
                    >
                      {{ tag }}
                    </Badge>
                    <Badge v-if="work.display_tags.length > 3" variant="outline" class="text-xs">
                      +{{ work.display_tags.length - 3 }}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ConditionalContent>
        </TabsContent>
      </Tabs>
    </section>

    <!-- Image Modal -->
    <Dialog v-model:open="showImageModal" @update:open="showImageModal = $event">
      <DialogContent class="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div v-if="selectedImage" class="relative">
          <DialogHeader class="p-6 pb-4">
            <DialogTitle class="text-xl font-semibold">
              {{ selectedImage.display_title || selectedImage.service_name }}
            </DialogTitle>
            <p class="text-muted-foreground">
              {{ selectedImage.category_name }}
            </p>
          </DialogHeader>

          <div class="px-6 pb-6">
            <!-- Service Image Display -->
            <div v-if="!selectedImage.before_image_url && !selectedImage.after_image_url" class="mb-4">
              <img
                :src="selectedImage.image_url"
                :alt="selectedImage.display_title || selectedImage.service_name"
                class="w-full max-h-96 object-contain rounded-lg"
              />
            </div>

            <!-- Past Work Display -->
            <div v-else class="mb-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div v-if="selectedImage.before_image_url">
                  <p class="text-sm font-medium text-muted-foreground mb-2">
                    {{ t('gallery.before', 'Before') }}
                  </p>
                  <img
                    :src="selectedImage.before_image_url"
                    :alt="`Before - ${selectedImage.display_title || selectedImage.service_name}`"
                    class="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                <div>
                  <p class="text-sm font-medium text-muted-foreground mb-2">
                    {{ t('gallery.after', 'After') }}
                  </p>
                  <img
                    :src="selectedImage.after_image_url"
                    :alt="`After - ${selectedImage.display_title || selectedImage.service_name}`"
                    class="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              </div>

              <!-- Detail Images -->
              <div v-if="selectedImage.detail_images && selectedImage.detail_images.length > 0" class="mb-4">
                <p class="text-sm font-medium text-muted-foreground mb-2">
                  {{ t('gallery.detailImages', 'Detail Images') }}
                </p>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <img
                    v-for="(detailImage, index) in selectedImage.detail_images"
                    :key="index"
                    :src="detailImage"
                    :alt="`Detail ${index + 1}`"
                    class="w-full h-24 object-cover rounded"
                  />
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="selectedImage.display_description" class="mb-4">
              <p class="text-muted-foreground">
                {{ selectedImage.display_description }}
              </p>
            </div>

            <!-- Tags -->
            <div v-if="selectedImage.display_tags && selectedImage.display_tags.length > 0" class="mb-6">
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-for="tag in selectedImage.display_tags"
                  :key="tag"
                  variant="outline"
                >
                  {{ tag }}
                </Badge>
              </div>
            </div>

            <!-- Action Button -->
            <div class="text-center">
              <Button @click="navigateToBooking" class="px-8">
                <Calendar class="h-4 w-4 mr-2" />
                {{ t('gallery.bookNow', 'Book Your Appointment') }}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>



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

h1 {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s ease-in-out;
}

/* Enhanced card hover effects */
.group:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Improved image loading */
img {
  image-rendering: crisp-edges;
}

/* Custom scrollbar for modal content */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}

/* Enhanced focus states for accessibility */
.focus-visible:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Smooth animations for loading states */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Tab transitions */
.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal backdrop */
.dialog-overlay {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Responsive grid adjustments */
@media (max-width: 640px) {
  .grid {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
