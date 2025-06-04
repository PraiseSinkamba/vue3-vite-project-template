<!-- src/components/InteractiveBreadcrumb.vue -->
<template>
  <div
    v-if="path.length"
    :class="['flex items-center gap-1 px-3 py-2 border-b bg-muted/30', className]"
  >
    <Button
      variant="ghost"
      size="sm"
      @click="() => onNavigate(-1)"
      class="h-6 px-2 text-xs"
      title="Go to root"
    >
      <HomeIcon class="h-3 w-3" />
    </Button>
    <ChevronRightIcon class="h-3 w-3 text-muted-foreground" />
    <template v-for="(item, index) in path" :key="item.id">
      <Button
        variant="ghost"
        size="sm"
        @click="() => onNavigate(index)"
        class="h-6 px-2 text-xs hover:bg-accent"
        :title="`Go to ${item.label}`"
      >
        {{ item.label }}
      </Button>
      <ChevronRightIcon
        v-if="index < path.length - 1"
        class="h-3 w-3 text-muted-foreground"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { BreadcrumbProps } from './types';
import { Button } from '@/components/ui/button';
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-vue-next';
const { path, onNavigate, className } = defineProps<BreadcrumbProps>();;
</script>
