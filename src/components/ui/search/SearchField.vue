<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

defineProps<{
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'search': [value: string];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    emit('search', (event.target as HTMLInputElement).value);
  }
};
</script>

<template>
  <div class="relative w-full max-w-sm">
    <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    <input
      :value="modelValue"
      :placeholder="placeholder || 'Search...'"
      :disabled="disabled"
      :class="[
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-8 text-sm shadow-sm transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'text-foreground',
        class
      ]"
      type="search"
      @input="handleInput"
      @keydown.enter="handleKeyDown"
    />
  </div>
</template>
