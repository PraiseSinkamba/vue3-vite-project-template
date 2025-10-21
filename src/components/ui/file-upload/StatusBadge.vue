<script setup lang="ts">
import { Check, Clock, Loader2, XCircle } from 'lucide-vue-next'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

// Props
const props = defineProps<{
  status?: 'pending' | 'uploading' | 'completed' | 'failed'
}>()

// Computed
const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors'

  const variantClasses = {
    pending: 'bg-muted text-muted-foreground',
    uploading: 'bg-primary/10 text-primary',
    completed: 'bg-primary/10 text-primary',
    failed: 'bg-destructive/10 text-destructive',
  }

  return cn(baseClasses, variantClasses[props.status || 'pending'])
})

const statusText = computed(() => {
  const textMap = {
    pending: 'Pending',
    uploading: 'Uploading',
    completed: 'Completed',
    failed: 'Failed',
  }
  return textMap[props.status || 'pending']
})

const icon = computed(() => {
  const iconMap = {
    pending: Clock,
    uploading: Loader2,
    completed: Check,
    failed: XCircle,
  }
  return iconMap[props.status || 'pending']
})
</script>

<template>
  <span v-if="status && status !== 'pending'" :class="badgeClasses">
    <component
      :is="icon"
      :class="cn('size-3', status === 'uploading' && 'animate-spin')"
    />
    {{ statusText }}
  </span>
</template>
