<!-- src/components/PageFooter.vue -->
<template>
  <footer
      class="page-footer"
      :class="{ 'page-footer-fixed': fixed }"
  >
    <div class="page-footer-content">
        <!-- Default footer content -->
        <div class="flex justify-between items-center flex-row">
          <div class="flex-1">
            <slot/>
          </div>
          <div class="space-x-4">
            <Button
                v-for="(action, index) in actions"
                :key="index"
                :variant="action.variant || 'default'"
                @click="action.onClick"
                :disabled="action.disabled"
            >
              {{ action.text }}
            </Button>
          </div>
        </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface PageFooterAction {
  text: string
  onClick: () => void
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  disabled?: boolean
}

interface PageFooterProps {
  fixed?: boolean
  actions?: PageFooterAction[]
}

const props = withDefaults(defineProps<PageFooterProps>(), {
  fixed: false,
  actions: () => []
})

</script>

<style scoped>
.page-footer {
  @apply border-t px-4 py-3 flex justify-center;
}

.page-footer-fixed {
  @apply fixed bottom-0 left-0 right-0 shadow-md;
}

.page-footer-content {
  @apply max-w-4xl w-full;
}
</style>