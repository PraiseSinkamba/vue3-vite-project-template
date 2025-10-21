<script setup lang="ts">
import { PageHeader } from '@/components/ui/page'
import { storeToRefs } from 'pinia'
import { useProfile } from '@/stores/profile'

const profileStore = useProfile()
const { firstName } = storeToRefs(profileStore)
</script>

<template>
  <PageHeader hide-back-button>
    <template #title>
      <span class="font-bold text-2xl">Hi {{ firstName }}</span>
    </template>
    <template #description> Manage your clients </template>
  </PageHeader>
</template>

<style></style>
