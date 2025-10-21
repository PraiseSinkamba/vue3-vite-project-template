<script setup lang="ts">
import ProductForm from '@/components/admin/inventory/form/ProductForm.vue';
import PageHeader from '@/components/ui/page/PageHeader.vue'
import { useRoute } from 'vue-router'

const route = useRoute('/admin/inventory/new')
</script>

<template>
  <div class="min-h-screen bg-background">
    <PageHeader title="Add New Product" subtitle="Add a new product to the inventory" />
    <div class="max-w-7xl mx-auto px-6 py-8">
      <ProductForm :category="route.query.category as string" />
    </div>
  </div>
</template>
