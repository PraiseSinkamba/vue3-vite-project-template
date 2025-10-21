<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { computed } from 'vue'
const props = defineProps<{ src?: string | null; name: string }>()
const initials = computed(() =>
  props.name
    .split(' ')
    .map((name) => name[0])
    .join(''),
)
</script>

<template>
  <Avatar>
    <AvatarImage v-if="props.src" :src="props.src" />
    <AvatarFallback>
      {{ initials }}
    </AvatarFallback>
  </Avatar>
</template>
