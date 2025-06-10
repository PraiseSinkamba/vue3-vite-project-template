<script lang="ts" setup>
import { MoreHorizontal, ArrowLeft } from 'lucide-vue-next'
import type { Action, PageHeaderProps } from '@/components/ui/page'
import { useSidebar } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { QuickDropdown } from '@/components/ui/dropdown-menu'
import { computed } from 'vue'

const props = defineProps<PageHeaderProps>()
const secondaryActions = computed<Action[]>(() => {
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

const { isMobile } = useSidebar()
</script>

<template>
  <header class="flex min-h-16 flex-col p-2">
    <div class="flex justify-between items-center gap-2">
      <div class="flex gap-2 flex-1">
        <Button size="icon" variant="outline">
          <ArrowLeft />
        </Button>
        <div class="flex flex-row gap-2 flex-1">
          <slot name="image">
            <div
              class="size-9 max-size-9 min-size-9 aspect-square overflow-hidden bg-black flex items-center justify-center"
            >
              <span class="text-white">img</span>
            </div>
          </slot>
          <div class="flex flex-col flex-1">
            <slot name="title" :title="title" :subtitle="subtitle" :badges="titleBadges">
              <h1 v-if="title" class="font-semibold text-background-foreground text-lg mb-0">
                {{ title }}
                <template v-if="titleBadges">
                  <span v-for="(badge, index) in titleBadges" :key="index">
                    <Badge
                      :variant="badge.variant || 'secondary'"
                      :class="['ml-2 ', badge.classes]"
                    >
                      <component v-if="badge.icon" :is="badge.icon" class="mr-1 h-3 w-3" />
                      {{ badge.text }}
                    </Badge>
                  </span>
                </template>
              </h1>
              <span v-if="subtitle" class="text-muted-foreground font-500 text-sm">{{
                subtitle
              }}</span>
            </slot>
          </div>
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
            <QuickDropdown v-if="isMobile" :items="secondaryActions">
              <Button size="icon" variant="outline">
                <MoreHorizontal />
                <span class="sr-only">More</span>
              </Button>
            </QuickDropdown>

            <template v-else v-for="(secondary, index) in secondaryActions" :key="index">
              <Button
                class="hidden md:flex"
                variant="secondary"
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
  </header>
</template>
