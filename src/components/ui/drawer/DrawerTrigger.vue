<script lang="ts" setup>
import type { DrawerTriggerProps } from 'vaul-vue'
import { DrawerTrigger } from 'vaul-vue'

const props = defineProps<{asChild?: boolean;}>()
</script>

<template>
  <DrawerTrigger data-slot="drawer-trigger" v-bind="props">
    <slot />
  </DrawerTrigger>
</template>
