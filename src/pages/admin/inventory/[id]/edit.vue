<script setup lang="ts">
import ProductForm from '@/components/admin/inventory/form/ProductForm.vue'
import { ConditionalContent } from '@/components/ui/conditional'
import {PageHeader} from '@/components/ui/page'
import { useInventoryStore } from '@/stores/inventory'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute('/admin/inventory/[id]/edit')
const { fetchProductById } = useInventoryStore()
const { data: product, isLoading, error, refetch } = fetchProductById(route.params.id as string)

function myProducts() {
  router.push('/admin/inventory')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <PageHeader title="Edit Service" subtitle="Create a new service offering for your business" />

    <div class="max-w-7xl mx-auto px-6 py-8">
      <ConditionalContent
        :is-loading="isLoading"
        :has-error="product === undefined"
        :error="error"
        :retry="refetch"
      >
        <template #default>
          <ProductForm :product="product" />
        </template>
        <template #error="{ error, retry }">
          <div class="size-full flex flex-col items-center justify-center">
            <span class="font-bold text-lg">{{
              error?.code === 'PGRST116' ? 'Not found' : error?.code
            }}</span>
            <p class="text-muted-foreground">
              {{ error?.code === 'PGRST116' ? 'Service not found' : error?.message }}
            </p>
            <Button v-if="error?.code === 'PGRST116'" @click="myProducts">My products</Button>
            <Button v-else @click="retry">Try again</Button>
          </div>
        </template>
      </ConditionalContent>
    </div>
  </div>
</template>
