<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { type BreakPoint, useMobile } from '@/composables/useMobile'

interface Props {
  title?: string
  description?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  contentClass?: string
  bodyClass?: string
  footerClass?: string
  mobileBreakpoint?: BreakPoint
}

const props = withDefaults(defineProps<Props>(), {
  side: 'right',
  mobileBreakpoint: 'md',
  contentClass: 'p-2',
  footerClass: 'w-full sticky bottom-0 left-0 right-0',
})

const isOpen = defineModel('open', { type: Boolean, default: false })

// Use the mobile detection composable
const { isMobile } = useMobile({
  breakpoint: props.mobileBreakpoint,
})
</script>

<template>
  <div>
    <!-- Desktop Sheet -->
    <Sheet v-if="!isMobile" v-model:open="isOpen">
      <SheetTrigger as-child>
        <slot name="trigger" />
      </SheetTrigger>
      <SheetContent :side="side" :class="cn('sm:max-w-md', contentClass)">
        <SheetHeader v-if="$slots.header || title">
          <SheetTitle v-if="title">{{ title }}</SheetTitle>
          <SheetDescription v-if="description">{{ description }}</SheetDescription>
          <slot name="header" />
        </SheetHeader>

        <div :class="cn('flex-1 overflow-y-auto', bodyClass)">
          <slot />
        </div>

        <SheetFooter v-if="$slots.footer" :class="footerClass">
          <slot name="footer" />
        </SheetFooter>
      </SheetContent>
    </Sheet>

    <!-- Mobile Drawer -->
    <Drawer v-else v-model:open="isOpen">
      <DrawerTrigger as-child>
        <slot name="trigger" />
      </DrawerTrigger>
      <DrawerContent :class="contentClass">
        <DrawerHeader v-if="$slots.header || title" class="text-left">
          <DrawerTitle v-if="title">{{ title }}</DrawerTitle>
          <DrawerDescription v-if="description">{{ description }}</DrawerDescription>
          <slot name="header" />
        </DrawerHeader>

        <div :class="cn('flex-1 overflow-y-auto px-4', bodyClass)">
          <slot />
        </div>

        <DrawerFooter v-if="$slots.footer" :class="footerClass">
          <slot name="footer" />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
</template>
