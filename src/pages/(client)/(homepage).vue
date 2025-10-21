<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import ServicesByCategory from '@/components/client/services/ServicesByCategory.vue'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>

<template>
  <!-- Hero Section -->
  <section
    class="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-card to-background"
  >
    <div
      class="absolute inset-0 bg-[url('@/assets/img/banner.png')] bg-cover bg-center opacity-10"
    />

    <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1
        class="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
      >
        Perfect Finish
        <span class="block text-primary text-2xl md:text-3xl lg:text-4xl font-normal mt-2">
          Where Beauty Meets Excellence
        </span>
      </h1>

      <p class="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
        Experience luxury beauty services in our elegant salon. From precision cuts to stunning
        transformations, we create the perfect finish for every client.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button size="lg" asChild class="text-lg px-8 py-3">
          <RouterLink to="/booking">
            <Calendar class="h-5 w-5 mr-2" />
            Book Your Appointment
          </RouterLink>
        </Button>
        <Button variant="outline" size="lg" asChild class="text-lg px-8 py-3">
          <RouterLink to="/portfolio">View Our Work</RouterLink>
        </Button>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <ServicesByCategory />
</template>

<style scoped>
h1 {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
