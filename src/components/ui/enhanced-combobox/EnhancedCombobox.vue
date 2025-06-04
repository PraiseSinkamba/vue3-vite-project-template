<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { NestedOption, EnhancedComboboxProps } from './types'
import ComboboxContent from './ComboboxContent.vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ChevronsUpDown as ChevronsUpDownIcon } from 'lucide-vue-next'
import { useSidebar } from '@/components/ui/sidebar'

const {
  options,
  value,
  onValueChange,
  onLoadChildren,
  onCreateOption,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search options...',
  emptyMessage = 'No options found.',
  className = '',
  disabled = false,
  allowCreate = true,
  maxDepth = 10,
} = defineProps<EnhancedComboboxProps>()

const open = ref(false)
const selectedPath = ref<NestedOption[]>([])
const { isMobile } = useSidebar()
const emit = defineEmits<{
  'update:options': [options: NestedOption[]]
}>()

function handleOptionsUpdate(updatedOptions: NestedOption[]) {
  emit('update:options', updatedOptions)
}
// Recompute selectedPath when value or options change
function findOptionPath(
  options: NestedOption[],
  targetValue: string,
  path: NestedOption[] = []
): NestedOption[] {
  for (const option of options) {
    const newPath = [...path, option]
    const match = option.value === targetValue
    if (match) {
      return newPath
    }
    if (option.children) {
      const result = findOptionPath(option.children, targetValue, newPath)
      if (result.length > 0)  return result
    }
  }
  return []
}

watch(
  [() => value, () => options],
  ([newValue, newOptions]) => {
    if (newValue) {
      selectedPath.value = findOptionPath(newOptions, newValue)
    } else {
      selectedPath.value = []
    }
  },
  { immediate: true },
)

function handleValueChange(newValue: string, path: NestedOption[]) {
  onValueChange?.(newValue, path)
  open.value = false
  selectedPath.value = path
}

const displayValue = computed(() => {
  return selectedPath.value.length > 0
    ? selectedPath.value.map((opt) => opt.label).join(' / ')
    : placeholder
})
</script>

<template>
  <div>
    <template v-if="isMobile">
      <Drawer v-model:open="open">
        <DrawerTrigger as-child>
          <Button
            variant="outline"
            role="combobox"
            :aria-expanded="open"
            :class="['w-full justify-between', className]"
            :disabled="disabled"
          >
            <span class="truncate">{{ displayValue }}</span>
            <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DrawerTrigger>
        <DrawerContent class="max-h-[80vh]">
          <DrawerHeader class="text-left">
            <DrawerTitle>Select Option</DrawerTitle>
          </DrawerHeader>
          <div class="px-0 pb-4">
            <ComboboxContent
              :options="options"
              :value="value"
              :onValueChange="handleValueChange"
              :onLoadChildren="onLoadChildren"
              :onCreateOption="onCreateOption"
              :onOptionsUpdate="handleOptionsUpdate"
              :searchPlaceholder="searchPlaceholder"
              :emptyMessage="emptyMessage"
              :allowCreate="allowCreate"
              :maxDepth="maxDepth"
            />
          </div>
        </DrawerContent>
      </Drawer>
    </template>
    <template v-else>
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            role="combobox"
            :aria-expanded="open"
            :class="['w-full justify-between', className]"
            :disabled="disabled"
          >
            <span class="truncate">{{ displayValue }}</span>
            <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[400px] p-0" align="start">
          <ComboboxContent
            :options="options"
            :value="value"
            :onValueChange="handleValueChange"
            :onLoadChildren="onLoadChildren"
            :onCreateOption="onCreateOption"
            :onOptionsUpdate="handleOptionsUpdate"
            :searchPlaceholder="searchPlaceholder"
            :emptyMessage="emptyMessage"
            :allowCreate="allowCreate"
            :maxDepth="maxDepth"
          />
        </PopoverContent>
      </Popover>
    </template>
  </div>
</template>
