<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useServiceStore } from '@/stores/services'
import { ConditionalContent } from '@/components/ui/conditional'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, ImageIcon, Plus, Check } from 'lucide-vue-next'
import type { AddOn } from '@/types'
import { serviceDetailMessages } from './i18n/service-detail'
import ImageGalleryCarousel from '@/components/client/services/ImageGalleryCarousel.vue'
import { useMobile } from '@/composables/useMobile'

const route = useRoute()
const router = useRouter()
const serviceStore = useServiceStore()
const { isMobile } = useMobile()
const { t, locale } = useI18n({
  messages: {
    en: serviceDetailMessages.en,
    tr: serviceDetailMessages.tr,
  },
})

// Get service ID from route params
const serviceId = computed(() => route.params.id as string)

// Fetch service detail and addons
const serviceQuery = serviceStore.fetchServiceDetailById(serviceId)
const addonsQuery = serviceStore.fetchAddons()

// Selected addons for booking
const selectedAddons = ref<Set<string>>(new Set())

// Computed properties
const service = computed(() => serviceQuery.data.value)
const addons = computed(() => addonsQuery.data.value || [])

const serviceName = computed(() => {
  if (!service.value) return ''
  return locale.value === 'tr' && service.value?.name_tr
    ? service.value.name_tr
    : service.value.name
})

const serviceDescription = computed(() => {
  if (!service.value) return ''
  return service.value.description || ''
})

const categoryName = computed(() => {
  if (!service.value?.service_category) return ''
  const category = service.value.service_category
  return locale.value === 'tr' && category.name_tr
    ? category.name_tr
    : category.name
})

// Format duration
const formattedDuration = computed(() => {
  if (!service.value) return ''
  const hours = Math.floor(service.value.duration_minutes / 60)
  const minutes = service.value.duration_minutes % 60

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${minutes}min`
  }
})

// Format price
const formattedPrice = computed(() => {
  if (!service.value) return ''
  return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: 'TRY',
  }).format(service.value.base_price)
})

// Primary image for hero section
const primaryImage = computed(() => {
  if (!service.value?.service_images || service.value.service_images.length === 0) {
    return null
  }
  const featured = service.value.service_images.find((img) => img.is_featured)
  return featured || service.value.service_images[0]
})

// Gallery images (excluding primary)
const galleryImages = computed(() => {
  if (!service.value?.service_images) return []
  if (!primaryImage.value) return service.value.service_images
  return service.value.service_images.filter((img) => img.id !== primaryImage.value?.id)
})

// Lightbox state
const lightboxOpen = ref(false)
const lightboxImageIndex = ref(0)

const openLightbox = (index: number) => {
  lightboxImageIndex.value = index
  lightboxOpen.value = true
}

// Addon selection
const toggleAddon = (addonId: string) => {
  if (selectedAddons.value.has(addonId)) {
    selectedAddons.value.delete(addonId)
  } else {
    selectedAddons.value.add(addonId)
  }
}

const formatAddonPrice = (addon: AddOn) => {
  if (!addon.price || addon.price === 0) {
    return t('free')
  }
  return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: 'TRY',
  }).format(addon.price)
}

const formatAddonTime = (minutes: number | null) => {
  if (!minutes) return ''
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }
  return `${minutes}min`
}

const getAddonName = (addon: AddOn) => {
  return locale.value === 'tr' && addon.name_tr ? addon.name_tr : addon.name
}

// Navigation
const goBack = () => {
  router.push('/services')
}

const handleBookNow = () => {
  const addonIds = Array.from(selectedAddons.value).join(',')
  router.push({
    path: '/booking',
    query: {
      service: serviceId.value,
      ...(addonIds && { addons: addonIds }),
    },
  })
}

// Combined loading state
const isLoading = computed(() => serviceQuery.isLoading.value || addonsQuery.isLoading.value)
const hasError = computed(() => serviceQuery.status.value === 'error')
</script>

<template>
  <div class="min-h-screen bg-background">
    <ConditionalContent :is-loading="isLoading" :has-error="hasError" :error="hasError ? serviceQuery.error : undefined"
      :retry="serviceQuery.refresh" :is-empty="!service" :empty-title="t('serviceNotFound')"
      :empty-message="t('serviceNotFoundMessage')" empty-icon="search">
      <div v-if="service" class="pb-24 lg:pb-20">
        <!-- Hero Image Section -->
        <div class="relative h-[50vh] min-h-[400px] bg-muted overflow-hidden">
          <div v-if="primaryImage" class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${primaryImage.image_url})` }">
            <!-- Enhanced gradient overlay for better text contrast -->
            <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          </div>
          <div v-else class="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />

          <!-- Back Button -->
          <div class="absolute top-6 left-6 z-10">
            <Button variant="outline" size="sm" class="bg-background/90 backdrop-blur-sm" @click="goBack">
              <ArrowLeft class="w-4 h-4 mr-2" />
              {{ t('backToServices') }}
            </Button>
          </div>

          <!-- Service Title Overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div class="max-w-7xl mx-auto">
              <div class="mb-2">
                <span
                  class="inline-block px-3 py-1 text-sm font-medium bg-primary text-primary-foreground rounded-full shadow-lg">
                  {{ categoryName }}
                </span>
              </div>
              <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 drop-shadow-2xl [text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]">
                {{ serviceName }}
              </h1>
              <div class="flex flex-wrap items-center gap-4 text-white drop-shadow-lg">
                <div class="flex items-center gap-2">
                  <Clock class="w-5 h-5 drop-shadow-md" />
                  <span class="font-medium">{{ formattedDuration }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-serif text-2xl font-bold">{{ formattedPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Description -->
              <div v-if="serviceDescription" class="bg-card border rounded-lg p-6">
                <h2 class="font-serif text-2xl font-semibold text-foreground mb-4">
                  {{ t('description') }}
                </h2>
                <p class="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {{ serviceDescription }}
                </p>
              </div>

              <!-- Gallery -->
              <div v-if="service.service_images && service.service_images.length > 0"
                class="bg-card border rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="font-serif text-2xl font-semibold text-foreground">
                    {{ t('gallery') }}
                  </h2>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon class="w-4 h-4" />
                    <span>{{ service.service_images.length }} {{ t('images', service.service_images.length) }}</span>
                  </div>
                </div>

                <!-- Gallery Grid -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <button v-for="(image, index) in service.service_images" :key="image.id"
                    class="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    @click="openLightbox(index)">
                    <img :src="image.image_url" :alt="image.alt_text || serviceName"
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div
                      class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <ImageIcon
                        class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </button>
                </div>

                <!-- Full-screen Carousel -->
                <ImageGalleryCarousel
                  v-if="service.service_images"
                  :images="service.service_images"
                  :initial-index="lightboxImageIndex"
                  :open="lightboxOpen"
                  :service-name="serviceName"
                  @close="lightboxOpen = false"
                />
              </div>

              <!-- Add-ons -->
              <div v-if="addons.length > 0" class="bg-card border rounded-lg p-6">
                <h2 class="font-serif text-2xl font-semibold text-foreground mb-2">
                  {{ t('addons') }}
                </h2>
                <p class="text-muted-foreground mb-6">{{ t('addonsDescription') }}</p>

                <div class="space-y-3">
                  <button v-for="addon in addons" :key="addon.id"
                    class="w-full flex items-start gap-4 p-4 border rounded-lg transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                    :class="{
                      'bg-primary/5 border-primary': selectedAddons.has(addon.id),
                      'bg-background': !selectedAddons.has(addon.id),
                    }" @click="toggleAddon(addon.id)">
                    <!-- Checkbox -->
                    <div
                      class="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                      :class="{
                        'bg-primary border-primary': selectedAddons.has(addon.id),
                        'border-border': !selectedAddons.has(addon.id),
                      }">
                      <Check v-if="selectedAddons.has(addon.id)" class="w-4 h-4 text-primary-foreground" />
                    </div>

                    <!-- Content -->
                    <div class="flex-1 text-left">
                      <div class="font-semibold text-foreground mb-1">{{ getAddonName(addon) }}</div>
                      <p v-if="addon.description" class="text-sm text-muted-foreground mb-2">
                        {{ addon.description }}
                      </p>
                      <div class="flex items-center gap-3 text-sm">
                        <span class="font-semibold text-primary">{{ formatAddonPrice(addon) }}</span>
                        <span v-if="addon.additional_time_minutes" class="text-muted-foreground">
                          +{{ formatAddonTime(addon.additional_time_minutes) }}
                        </span>
                      </div>
                    </div>

                    <!-- Icon -->
                    <div class="flex-shrink-0">
                      <Plus class="w-5 h-5 transition-transform" :class="{
                        'text-primary rotate-45': selectedAddons.has(addon.id),
                        'text-muted-foreground': !selectedAddons.has(addon.id),
                      }" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Sidebar - Booking Card -->
            <div class="lg:col-span-1">
              <div class="sticky top-6 bg-card border rounded-lg p-6 shadow-sm">
                <div class="mb-6">
                  <div class="text-sm text-muted-foreground mb-1">{{ t('startingFrom') }}</div>
                  <div class="font-serif text-3xl font-bold text-foreground">{{ formattedPrice }}</div>
                </div>

                <div class="space-y-4 mb-6">
                  <div class="flex items-center gap-3 text-muted-foreground">
                    <Clock class="w-5 h-5 flex-shrink-0" />
                    <span>{{ formattedDuration }}</span>
                  </div>
                  <div v-if="categoryName" class="flex items-center gap-3 text-muted-foreground">
                    <div class="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <div class="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span>{{ categoryName }}</span>
                  </div>
                </div>

                <Button size="lg" class="w-full" @click="handleBookNow">
                  <Calendar class="w-5 h-5 mr-2" />
                  {{ t('bookNow') }}
                </Button>

                <p v-if="selectedAddons.size > 0" class="text-xs text-muted-foreground mt-4 text-center">
                  {{ selectedAddons.size }} {{ t('addons').toLowerCase() }} {{ locale === 'tr' ? 'seçildi' : 'selected'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Book Now Button (Mobile Only) -->
        <Transition
          enter-active-class="transition-transform duration-300"
          enter-from-class="translate-y-full"
          enter-to-class="translate-y-0"
          leave-active-class="transition-transform duration-300"
          leave-from-class="translate-y-0"
          leave-to-class="translate-y-full"
        >
          <div
            v-if="isMobile"
            class="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t shadow-lg safe-area-bottom"
          >
            <div class="max-w-7xl mx-auto px-4 py-4">
              <div class="flex items-center justify-between gap-3 mb-2">
                <div>
                  <div class="text-xs text-muted-foreground">{{ t('startingFrom') }}</div>
                  <div class="font-serif text-xl font-bold text-foreground">{{ formattedPrice }}</div>
                </div>
                <Button size="lg" class="flex-1 max-w-xs" @click="handleBookNow">
                  <Calendar class="w-5 h-5 mr-2" />
                  {{ t('bookNow') }}
                </Button>
              </div>
              <p v-if="selectedAddons.size > 0" class="text-xs text-muted-foreground text-center">
                {{ selectedAddons.size }} {{ t('addons').toLowerCase() }} {{ locale === 'tr' ? 'seçildi' : 'selected' }}
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </ConditionalContent>
  </div>
</template>

<style scoped>
/* Safe area support for notched devices */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
