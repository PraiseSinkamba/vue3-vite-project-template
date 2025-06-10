<script setup lang="ts">
import { onMounted } from 'vue'
import type { NestedOption } from './types'
import { useEnhancedCombobox } from './useEnhancedCombobox.ts'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Check as CheckIcon,
  ArrowLeft as ArrowLeftIcon,
  ChevronRight as ChevronRightIcon,
  RefreshCwIcon,
  ChevronLeftIcon,
  HomeIcon,
  Plus as PlusIcon,
  X as XIcon,
  Loader as LoadingIcon,
} from 'lucide-vue-next'
import InteractiveBreadcrumb from './InteractiveBreadcrumb.vue'
import ErrorRecovery from './ErrorRecovery.vue'
import { templateRef } from '@vueuse/core'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  options: NestedOption[]
  value?: string
  onValueChange?: (value: string, path: NestedOption[]) => void
  onLoadChildren?: (parentId: string) => Promise<NestedOption[]>
  onCreateOption?: (label: string, parentId?: string) => Promise<NestedOption>
  onOptionsUpdate?: (options: NestedOption[]) => void
  searchPlaceholder: string
  emptyMessage: string
  allowCreate: boolean
  maxDepth: number
}

const props = defineProps<Props>()
const {
  searchValue,
  currentPath,
  loadingStates,
  loadingContent,
  filteredOptions,
  highlightedIndex,
  error,
  canCreateNew,
  handleBack,
  handleSelect,
  handleNavigateToChildren,
  handleCreateOption,
  handleBreadcrumbNavigate,
  handleRetry,
  handleClearAndRetry,
} = useEnhancedCombobox(props)

const commandRef = templateRef<HTMLDivElement>('templateRef')
const inputRef = templateRef<HTMLInputElement>('inputRef')

// Focus input on mount
onMounted(() => {
  inputRef.value?.focus?.()
})
</script>

<template>
  <Command ref="commandRef" :should-filter="false" class="h-full">
    <div class="flex flex-col w-full justify-start border-b">
      <div class="flex flex-row w-full items-center gap-1 border">
        <Button
          v-if="currentPath.length > 0"
          variant="outline"
          size="icon"
          @click="handleBack"
          class="size-8 ml-2"
        >
          <ArrowLeftIcon class="size-5" />
        </Button>
        <Separator v-if="currentPath.length > 0" orientation="vertical" />
        <CommandInput
          ref="inputRef"
          :placeholder="searchPlaceholder"
          v-model="searchValue"
          class="bg-secondary border-none shadow-none max"
        />
        <Button
          v-if="searchValue"
          variant="ghost"
          size="icon"
          @click="() => (searchValue = '')"
          class="h-8 w-8 p-0"
        >
          <XIcon class="h-4 w-4" />
        </Button>
      </div>
      <InteractiveBreadcrumb :path="currentPath" :onNavigate="handleBreadcrumbNavigate" class="" />

      <ErrorRecovery
        v-if="error"
        :error="'This is an error'"
        :onRetry="handleRetry"
        :onGoBack="handleBack"
        :onClearAndRetry="handleClearAndRetry"
        :canGoBack="currentPath.length > 0"
      />
    </div>

    <CommandList class="max-h-[300px] overflow-y-auto">
      <CommandEmpty class="pb-0">
        <div class="flex flex-col gap-2 pt-3 text-center text-sm">
          {{ emptyMessage }}
          <Button
            v-if="canCreateNew"
            variant="outline"
            size="sm"
            @click="() => handleCreateOption(searchValue)"
            class="h-8 w-full rounded-none"
          >
            <PlusIcon />
            Create <strong>"{{ searchValue }}"</strong>
          </Button>
        </div>
      </CommandEmpty>

      <CommandGroup>
        <template v-for="(option, index) in filteredOptions" :key="option.id">
          <CommandItem
            :value="option.value"
            @select="() => handleSelect(option)"
            :class="[
              'flex items-center justify-between',
              index === highlightedIndex && 'bg-accent',
            ]"
          >
            <div class="flex items-center">
              <CheckIcon
                :class="['mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0']"
              />
              <span class="truncate">{{ option.label }}</span>
              <Badge
                v-if="option.metadata?.type === 'custom'"
                variant="secondary"
                class="ml-2 text-xs"
              >
                Custom
              </Badge>
            </div>

            <Button
              v-if="option.hasChildren || option.children"
              variant="ghost"
              size="sm"
              @click.stop="() => handleNavigateToChildren(option)"
              class="h-6 w-6 p-0 shrink-0"
              :disabled="loadingStates[option.id]"
            >
              <template v-if="loadingStates[option.id]">
                <LoadingIcon class="h-3 w-3 animate-spin text-background-foreground" />
              </template>
              <template v-else>
                <ChevronRightIcon class="h-3 w-3" />
              </template>
            </Button>
          </CommandItem>
        </template>
        <template v-if="loadingContent">
          <div class="p-4 flex flex-col gap-1">
            <div v-for="n in 4" :key="n" class="flex flex-row gap-2">
              <Skeleton class="flex-1 h-6" />
              <Skeleton class="size-6" />
            </div>
          </div>
        </template>
        <template v-else-if="!searchValue && !error && filteredOptions.length === 0">
          <div class="p-4 flex-col flex justify-center items-center">
            <p class="font-semibold font-md">No content</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                @click="handleBack"
                class="h-7 text-xs"
              >
                <ChevronLeftIcon class="h-3 w-3 mr-1" />
                Go Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="handleRetry"
                class="h-7 text-xs"
              >
                <RefreshCwIcon class="h-3 w-3 mr-1" />
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="handleClearAndRetry"
                class="h-7 text-xs"
              >
                <HomeIcon class="h-3 w-3 mr-1" />
                Start Over
              </Button>
            </div>
          </div>
        </template>
        <template v-if="canCreateNew && filteredOptions.length > 0">
          <Separator class="my-1" />
          <CommandItem
            value="create-option"
            @select="() => handleCreateOption(searchValue)"
            :class="[
              'flex items-center',
              filteredOptions.length === highlightedIndex && 'bg-accent',
            ]"
          >
            <PlusIcon class="mr-2 h-4 w-4" />
            Create "{{ searchValue }}"
          </CommandItem>
        </template>
      </CommandGroup>
    </CommandList>
  </Command>
</template>

<style scoped>
[data-slot='command-input-wrapper'] {
  /* Tailwind’s flex-1 = flex: 1 1 0%; */
  flex: 1 1 0;
}
</style>
