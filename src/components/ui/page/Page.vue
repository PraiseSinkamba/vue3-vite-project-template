<template>
  <div
    class="page-container"
    :class="[
      `page-padding-${config?.contentPadding || 'default'}`,
      `page-max-width-${config?.maxWidth || 'full'}`,
      `page-bg-${config?.background || 'transparent'}`,
      { 'pointer-events-none': loading },
    ]"
  >
    <!-- Header Section -->
    <header
      v-if="!hideHeader"
      :class="[
        'page-header',
        {
          'page-header-fixed': fixedHeader,
        },
      ]"
    >
      <!-- Back Button -->
      <div :class="['flex', backButton?.inline ? 'flex-row' : 'flex-col']">
        <div v-if="backButton" class="page-header-back">
          <Button
            v-if="backButton.visible"
            :variant="backButton.variant || 'ghost'"
            size="sm"
            :class="[
              'p-1 text-secondary-foreground font-bold',
              { 'pl-2 mt-2': backButton?.inline },
            ]"
            @click="handleBackAction"
          >
            <template v-if="backButton.icon">
              <component
                :is="backButton.icon"
                class="mr-2 h-6 w-6"
                v-bind="backButton.iconProps || {}"
              />
            </template>
            <ArrowLeftFromLineIcon v-else />
            {{ backButton.text }}
          </Button>
        </div>

        <!-- Title Section -->
        <div :class="['page-header-title p-2', backButton?.inline ? 'flex-1' : 'w-full']">
          <div class="title-container">
            <h2 class="page-title">
              {{ title }}
              <span v-for="(badge, index) in titleBadges" :key="index" class="title-badge">
                <Badge :variant="badge.variant || 'secondary'" :class="badge.class">
                  <component v-if="badge.icon" :is="badge.icon" class="mr-1 h-3 w-3" />
                  {{ badge.text }}
                </Badge>
              </span>
            </h2>

            <p v-if="subtitle" class="page-subtitle">
              {{ subtitle }}
            </p>
          </div>

          <!-- Header Metadata -->
          <div v-if="headerMetadata && headerMetadata.length" class="page-header-metadata">
            <div v-for="(meta, index) in headerMetadata" :key="index" class="metadata-item">
              <component v-if="meta.icon" :is="meta.icon" class="mr-2 h-4 w-4" />
              <span class="metadata-label">{{ meta.label }}:</span>
              <span class="metadata-value">{{ meta.value }}</span>
            </div>
          </div>

          <!-- Header Actions -->
          <div class="page-header-actions">
            <div class="secondary-actions">
              <Button
                v-for="(action, index) in secondaryActions"
                :key="index"
                :variant="action.variant || 'outline'"
                @click="action.onClick"
                :disabled="action.disabled"
                class="mr-2"
              >
                <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
                {{ action.text }}
              </Button>
            </div>

            <Button
              v-if="primaryAction"
              size="sm"
              class="text-sm"
              :variant="primaryAction.variant || 'default'"
              @click="primaryAction.onClick"
              :disabled="primaryAction.disabled"
            >
              <component v-if="primaryAction.icon" :is="primaryAction.icon" class="mr-2 h-4 w-4" />
              {{ primaryAction.text }}
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Slot -->
    <main class="page-content">
      <div v-if="showError" class="flex justify-center items-center h-full w-full">
        <slot name="error"></slot>
      </div>
      <slot v-else-if="showSkeleton" name="skeleton"></slot>
      <slot v-else>
        <div class="no-content-placeholder h-full w-full text-center">No content provided</div>
      </slot>
    </main>
    <!-- Loading Overlay -->
    <div v-if="loading" class="page-loading-overlay">
      <div class="page-loading-content">
        <slot name="loading">
          <LoadingSpinner class="w-12 h-12" />
        </slot>
      </div>
    </div>

    <!-- Footer Slot -->
    <PageFooter v-if="$slots.footer" :fixed="config?.fixedFooter" :actions="footerActions">
      <slot name="footer" />
    </PageFooter>
  </div>
</template>

<script setup lang="ts">
import { type Component, type FunctionalComponent, type VNode } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageFooter } from '@/components/ui/page'
import { ArrowLeftFromLineIcon } from 'lucide-vue-next'
import { LoadingSpinner } from './index.ts'
/*

onMounted(async ()=>{
  const {pinwheel} = await import('ldrs')
  pinwheel.register()
})*/
// Types for component configuration
export interface PageBadge {
  text: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  icon?: Component
  class?: string
  tooltip?: string
}

export interface PageAction {
  text: string
  onClick: () => void
  icon?: Component
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  disabled?: boolean
}

export interface PageMetadata {
  label: string
  value: string
  icon?: Component
}

export interface PageBackButton {
  visible?: boolean
  inline?: boolean
  text?: string
  icon?: Component
  iconProps?: Record<string, unknown>
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  onClick?: () => void
}

export interface PageConfig {
  contentPadding?: 'none' | 'sm' | 'md' | 'lg'
  maxWidth?: 'full' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  background?: 'transparent' | 'subtle' | 'white'
  fixedFooter?: boolean
}

// Component Props
interface PageProps {
  title?: string
  subtitle?: string
  hideHeader?: boolean
  fixedHeader?: boolean
  backButton?: PageBackButton
  titleBadges?: PageBadge[]
  primaryAction?: PageAction
  secondaryActions?: PageAction[]
  headerMetadata?: PageMetadata[]
  config?: PageConfig
  loading?: boolean
  showSkeleton?: boolean
  showError?: boolean
  loadingContent?: FunctionalComponent | VNode | string
  footerActions?: PageAction[]
}

const props = withDefaults(defineProps<PageProps>(), {
  fixedHeader: true,
  hideHeader: false,
  backButton: () => ({ visible: false }),
  titleBadges: () => [],
  secondaryActions: () => [],
  headerMetadata: () => [],
  config: () => ({
    contentPadding: 'default',
    maxWidth: 'full',
    background: 'transparent',
    fixedFooter: false,
  }),
  loading: false,
  showSkeleton: false,
  footerActions: () => [],
})

// Handle back button action
function handleBackAction() {
  if (props.backButton?.onClick) {
    props.backButton.onClick()
  } else {
    // Default back navigation
    window.history.back()
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  @apply flex flex-col min-h-full w-full;
}

.page-header {
  @apply flex space-y-4 mb-1 flex-col px-2 pt-1;
}

.page-header-fixed {
  @apply sticky top-0 left-0 right-0 z-40 shadow-md bg-background text-foreground;
}

.page-header-title {
  @apply flex justify-between items-start;
}

.title-container {
  @apply flex flex-col space-y-1;
}

.page-title {
  @apply text-xl font-bold flex items-center space-x-2 text-foreground;
}

.title-badge {
  @apply ml-2;
}

.page-subtitle {
  @apply text-muted-foreground text-sm;
}

.page-header-actions {
  @apply flex items-center space-x-2;
}

.page-content {
  @apply flex-grow;
}

/* Loading Overlay */
.page-loading-overlay {
  @apply fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex justify-center items-center;
}

.page-loading-content {
  @apply flex flex-col items-center space-y-4;
}

.loading-spinner {
  @apply animate-spin h-8 w-8 text-primary;
}

/* Padding variants */
.page-padding-none {
  @apply p-0;
}

.page-padding-sm {
  @apply p-4;
}

.page-padding-md {
  @apply p-6;
}

.page-padding-lg {
  @apply p-8;
}

/* Max width variants */
.page-max-width-full {
  @apply w-full;
}

.page-max-width-xs {
  @apply max-w-xs mx-auto;
}

.page-max-width-sm {
  @apply max-w-sm mx-auto;
}

.page-max-width-md {
  @apply max-w-md mx-auto;
}

.page-max-width-lg {
  @apply max-w-lg mx-auto;
}

.page-max-width-xl {
  @apply max-w-xl mx-auto;
}

.page-max-width-2xl {
  @apply max-w-2xl mx-auto;
}

.page-max-width-3xl {
  @apply max-w-3xl mx-auto;
}

.page-max-width-4xl {
  @apply max-w-4xl mx-auto;
}

.page-max-width-5xl {
  @apply max-w-5xl mx-auto;
}

.page-max-width-6xl {
  @apply max-w-6xl mx-auto;
}

/* Background variants */
.page-bg-transparent {
  @apply bg-transparent;
}

.page-bg-subtle {
  @apply bg-gray-50;
}

.page-bg-white {
  @apply bg-white;
}
</style>
