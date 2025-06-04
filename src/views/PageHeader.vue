<script lang="ts" setup>
import { Check, Copy, Edit, Share2, MoreHorizontal, ArrowLeft } from 'lucide-vue-next'
import { type Component, ref } from 'vue'
import type { SingleItem } from '@/components/layout'
import { useSidebar } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { QuickDropdown } from '@/components/ui/dropdown-menu'

/*interface HeaderProps{
  title?:string;
  titleBadges?: PageBadge[];
  subtitle?: string;
  actions:{
    primary: Action;
    secondary: Action | Action[];
  }
}*/

const title = ref('About View')
const subtitle = ref('about view details')

export interface PageBadge {
  text: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  icon?: Component
  classes?: string
  tooltip?: string
}

interface Action extends Omit<SingleItem, 'type'> {}

const secondaryActions = ref<Action[]>([
  {
    icon: Edit, // Lucide's Edit icon
    text: 'Edit',
    onClick: () => alert('Edit clicked!'),
  },
  {
    icon: Copy, // Lucide's Copy icon
    text: 'Copy',
    onClick: () => alert('Copied to clipboard!'),
  },
  {
    icon: Share2, // Lucide's Share icon
    text: 'Share',
    onClick: () => alert('Sharing content...'),
  },
])

const primaryAction = ref<Action>({
  icon: Check, // Lucide's Check icon
  text: 'Confirm',
  onClick: () => alert('Primary action confirmed!'),
})
const titleBadges = ref<PageBadge[]>([
  {
    icon: Check,
    text: 'Check',
    variant: 'outline',
  },
])
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
              <h1 class="font-semibold text-background-foreground text-lg mb-0">
                {{ title }}
                <span v-for="(badge, index) in titleBadges" :key="index">
                  <Badge :variant="badge.variant || 'secondary'" :class="['ml-2 ',badge.classes]">
                    <component v-if="badge.icon" :is="badge.icon" class="mr-1 h-3 w-3" />
                    {{ badge.text }}
                  </Badge>
                </span>
              </h1>
              <span class="text-muted-foreground font-500 text-sm">{{ subtitle }}</span>
            </slot>
          </div>
        </div>
      </div>
      <slot name="actions" :isMobile="isMobile" :primary="primaryAction" :secondary="secondaryActions">
        <div class="flex flex-row gap-2">
          <QuickDropdown v-if="isMobile" :items="secondaryActions">
            <Button size="icon" variant="outline">
              <MoreHorizontal />
              <span class="sr-only">More</span>
            </Button>
          </QuickDropdown>

          <template v-else v-for="(secondary, index) in secondaryActions" :key="index">
            <Button class="hidden md:flex" variant="secondary" size="sm" @click="secondary.onClick">
              <component :is="secondary.icon" />
              {{ secondary.text }}
            </Button>
          </template>

          <!-- Primary Action - Always visible -->
          <Button size="sm" @click="primaryAction.onClick">
            <component :is="primaryAction.icon" />
            {{ primaryAction.text }}
          </Button>
        </div>
      </slot>
    </div>
  </header>
</template>
