<script setup lang="ts">
import PageHeader from '@/components/ui/page/PageHeader.vue'
import { useServiceStore } from '@/stores/services'
import { useRoute } from 'vue-router'
import ServiceForm from '@/components/admin/services/forms/ServiceForm.vue'
import ConditionalContent from '@/components/ui/conditional/ConditionalContent.vue'
import router from '@/router'

const route = useRoute('/admin/services/[id]/edit')
const {
  data: service,
  isLoading: serviceLoading,
  error: serviceError,
  refetch: refetchService,
} = useServiceStore().getServiceById(route.params.id as string)

function myServices() {
  router.push('/admin/services')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <PageHeader title="Edit Service" subtitle="Update your service" />

    <div class="max-w-7xl mx-auto px-6 py-8">
      <ConditionalContent
        :is-loading="serviceLoading"
        :has-error="service === undefined"
        :error="serviceError"
        :retry="refetchService"
      >
        <template #default>
          <ServiceForm :service="service" />
        </template>
        <template #error="{ error, retry }">
          <div class="size-full flex flex-col items-center justify-center">
            <span class="font-bold text-lg">{{
              error?.code === 'PGRST116' ? 'Not found' : error?.code
            }}</span>
            <p class="text-muted-foreground">
              {{ error?.code === 'PGRST116' ? 'Service not found' : error?.message }}
            </p>
            <Button v-if="error?.code === 'PGRST116'" @click="myServices">My Services</Button>
            <Button v-else @click="retry">Try again</Button>
          </div>
        </template>
      </ConditionalContent>
    </div>
  </div>
</template>
