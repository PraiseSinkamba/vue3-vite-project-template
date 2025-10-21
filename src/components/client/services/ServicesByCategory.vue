<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useServiceStore } from '@/stores/services'
import { ConditionalContent } from '@/components/ui/conditional'
import ServiceCard from '@/components/client/services/ServiceCard.vue'
import type { ServiceCategory } from '@/types'

const { locale } = useI18n()
const serviceStore = useServiceStore()

// Fetch services with images
const { data: categories, isLoading, status, error, refresh } = serviceStore.fetchServicesWithImages()

// Helper to get category name based on locale
const getCategoryName = (category: ServiceCategory) => {
  return locale.value === 'tr' && category.name_tr ? category.name_tr : category.name
}

// Helper to get category description based on locale
const getCategoryDescription = (category: ServiceCategory) => {
  // TODO (Add turkish description later)
  return locale.value === 'tr' && category.description
    ? category.description
    : category.description
}
</script>

<template>
  <section class="py-16 bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          Our Services
        </h2>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our range of professional beauty services, each designed to bring out your best.
        </p>
      </div>

      <!-- Services Content -->
      <ConditionalContent :is-loading="isLoading" :has-error="status === 'error'" :error="error" :retry="refresh"
        :is-empty="!categories || categories.length === 0" empty-title="No Services Available"
        empty-message="We're currently updating our service offerings. Please check back soon." empty-icon="package">
        <!-- Categories -->
        <div v-if="categories" class="space-y-16">
          <div v-for="category in categories" :key="category.id" class="space-y-6">
            <!-- Category Header -->
            <div class="text-center md:text-left">
              <h3 class="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
                {{ getCategoryName(category) }}
              </h3>
              <p v-if="getCategoryDescription(category)" class="text-muted-foreground max-w-3xl">
                {{ getCategoryDescription(category) }}
              </p>
            </div>

            <!-- Services Grid -->
            <div v-if="category.services && category.services.length > 0"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ServiceCard v-for="service in category.services" :key="service.id" :service="service" />
            </div>
          </div>
        </div>
      </ConditionalContent>
    </div>
  </section>
</template>
