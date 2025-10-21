<script setup lang="ts">
import ConditionalContent from '@/components/ui/conditional/ConditionalContent.vue'
import PageHeader from '@/components/ui/page/PageHeader.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { UserPlus2, PlusIcon, Package, Sparkles, Palette, Gem } from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'vue-router'

const inventoryStore = useInventoryStore()
const { categorizedProducts } = storeToRefs(inventoryStore)
const {
  isLoading: productsLoading,
  status: productStatus,
  error,
  refetch: refetchProducts,
} = inventoryStore.fetchProducts()

// Category icon mapping for cute factor
const getCategoryIcon = (categoryName: string, productType?: string) => {
  const name = categoryName.toLowerCase()
  if (name.includes('polygel') || productType === 'polygel') return Package
  if (name.includes('chrome') || productType === 'chrome') return Sparkles
  if (name.includes('polish') || name.includes('gel')) return Palette
  if (name.includes('decoration') || productType === 'decoration') return Gem
  return Package
}

// Get category color for subtle theming
const getCategoryColor = (categoryName: string, productType?: string) => {
  const name = categoryName.toLowerCase()
  if (name.includes('polygel') || productType === 'polygel')
    return 'bg-blue-50 text-blue-600 border-blue-100'
  if (name.includes('chrome') || productType === 'chrome')
    return 'bg-purple-50 text-purple-600 border-purple-100'
  if (name.includes('polish') || name.includes('gel'))
    return 'bg-pink-50 text-pink-600 border-pink-100'
  if (name.includes('decoration') || productType === 'decoration')
    return 'bg-amber-50 text-amber-600 border-amber-100'
  return 'bg-gray-50 text-gray-600 border-gray-100'
}

const router = useRouter()

const handleNewProduct = () => {
  router.push('/admin/inventory/new')
}

const newCategoryProduct = (categoryId: string) => {
  router.push(`/admin/inventory/new?category=${categoryId}`)
}

function editProduct(productId: string) {
  router.push(`/admin/inventory/${productId}/edit`)
}
</script>

<template>
  <div class="flex h-full flex-col">
    <PageHeader
      hide-back-button
      :actions="{ primary: { text: 'New Product', icon: UserPlus2, onClick: handleNewProduct } }"
    >
      <template #title>
        <span class="font-bold text-2xl">My Products</span>
        <span class="text-muted-foreground text-sm">Manage your products & supplies</span>
      </template>
    </PageHeader>

    <ConditionalContent
      class="flex-1"
      :is-loading="productsLoading"
      :is-empty="productStatus !== 'error' && categorizedProducts.length === 0"
      :error="error"
    >
      <template #loading>
        <div class="flex flex-col gap-4 p-4">
          <div v-for="num in 6" :key="num" class="space-y-3">
            <!-- Category header skeleton -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Skeleton class="w-10 h-10 rounded-xl" />
                <div class="space-y-2">
                  <Skeleton class="w-24 h-4" />
                  <Skeleton class="w-16 h-3" />
                </div>
              </div>
              <Skeleton class="w-8 h-8 rounded-lg" />
            </div>

            <!-- Product items skeleton -->
            <div class="grid grid-cols-1 gap-2 ml-8">
              <div v-for="item in 2" :key="item" class="flex items-center gap-3 p-3">
                <Skeleton class="w-8 h-8 rounded-lg" />
                <div class="flex-1 space-y-2">
                  <Skeleton class="w-32 h-3" />
                  <Skeleton class="w-20 h-3" />
                </div>
                <Skeleton class="w-12 h-6 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="size-full flex flex-col justify-center items-center p-6 text-center">
          <div
            class="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-4"
          >
            <Package class="w-8 h-8 text-gray-400" />
          </div>
          <h1 class="font-bold text-xl mb-2">No Products Yet</h1>
          <p class="text-muted-foreground text-sm mb-6 max-w-sm">
            Start building your inventory by adding your first nail products and supplies
          </p>
          <Button @click="handleNewProduct" class="gap-2">
            <PlusIcon class="w-4 h-4" />
            Add First Product
          </Button>
        </div>
      </template>

      <template #default>
        <div class="flex flex-col gap-6 p-4 pb-8">
          <div v-for="category in categorizedProducts" :key="category.id" class="space-y-3">
            <!-- Category Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl border flex items-center justify-center"
                  :class="getCategoryColor(category.name)"
                >
                  <component :is="getCategoryIcon(category.name)" class="w-5 h-5" />
                </div>
                <div class="flex flex-col">
                  <h3 class="font-semibold text-base leading-tight">
                    {{ category.name }}
                  </h3>
                  <p class="text-xs text-muted-foreground">
                    {{ category.products?.length || 0 }}
                    {{ category.products?.length === 1 ? 'item' : 'items' }}
                  </p>
                </div>
              </div>
              <Button
                @click="newCategoryProduct(category.id)"
                variant="ghost"
                size="sm"
                class="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <PlusIcon class="w-4 h-4" />
              </Button>
            </div>

            <!-- Products List -->
            <div class="space-y-2 ml-13">
              <div
                v-for="product in category.products"
                :key="product.id"
                @click="editProduct(product.id)"
                class="flex items-center gap-3 p-3 rounded-lg border border-muted-background hover:bg-muted-50 transition-colors cursor-pointer"
              >
                <div
                  class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"
                >
                  <component
                    :is="getCategoryIcon(category.name, product.product_type)"
                    class="w-4 h-4 text-gray-500"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-sm leading-tight truncate">
                    {{ product.name }}
                  </h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span v-if="product.brand" class="text-xs text-muted-foreground truncate">
                      {{ product.brand }}
                    </span>
                    <Badge
                      v-if="product.track_quantity || product.track_usage"
                      variant="secondary"
                      class="text-xs px-1.5 py-0.5 h-auto"
                    >
                      {{ product.track_quantity ? 'Qty' : 'Usage' }}
                    </Badge>
                  </div>
                </div>

                <!-- Stock indicator or action -->
                <div class="flex-shrink-0">
                  <div class="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
              </div>

              <!-- Empty category state -->
            </div>
          </div>
        </div>
      </template>

      <template #error>
        <div class="size-full flex flex-col items-center justify-center p-6 text-center">
          <div
            class="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4"
          >
            <Package class="w-6 h-6 text-red-500" />
          </div>
          <h2 class="font-bold text-lg mb-2">{{ error!.code || 'Something went wrong' }}</h2>
          <p class="text-muted-foreground text-sm mb-6 max-w-sm">
            {{ error?.message || 'Unable to load your products right now' }}
          </p>
          <Button @click="() => refetchProducts(true)" class="gap-2"> Try Again </Button>
        </div>
      </template>
    </ConditionalContent>
  </div>
</template>
