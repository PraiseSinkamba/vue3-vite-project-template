<script setup lang="ts">
import { computed, type Component, type FunctionalComponent } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  AlertCircle,
  RotateCcw,
  Database,
  Search,
  FileX,
  Users,
  Package,
  Calendar,
  Bell,
  Settings,
  Inbox,
  type LucideIcon,
  RotateCcwIcon,
} from 'lucide-vue-next'

// Type definitions
interface ActionButton {
  label: string
  handler: () => void
  icon?: string
}

interface EmptyProps {
  title: string
  message: string
  icon: string | Component | FunctionalComponent
  primaryAction?: ActionButton | null
  secondaryActions: ActionButton[]
}

interface LoadingProps {
  message: string
}

type IconType = string | Component | FunctionalComponent | LucideIcon
type LucideIconName =
  | 'database'
  | 'search'
  | 'file'
  | 'users'
  | 'package'
  | 'calendar'
  | 'bell'
  | 'settings'
  | 'inbox'

// Props interface
interface ConditionalContentProps {
  // State conditions
  isEmpty?: boolean
  isLoading?: boolean
  hasError?: boolean

  // Error props
  error?: string | object | Error | null
  errorMessage?: string
  retry?: (() => void) | null

  // Loading props
  loadingMessage?: string
  loadingIcon?: IconType

  // Error props
  errorIcon?: IconType

  // Empty state props
  emptyTitle?: string
  emptyMessage?: string
  emptyIcon?: IconType

  // Action props
  primaryAction?: ActionButton | null
  secondaryActions?: ActionButton[]
}

const props = withDefaults(defineProps<ConditionalContentProps>(), {
  isEmpty: false,
  isLoading: false,
  hasError: false,
  error: null,
  errorMessage: 'Unable to load content. Please try again.',
  retry: null,
  loadingMessage: 'Loading...',
  loadingIcon: 'Loader2',
  errorIcon: 'AlertCircle',
  emptyTitle: 'No data available',
  emptyMessage: "There's nothing to show here yet.",
  emptyIcon: 'database',
  primaryAction: null,
  secondaryActions: () => [],
})

// Icon mapping for string-based icons
const lucideIconMap: Record<LucideIconName, LucideIcon> = {
  database: Database,
  search: Search,
  file: FileX,
  users: Users,
  package: Package,
  calendar: Calendar,
  bell: Bell,
  settings: Settings,
  inbox: Inbox,
}

// Helper function to resolve icon component
const resolveIconComponent = (
  icon: IconType,
  fallback: LucideIcon,
): Component | FunctionalComponent => {
  if (typeof icon === 'string') {
    // Handle Lucide icon names
    if (icon === 'Loader2') return Loader2
    if (icon === 'AlertCircle') return AlertCircle
    if (icon === 'RotateCcw') return RotateCcw

    // Handle mapped icon names
    return lucideIconMap[icon as LucideIconName] || fallback
  }

  // Handle component/functional component
  if (typeof icon === 'object' || typeof icon === 'function') {
    return icon as Component | FunctionalComponent
  }

  return fallback
}

// Computed icon components
const loadingIconComponent = computed(() => resolveIconComponent(props.loadingIcon, Loader2))

const errorIconComponent = computed(() => resolveIconComponent(props.errorIcon, AlertCircle))

const emptyIconComponent = computed(() => resolveIconComponent(props.emptyIcon, Database))

// Computed properties for slot props
const emptyProps = computed(
  (): EmptyProps => ({
    title: props.emptyTitle,
    message: props.emptyMessage,
    icon: props.emptyIcon,
    primaryAction: props.primaryAction,
    secondaryActions: props.secondaryActions,
  }),
)

const loadingProps = computed(
  (): LoadingProps => ({
    message: props.loadingMessage,
  }),
)

// Export types for consumers
export type {
  ConditionalContentProps,
  ActionButton,
  EmptyProps,
  LoadingProps,
  IconType,
  LucideIconName,
}
</script>
<template>
  <div>
    <!-- Loading State -->
    <template v-if="isLoading">
      <slot name="loading" :loading-props="loadingProps">
        <div class="flex flex-col items-center justify-center py-12">
          <slot name="loading-icon">
            <component :is="loadingIconComponent" class="w-8 h-8 text-gray-400 animate-spin mb-4" />
          </slot>
          <slot name="loading-text">
            <p class="text-sm text-gray-500">{{ loadingMessage }}</p>
          </slot>
        </div>
      </slot>
    </template>

    <!-- Error State -->
    <template v-else-if="hasError || error">
      <slot name="error" :error="error" :retry="retry">
        <div class="flex flex-col items-center justify-center py-12">
          <slot name="error-icon">
            <component :is="errorIconComponent" class="w-12 h-12 text-red-400 mb-4" />
          </slot>
          <div class="text-center max-w-md">
            <slot name="error-title">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            </slot>
            <slot name="error-message" :error="error">
              <p class="text-sm text-gray-600 mb-4">
                {{ typeof error === 'string' ? error : errorMessage }}
              </p>
            </slot>
            <slot name="error-actions" :retry="retry">
              <Button v-if="retry" label="Try Again" @click="retry" size="sm" outlined>
                <RotateCcwIcon class="w-4 h-4" />
              </Button>
            </slot>
          </div>
        </div>
      </slot>
    </template>

    <!-- Empty State -->
    <template v-else-if="isEmpty">
      <slot name="empty" :empty-props="emptyProps">
        <div class="flex flex-col items-center justify-center py-12">
          <slot name="empty-icon" :icon-name="emptyIcon">
            <component :is="emptyIconComponent" class="w-12 h-12 text-gray-300 mb-4" />
          </slot>
          <div class="text-center max-w-md">
            <slot name="empty-title">
              <h3 class="text-lg font-medium text-gray-900 mb-2">{{ emptyTitle }}</h3>
            </slot>
            <slot name="empty-message">
              <p class="text-sm text-gray-600 mb-4">{{ emptyMessage }}</p>
            </slot>
            <slot name="empty-actions" :action="primaryAction">
              <Button v-if="primaryAction" :label="primaryAction.label" @click="primaryAction.handler"
                :icon="primaryAction.icon" size="sm" />
            </slot>
          </div>
          <slot name="empty-secondary">
            <div v-if="secondaryActions?.length" class="flex gap-2 mt-3">
              <Button v-for="action in secondaryActions" :key="action.label" :label="action.label"
                @click="action.handler" size="sm" text />
            </div>
          </slot>
        </div>
      </slot>
    </template>

    <!-- Content State -->
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<style scoped></style>
