<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Service } from '@/types'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Eye } from 'lucide-vue-next'

interface Props {
  service: Service
}

const props = defineProps<Props>()
const { locale } = useI18n()
const router = useRouter()

const isHovered = ref(false)

// Get service name based on locale
const serviceName = computed(() => {
  return locale.value === 'tr' && props.service.name_tr
    ? props.service.name_tr
    : props.service.name
})

// Get the featured/first image
const primaryImage = computed(() => {
  if (!props.service.service_images || props.service.service_images.length === 0) {
    return null
  }
  const featured = props.service.service_images.find((img) => img.is_featured)
  return featured || props.service.service_images[0]
})

// Get secondary image for hover effect (if available)
const secondaryImage = computed(() => {
  if (!props.service.service_images || props.service.service_images.length < 2) {
    return null
  }
  return props.service.service_images.find((img) => !img.is_featured) || null
})

// Format duration
const formattedDuration = computed(() => {
  const hours = Math.floor(props.service.duration_minutes / 60)
  const minutes = props.service.duration_minutes % 60

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
  return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: 'TRY',
  }).format(props.service.base_price)
})

const handleViewDetails = () => {
  router.push(`/service/${props.service.id}`)
}

const handleBookNow = () => {
  router.push(`/booking?service=${props.service.id}`)
}
</script>

<template>
  <div
    class="group relative bg-card border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50"
    @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <!-- Image Section -->
    <div class="relative aspect-[4/3] overflow-hidden bg-muted" @click="handleViewDetails">
      <!-- Primary Image -->
      <div v-if="primaryImage" class="absolute inset-0 transition-opacity duration-500"
        :class="{ 'opacity-0': isHovered && secondaryImage }">
        <img :src="primaryImage.image_url" :alt="primaryImage.alt_text || serviceName"
          class="w-full h-full object-cover" />
      </div>

      <!-- Secondary Image with Zoom Effect -->
      <div v-if="secondaryImage" class="absolute inset-0 transition-all duration-500"
        :class="{ 'opacity-0 scale-110': !isHovered, 'opacity-100 scale-105': isHovered }">
        <img :src="secondaryImage.image_url" :alt="secondaryImage.alt_text || serviceName"
          class="w-full h-full object-cover transition-transform duration-500" />
      </div>

      <!-- Placeholder if no image -->
      <div v-if="!primaryImage"
        class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <div class="text-center">
          <Eye class="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p class="text-sm text-muted-foreground">No image available</p>
        </div>
      </div>

      <!-- Image Count Badge -->
      <div v-if="service.service_images && service.service_images.length > 1"
        class="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-foreground shadow-sm">
        +{{ service.service_images.length - 1 }}
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-5" @click="handleViewDetails">
      <!-- Service Name -->
      <h3 class="font-serif text-xl font-semibold text-foreground mb-2 line-clamp-2">
        {{ serviceName }}
      </h3>

      <!-- Description -->
      <p v-if="service.description" class="text-sm text-muted-foreground mb-4 line-clamp-2">
        {{ service.description }}
      </p>

      <!-- Info Grid -->
      <div class="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
        <!-- Duration -->
        <div class="flex items-center gap-1.5">
          <Clock class="w-4 h-4" />
          <span>{{ formattedDuration }}</span>
        </div>

        <!-- Price -->
        <div class="flex items-center gap-1.5 font-semibold text-foreground">
          <span class="font-serif">{{ formattedPrice }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <Button variant="outline" size="sm" class="flex-1" @click="handleViewDetails">
          View Details
        </Button>
        <Button size="sm" class="flex-1" @click="handleBookNow">
          <Calendar class="w-4 h-4 mr-1.5" />
          Book Now
        </Button>
      </div>
    </div>
  </div>
</template>
