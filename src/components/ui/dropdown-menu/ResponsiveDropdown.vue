<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { type MenuItem } from '@/components/ui/dropdown-menu'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { computed, ref, watch } from 'vue'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import RDropdownMenu from '@/components/ui/dropdown-menu/RDropdownMenu.vue'
import {setter} from '@/lib/utils.ts'

interface ResponsiveMenuProps {
  items: MenuItem[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  contentClassName?: string
  title?: string
}

interface MenuLevel {
  items: MenuItem[]
  title?: string
  parentId?: string
}

const props = withDefaults(defineProps<ResponsiveMenuProps>(), {
  align: 'end',
  side: 'bottom',
  title: 'Menu',
})

const open = ref(false)
const menuStack = ref<MenuLevel[]>([{ items: props.items, title: props.title }])
const setMenuStack = setter(menuStack)
const resetMenuStack = () => setMenuStack([{ items: props.items, title: props.title }])
const currentMenu = computed(() => menuStack.value[menuStack.value.length - 1])
const currentItems = computed(() => currentMenu.value.items)
const currentTitle = computed(() => currentMenu.value.title)

const handleItemClick = (item: MenuItem) => {
  if (item.disabled) return
  if (item.children && item.children.length) {
    setMenuStack((prev) => [
      ...prev,
      {
        items: item.children!,
        title: item.label,
        parentId: item.id,
      },
    ])
  } else {
    item.onClick?.()
    open.value = false
    resetMenuStack()
  }
}

const handleBack = () => setMenuStack((prev) => prev.slice(0, -1))
watch(open, (newOpen: boolean) => {
  if (!newOpen) resetMenuStack()
})
const { isMobile } = useSidebar()
</script>

<template>
  <template v-if="isMobile">
    <Drawer v-model:open="open">
      <DrawerTrigger asChild :class="className">
        <!-- Slot rendered ONCE, conditionally placed -->
        <slot />
      </DrawerTrigger>
      <DrawerContent :class="cn('', contentClassName)">
        <DrawerHeader class="flex flex-row items-center gap-3 px-4 py-3">
          <Button v-if="menuStack.length > 1" @click="handleBack" variant="outline" size="icon">
            <ChevronLeft class="h-5 w-5" />
          </Button>
          <DrawerTitle class="font-bold">{{ currentTitle }}</DrawerTitle>
          <DrawerDescription class="sr-only">{{ currentTitle }}</DrawerDescription>
        </DrawerHeader>
        <div class="px-4 pb-6 space-y-1">
          <template v-for="item in currentItems" :key="item.id">
            <Separator class="my-2" v-if="item.separator" orientation="horizontal" />
            <Button
              v-else
              @click="() => handleItemClick(item)"
              :variant="item.variant || 'ghost'"
              :disabled="item.disabled"
              :class="
                cn(
                  'w-full flex items-center justify-between px-4 py-3 text-left rounded-lg',
                  'disabled:cursor-not-allowed',
                )
              "
            >
              <component v-if="item.icon" :is="item.icon" />
              <span class="flex items-center gap-2 flex-1">
                {{ item.label }}
              </span>
              <ChevronRight v-if="item.children" :class="cn('h-4 w-4', isMobile && 'ml-auto')" />
            </Button>
          </template>
        </div>
      </DrawerContent>
    </Drawer>
  </template>

  <template v-else>
    <RDropdownMenu
      v-model:open="open"
      @item-selected="handleItemClick"
      :items="items"
      :align="align"
      :side="side"
    >
      <!-- Slot rendered only once -->
      <slot />
    </RDropdownMenu>
  </template>
</template>

<style scoped></style>
