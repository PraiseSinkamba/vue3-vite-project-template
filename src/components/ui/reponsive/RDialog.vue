<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { useMobile, type BreakPoint } from '@/composables/useMobile'

interface Props {
  title?: string
  description?: string
  contentClass?: string
  bodyClass?: string
  footerClass?: string
  mobileBreakpoint?: BreakPoint
}

const props = withDefaults(defineProps<Props>(), {
  mobileBreakpoint: 'md',
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
    <!-- Desktop Dialog -->
    <Dialog v-if="!isMobile" v-model:open="isOpen">
      <DialogTrigger v-if="$slots.trigger" as-child>
        <slot name="trigger" />
      </DialogTrigger>
      <DialogContent :class="cn('max-w-2xl max-h-[90vh] overflow-y-auto', contentClass)">
        <DialogHeader v-if="$slots.header || title">
          <DialogTitle v-if="title">{{ title }}</DialogTitle>
          <DialogDescription v-if="description">{{ description }}</DialogDescription>
          <slot name="header" />
        </DialogHeader>

        <div :class="cn('flex-1 overflow-y-auto', bodyClass)">
          <slot />
        </div>

        <DialogFooter v-if="$slots.footer" :class="footerClass">
          <slot name="footer" />
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
