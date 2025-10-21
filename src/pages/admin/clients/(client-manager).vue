<script setup lang="ts">
import ConditionalContent from '@/components/ui/conditional/ConditionalContent.vue'
import PageHeader from '@/components/ui/page/PageHeader.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { useClientStore } from '@/stores/clients'
import {
  UserPlus2,
  MailIcon,
  PhoneIcon,
  ChevronRight,
  Ellipsis,
  Trash2,
  Pencil,
  Eye,
  Phone,
  MessageCircleCode,
} from 'lucide-vue-next'
import ProfileAvatar from '@/components/ui/profile/ProfileAvatar.vue'
import ClientForm from '@/components/admin/client/form/ClientForm.vue'
import { ref } from 'vue'
import type { Client } from '@/types'
import { storeToRefs } from 'pinia'
import RDropdownMenu from '@/components/ui/dropdown-menu/RDropdownMenu.vue'
import { useRouter } from 'vue-router'
import { ResponsiveMenu } from '@/components/ui/dropdown-menu'
import Button from '@/components/ui/button/Button.vue'

const router = useRouter()
const clientStore = useClientStore()
const { clients } = storeToRefs(clientStore)
const { isLoading: clientsLoading, status, error, refetch } = clientStore.fetchClients()
const clientFormOpen = ref(false)
const selectedClient = ref<Client | null>(null)

const handleClientSelect = (client: Client) => {
  selectedClient.value = client
  clientFormOpen.value = true
}

const handleViewClient = (client: Client) => {
  router.push(`/admin/clients/${client.id}`)
}
const handleCallClient = (client: Client) => {
  window.open(`tel:${client.phone}`)
}
const handleWhatsappClient = (client: Client) => {
  window.open(`https://wa.me/${client.whatsapp_number}`)
}
const handleDeleteClient = (client: Client) => {
  //clientStore.deleteClient(client.id)
}

const createNewClient = () => {
  selectedClient.value = null
  clientFormOpen.value = true
}
</script>

<template>
  <div class="flex h-full flex-col">
    <PageHeader
      hide-back-button
      :actions="{ primary: { text: 'Add Client', icon: UserPlus2, onClick: createNewClient } }"
    >
      <template #title>
        <span class="font-bold text-2xl">My Clients</span>
        <span class="text-muted-foreground text-sm">Manage your clients</span>
      </template>
    </PageHeader>

    <ConditionalContent
      class="flex-1"
      :is-loading="clientsLoading"
      :is-empty="status !== 'error' && clients.length === 0"
      :error="error"
    >
      <template #loading>
        <div class="flex flex-col gap-2 h-full p-4">
          <div v-for="num in 10" :key="num" class="flex flex row gap-2">
            <Skeleton class="w-16 h-16 rounded-full"></Skeleton>
            <div class="flex flex-1 flex-col gap-2 py-2">
              <Skeleton class="w-full h-4"></Skeleton>
              <Skeleton class="w-full h-4"></Skeleton>
            </div>
          </div>
        </div>
      </template>
      <template #empty>
        <div class="size-full flex flex-col justify-center items-center">
          <h1 class="font-bold text-2xl">No Clients Found</h1>
          <p class="text-muted-foreground">Add your first client</p>
          <Button @click="createNewClient">Create First Client</Button>
        </div>
      </template>
      <template #default>
        <div class="flex flex-col gap-2">
          <div
            v-for="client in clients"
            :key="client.id"
            class="group flex items-center justify-between p-4 rounded-md hover:bg-muted cursor-pointer transition-colors"
          >
            <!-- Left: Avatar + Info -->
            <div class="flex items-start gap-4">
              <ProfileAvatar
                :src="client.avatar_url"
                :name="client.full_name as string"
                class="w-10 h-10"
              />
              <div class="flex flex-col">
                <p class="text-sm font-medium text-foreground">
                  {{ client.full_name }}
                </p>
                <div class="text-muted-foreground text-xs flex items-center gap-2 mt-1">
                  <MailIcon class="w-4 h-4" />
                  <span>{{ client.email }}</span>
                </div>
                <div class="text-muted-foreground text-xs flex items-center gap-2">
                  <PhoneIcon class="w-4 h-4" />
                  <span>{{ client.phone }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Chevron -->
            <ResponsiveMenu
              :title="client.full_name as string"
              :items="[
                {
                  id: 'view',
                  label: 'View',
                  icon: Eye,
                  onClick: () => handleViewClient(client),
                },
                {
                  id: 'call',
                  label: `Call ${client.full_name?.split(' ')[0]}`,
                  icon: Phone,
                  onClick: () => handleCallClient(client),
                },
                {
                  id: 'whatsapp',
                  label: `Whatsapp ${client.full_name?.split(' ')[0]}`,
                  icon: MessageCircleCode,
                  onClick: () => handleWhatsappClient(client),
                },
                {
                  id: 'edit',
                  label: 'Edit',
                  icon: Pencil,
                  onClick: () => handleClientSelect(client),
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: Trash2,
                  variant: 'destructive',
                  onClick: () => handleDeleteClient(client),
                },
              ]"
            >
              <Button variant="ghost" size="icon">
                <Ellipsis
                  class="size-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </Button>
            </ResponsiveMenu>
          </div>
        </div>
      </template>
      <template #error="{ error }">
        <div class="size-full flex flex-col items-center justify-center">
          <span class="font-bold text-lg">{{ error.code }}</span>
          <p class="text-muted-foreground">{{ error.message }}</p>
          <Button @click="() => refetch(true)">Try again</Button>
        </div>
      </template>
    </ConditionalContent>
  </div>
  <ClientForm v-model:open="clientFormOpen" :client="selectedClient" />
</template>

<style></style>
