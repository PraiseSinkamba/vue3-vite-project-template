<script setup lang="ts">
import PageHeader from '@/components/ui/page/PageHeader.vue'
import { useServiceStore } from '@/stores/services'
import { useInventoryStore } from '@/stores/inventory'
import { useRoute } from 'vue-router'
import ServiceForm from '@/components/admin/services/forms/ServiceForm.vue'

const route = useRoute('/admin/services/new')
const serviceStore = useServiceStore()
const inventoryStore = useInventoryStore()
</script>

<template>
  <div class="min-h-screen bg-background">
    <PageHeader
      title="Add New Service"
      subtitle="Create a new service offering for your business"
    />

    <div class="max-w-7xl mx-auto px-6 py-8">
      <ServiceForm :category="route.query.category as string | undefined" />
    </div>
  </div>
</template>
