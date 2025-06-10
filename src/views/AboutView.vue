<script setup lang="ts">
import PageHeader from '@/components/ui/page/PageHeader.vue'
import ResponsiveDropdownDemo from '@/components/ui/dropdown-menu/ResponsiveDropdownDemo.vue'
import { ref } from 'vue'
import { Check, Copy, Edit, Share2 } from 'lucide-vue-next'
import type {Action,PageBadge} from '@/components/ui/page'
const title = ref('About View')
const subtitle = ref('about view details')

const secondaryActions = ref<Action[]>([
  {
    icon: Edit,
    text: 'Edit',
    onClick: () => alert('Edit clicked!'),
  },
  {
    icon: Copy,
    text: 'Copy',
    onClick: () => alert('Copied to clipboard!'),
  },
  {
    icon: Share2,
    text: 'Share',
    onClick: () => alert('Sharing content...'),
  },
])

const primaryAction = ref<Action>({
  icon: Check, // Lucide's Check icon
  text: 'Confirm',
  onClick: () => alert('Primary action confirmed!'),
})
const titleBadges = ref<PageBadge[]>([
  {
    icon: Check,
    text: 'Check',
    variant: 'outline',
  },
])
</script>

<template>
  <div class="size-full">
    <PageHeader
    :title=" title"
    :title-badges="titleBadges"
    :subtitle="subtitle"
    :actions="{
      primary: primaryAction,
      secondary: secondaryActions,
    }"/>
    <ResponsiveDropdownDemo/>
  </div>
</template>

<style></style>
