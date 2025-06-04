<template>
  <Alert>
    <InfoIcon class="h-4 w-4" />
    <AlertDescription>
      <div class="space-y-2">
        <p class="font-medium">Enhanced Navigation Features:</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <!-- LEFT COLUMN: Keyboard Shortcuts -->
          <div class="space-y-1 w-f">
            <p class="font-medium text-xs text-muted-foreground">KEYBOARD SHORTCUTS</p>
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span>Navigate options</span>
                <kbd class="px-1 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span>Enter subfolder</span>
                <kbd class="px-1 py-0.5 bg-muted rounded text-xs">→</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span>Go back</span>
                <kbd class="px-1 py-0.5 bg-muted rounded text-xs">←</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span>Select option</span>
                <kbd class="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span>Close/Clear</span>
                <kbd class="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span>Navigate to match</span>
                <kbd class="px-1 py-0.5 bg-muted rounded text-xs">/</kbd>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Enhanced UX -->
          <div class="space-y-1">
            <p class="font-medium text-xs text-muted-foreground">ENHANCED UX</p>
            <div class="space-y-1 text-xs text-right">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Interactive breadcrumb navigation
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Multiple error recovery options
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Mobile drawer interface
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Visual loading & error states
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Smart caching & deduplication
              </div>
            </div>
          </div>
        </div>
      </div>
    </AlertDescription>
  </Alert>
</template>

<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info as InfoIcon } from 'lucide-vue-next'
</script>
