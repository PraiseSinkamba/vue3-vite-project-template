<script lang="ts" setup>
import { MoreHorizontal, ArrowLeft } from 'lucide-vue-next'
import type { PageAction, PageHeaderProps } from '@/components/ui/page'
import { useSidebar } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { QuickDropdown } from '@/components/ui/dropdown-menu'
import { computed } from 'vue'
import { cn } from '@/lib/utils.ts'
import { useRouter } from 'vue-router'

const props = defineProps<PageHeaderProps>()
const secondaryActions = computed<PageAction[]>(() => {
  if (props?.actions?.secondary) {
    const secondary = props.actions.secondary
    if (Array.isArray(secondary)) {
      return secondary
    } else {
      return [secondary]
    }
  }
  return []
})
const titleClasses = computed(() => {
  const baseClasses = 'font-semibold text-background-foreground text-lg mb-0'
  return typeof props.title === 'string' ? baseClasses : cn(baseClasses, props.title?.classes)
})

const titleText = computed(() =>
  typeof props.title === 'string' ? props.title : props.title?.text,
)

const subtitleClasses = computed(() => {
  const baseClasses = 'text-muted-foreground font-500 text-sm'
  return typeof props.subtitle === 'string' ? baseClasses : cn(baseClasses, props.subtitle?.classes)
})

const subtitleText = computed(() =>
  typeof props.subtitle === 'string' ? props.subtitle : props.subtitle?.text,
)
const { isMobile } = useSidebar()
const router = useRouter()
</script>

<template>
  <header class="flex flex-col p-2">
    <!-- Mobile Layout: Back button and actions on same row -->
    <div v-if="isMobile" class="flex flex-col gap-3">
      <div class="gap-2">
        <!-- Back Button -->
        <Button
          v-if="!hideBackButton"
          :size="backButtonText ? 'sm' : 'icon'"
          :class="cn(backButtonText ? 'w-fit' : '', 'float-left')"
          variant="outline"
          @click="router.back()"
        >
          <ArrowLeft />
          {{ backButtonText || '' }}
        </Button>

        <!-- Actions -->
        <slot
          name="actions"
          :isMobile="isMobile"
          :primary="actions?.primary"
          :secondary="actions?.secondary"
        >
          <div class="flex flex-row gap-2 float-right">
            <template v-if="actions?.secondary">
              <QuickDropdown :items="secondaryActions">
                <Button size="icon" variant="outline">
                  <MoreHorizontal />
                  <span class="sr-only">More</span>
                </Button>
              </QuickDropdown>
            </template>

            <!-- Primary Action -->
            <Button v-if="actions?.primary" size="sm" @click="actions.primary.onClick">
              <component :is="actions.primary.icon" />
              {{ actions.primary.text }}
            </Button>
          </div>
        </slot>
      </div>

      <!-- Title and Description Row -->
      <div class="flex flex-row gap-2 flex-1">
        <slot name="image" />
        <div class="flex flex-col flex-1">
          <slot name="title" :title="title" :subtitle="subtitle" :badges="titleBadges">
            <h1 v-if="title" :class="titleClasses">
              {{ titleText }}
              <template v-if="titleBadges">
                <Badge
                  v-for="(badge, index) in titleBadges"
                  :key="index"
                  :variant="badge.variant || 'secondary'"
                  :class="['ml-2 ', badge.classes]"
                >
                  <component v-if="badge.icon" :is="badge.icon" class="mr-1 h-3 w-3" />
                  {{ badge.text }}
                </Badge>
              </template>
            </h1>
            <span v-if="subtitle" :class="subtitleClasses">{{ subtitleText }}</span>
          </slot>
        </div>
      </div>
    </div>

    <!-- Desktop Layout: Original layout -->
    <div v-else :class="cn('flex gap-3', backButtonText ? 'flex-col' : '')">
      <Button
        v-if="!hideBackButton"
        :size="backButtonText ? 'sm' : 'icon'"
        :class="cn(backButtonText ? 'w-fit' : '')"
        variant="outline"
        @click="router.back()"
      >
        <ArrowLeft />
        {{ backButtonText || '' }}
      </Button>
      <div class="flex flex-row items-center justify-between gap-2 flex-1 flex-wrap">
        <div class="flex flex-row gap-2 flex-1">
          <slot name="image" />
          <div class="flex flex-col flex-1">
            <slot name="title" :title="title" :subtitle="subtitle" :badges="titleBadges">
              <h1 v-if="title" :class="titleClasses">
                {{ titleText }}
                <template v-if="titleBadges">
                  <Badge
                    v-for="(badge, index) in titleBadges"
                    :key="index"
                    :variant="badge.variant || 'secondary'"
                    :class="['ml-2 ', badge.classes]"
                  >
                    <component v-if="badge.icon" :is="badge.icon" class="mr-1 h-3 w-3" />
                    {{ badge.text }}
                  </Badge>
                </template>
              </h1>
              <span v-if="subtitle" :class="subtitleClasses">{{ subtitleText }}</span>
            </slot>
          </div>
        </div>
        <slot
          name="actions"
          :isMobile="isMobile"
          :primary="actions?.primary"
          :secondary="actions?.secondary"
        >
          <div class="flex flex-row gap-2">
            <template v-if="actions?.secondary">
              <template v-for="(secondary, i) in secondaryActions" :key="i">
                <Button
                  class="hidden md:flex"
                  :variant="secondary.variant || 'outline'"
                  size="sm"
                  @click="secondary.onClick"
                >
                  <component :is="secondary.icon" />
                  {{ secondary.text }}
                </Button>
              </template>
            </template>

            <!-- Primary Action - Always visible -->
            <Button v-if="actions?.primary" size="sm" @click="actions.primary.onClick">
              <component :is="actions.primary.icon" />
              {{ actions.primary.text }}
            </Button>
          </div>
        </slot>
      </div>
    </div>

    <div v-if="metadata && metadata.length > 0" class="flex flex-wrap gap-4 mt-2 text-xs">
      <div
        v-for="(meta, index) in metadata"
        :key="index"
        class="flex flex-row flex-wrap items-center gap-1"
      >
        <span class="text-muted-foreground font-bold flex items-center">
          <component v-if="meta.icon" :is="meta.icon" class="size-4" />
          {{ meta.label }} :
        </span>
        <span
          :class="
            cn(
              'font-medium',
              meta.variant === 'muted' && 'text-muted-foreground',
              meta.variant === 'accent' && 'text-primary',
              meta.variant === 'default' && 'text-foreground',
            )
          "
        >
          {{ meta.value }}
        </span>
      </div>
    </div>
  </header>
</template>
