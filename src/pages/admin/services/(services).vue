<script setup lang="ts">
import { PageHeader } from '@/components/ui/page'
import {
  BadgeDollarSign,
  Ellipsis,
  GroupIcon,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  PlusIcon,
  Trash,
} from 'lucide-vue-next'
import { ResponsiveMenu, type MenuItem } from '@/components/ui/dropdown-menu'
import Button from '@/components/ui/button/Button.vue'
import { useServiceStore } from '@/stores/services'
import { storeToRefs } from 'pinia'
import Tabs from '@/components/ui/tabs/Tabs.vue'
import TabsList from '@/components/ui/tabs/TabsList.vue'
import TabsTrigger from '@/components/ui/tabs/TabsTrigger.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import ConditionalContent from '@/components/ui/conditional/ConditionalContent.vue'
import ServiceCategoryForm from '@/components/admin/services/forms/ServiceCategoryForm.vue'
import type { ServiceCategory } from '@/types'
const servicesStore = useServiceStore()
const { categorizedServices, servicesCount } = storeToRefs(servicesStore)
const router = useRouter()
const {
  isLoading: servicesLoading,
  status: serviceStatus,
  error: serviceError,
  refetch: refetchServices,
} = servicesStore.fetchServices()
const addItems: MenuItem[] = [
  {
    id: 'new-service',
    label: 'Single Service',
    icon: BadgeDollarSign,
    onClick: () => router.push('/admin/services/new'),
  },
  {
    id: 'new-category',
    label: 'Category',
    icon: GroupIcon,
    onClick: () => newCategory(),
  },
  {
    id: 'new-bundle',
    label: 'Bundle',
    icon: PackagePlus,
    onClick: () => console.log('New Bundle'),
  },
]

function newCategoryService(id: string) {
  router.push(`/admin/services/new?category=${id}`)
}

function deleteCategory(id: string) {}
function handleNewService() {}

const categoryTab = computed(() => {
  const list = [{ name: 'All Categories', value: 'all', count: servicesCount }]
  categorizedServices.value.forEach((category) => {
    list.push({ name: category.name, value: category.id, count: category.services?.length || 0 })
  })
  return list
})

const activeCategory = ref('all')

const categories = computed(() => {
  if (activeCategory.value === 'all') return categorizedServices.value
  return categorizedServices.value.filter((category) => category.id === activeCategory.value)
})

function editService(id: string) {
  router.push(`/admin/services/${id}/edit`)
}

const openCategoryForm = ref(false)
const selectedCategory = ref<ServiceCategory | null>(null)
function newCategory() {
  selectedCategory.value = null
  openCategoryForm.value = true
}
function editCategory(category: ServiceCategory) {
  selectedCategory.value = category
  openCategoryForm.value = true
}
onMounted(() => refetchServices())
</script>

<template>
  <PageHeader hide-back-button>
    <template #title>
      <span class="font-bold text-2xl">My Services</span>
      <span class="text-muted-foreground text-sm">View & Manage your service</span>
    </template>
    <template #actions>
      <ResponsiveMenu :items="addItems" title="Add">
        <Button size="sm"> <Plus /> Add </Button>
      </ResponsiveMenu>
    </template>
  </PageHeader>
  <Tabs default-value="all" v-model:model-value="activeCategory" class="items-center">
    <div class="w-full whitespace-nowrap overflow-x-auto">
      <TabsList class="gap-1 bg-transparent">
        <TabsTrigger
          v-for="category in categoryTab"
          :key="category.value"
          :value="category.value"
          class="group rounded-full data-[state=active]:bg-primary data-[state=inactive]:border border-muted-background data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
        >
          {{ category.name }}
          <span
            class="ml-2 grid h-5 w-5 place-items-center rounded-full border text-[10px] leading-none text-muted-foreground group-data-[state=active]:text-primary-foreground group-data-[state=active]:border-primary-foreground/40 group-data-[state=active]:bg-primary-foreground/20"
          >
            {{ category.count }}
          </span>
        </TabsTrigger>
      </TabsList>
    </div>
  </Tabs>

  <ConditionalContent
    class="flex-1"
    :is-loading="servicesLoading"
    :is-empty="serviceStatus !== 'error' && categorizedServices.length === 0"
    :error="serviceError"
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
          <div class="grid grid-cols-1 gap-2 ml-4">
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
        <h1 class="font-bold text-xl mb-2">No Services Yet</h1>
        <p class="text-muted-foreground text-sm mb-6 max-w-sm">
          Start building your services by adding your first service
        </p>
        <Button @click="handleNewService" class="gap-2">
          <PlusIcon class="w-4 h-4" />
          Add First Service
        </Button>
      </div>
    </template>

    <template #default>
      <div class="flex flex-col gap-6 p-4 pb-8">
        <div v-for="category in categories" :key="category.id" class="space-y-3">
          <!-- Category Header -->
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-base leading-tight">
              {{ category.name }}
            </h3>

            <ResponsiveMenu
              :items="[
                {
                  id: 'new-service',
                  label: 'New Service',
                  icon: BadgeDollarSign,
                  onClick: () => newCategoryService(category.id),
                },
                {
                  id: 'edit',
                  label: 'Edit Category',
                  icon: Pencil,
                  onClick: () => editCategory(category),
                },
                {
                  id: 'delete',
                  label: 'Delete Category',
                  icon: Trash,
                  onClick: () => deleteCategory(category.id),
                },
              ]"
            >
              <Button
                variant="ghost"
                size="sm"
                class="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Ellipsis class="size-5" />
              </Button>
            </ResponsiveMenu>
          </div>

          <!-- Products List -->
          <div class="space-y-2 ml-4">
            <div
              v-for="service in category.services"
              :key="service.id"
              @click="editService(service.id)"
              class="flex flex-row justify-between gap-3 px-3 py-1 rounded-lg border border-muted-background hover:bg-muted-50 transition-colors cursor-pointer"
            >
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-sm leading-tight truncate">
                  {{ service.name }}
                </h4>
                <span class="text-xs text-muted-foreground">
                  {{ service.duration_minutes }} minutes
                </span>
              </div>
              <span class="font-bold text-md"> {{ service.base_price }} TL </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #error="{ error }">
      <div class="size-full flex flex-col items-center justify-center p-6 text-center">
        <div
          class="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4"
        >
          <Package class="w-6 h-6 text-red-500" />
        </div>
        <h2 class="font-bold text-lg mb-2">{{ error?.code || 'Something went wrong' }}</h2>
        <p class="text-muted-foreground text-sm mb-6 max-w-sm">
          {{ error?.message || 'Unable to load your services right now' }}
        </p>
        <Button @click="() => refetchServices(true)" class="gap-2"> Try Again </Button>
      </div>
    </template>
  </ConditionalContent>
  <ServiceCategoryForm v-model:open="openCategoryForm" :category="selectedCategory" />
</template>

<style></style>
