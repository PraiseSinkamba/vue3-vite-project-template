<!-- src/components/ErrorRecovery.vue -->
<template>
  <Alert class="m-2 border-destructive/50 bg-destructive/5">
    <component
      :is="isNetworkError ? WifiOffIcon : AlertCircleIcon"
      class="h-4 w-4 mt-0.5"
    />
    <AlertTitle class="text-sm font-medium">Something went wrong</AlertTitle>
    <AlertDescription class="text-xs text-muted-foreground mt-1">{{ error }}</AlertDescription>
    <div class="flex flex-wrap gap-2 col-span-4">
      <Button
        variant="outline"
        size="sm"
        @click="onRetry"
        class="h-7 text-xs"
      >
        <RefreshCwIcon class="h-3 w-3 mr-1" />
        Retry
      </Button>
      <Button
        v-if="canGoBack"
        variant="outline"
        size="sm"
        @click="onGoBack"
        class="h-7 text-xs"
      >
        <ChevronLeftIcon class="h-3 w-3 mr-1" />
        Go Back
      </Button>
      <Button
        variant="outline"
        size="sm"
        @click="onClearAndRetry"
        class="h-7 text-xs"
      >
        <HomeIcon class="h-3 w-3 mr-1" />
        Start Over
      </Button>
    </div>
  </Alert>
</template>

<script setup lang="ts">
import type { ErrorRecoveryProps } from './types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  WifiOff as WifiOffIcon,
  AlertCircle as AlertCircleIcon,
  RefreshCw as RefreshCwIcon,
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
} from 'lucide-vue-next';
import { computed } from 'vue'

const props = defineProps<ErrorRecoveryProps>();
const {
  error,
  onRetry,
  onGoBack,
  onClearAndRetry,
  canGoBack,
} = props;
const isNetworkError = computed(() => {
  const lowered = props.error.toLowerCase();
  return lowered.includes('network') || lowered.includes('fetch');
});
</script>
