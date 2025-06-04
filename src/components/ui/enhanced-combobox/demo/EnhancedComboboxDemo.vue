<script lang="ts" setup>
'use client'
import { fakeBackend } from './fake-backend'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-vue-next'
import KeyboardNavigationDemo
  from '@/components/ui/enhanced-combobox/demo/KeyboardNavigationInfo.vue'
import CategoryDemo from '@/components/ui/enhanced-combobox/demo/CategoryDemo.vue'
import LocationDemo from '@/components/ui/enhanced-combobox/demo/LocationDemo.vue'
import FileSystemDemo from '@/components/ui/enhanced-combobox/demo/FileSystemDemo.vue'

function handleClearCache(){
  fakeBackend.clearCache()
}
</script>

<template>
  <div class="container mx-auto py-8 space-y-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold">Enhanced Nested Combobox</h1>
        <p class="text-muted-foreground">
          Advanced hierarchical selection with responsive design, interactive breadcrumbs, and
          comprehensive error recovery
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" @click="handleClearCache">
            <RefreshCw class="mr-2 h-4 w-4" />
            Clear Cache & Reload
          </Button>
          <div class="text-xs text-muted-foreground flex items-center gap-2">
            <span class="hidden sm:inline">Desktop: Popover</span>
            <span class="sm:hidden">Mobile: Drawer</span>
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
        </div>
      </div>

      <KeyboardNavigationDemo />

      <Tabs defaultValue="categories" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Product Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="filesystem">File System</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" class="space-y-4">
          <CategoryDemo />
        </TabsContent>

        <TabsContent value="locations" class="space-y-4">
          <LocationDemo />
        </TabsContent>

        <TabsContent value="filesystem" class="space-y-4">
          <FileSystemDemo />
        </TabsContent>
      </Tabs>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">🔄 Backend Features</h3>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Realistic network delays (500-1500ms)
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Intelligent caching system
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Error simulation with recovery
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Duplicate request prevention
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Dynamic option creation
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold">🎨 UX Enhancements</h3>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              Interactive breadcrumb navigation
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              Multiple error recovery options
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              Responsive drawer on mobile
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              Visual loading & error states
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              Custom option badges
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold">⌨️ Navigation</h3>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
              Full keyboard navigation
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
              Clickable breadcrumb jumps
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
              Search with "/" navigation
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
              Auto-focus on open
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
              Escape key handling
            </li>
          </ul>
        </div>
      </div>

      <div class="bg-muted/30 rounded-lg p-4">
        <h4 class="font-medium mb-2">💡 Pro Tips</h4>
        <ul class="text-sm space-y-1 text-muted-foreground">
          <li>• Click any breadcrumb item to jump back to that level instantly</li>
          <li>• Use the "Start Over" button in error states to reset to root</li>
          <li>• On mobile, the interface automatically switches to a drawer for better UX</li>
          <li>• Custom created options are marked with a "Custom" badge</li>
          <li>• Network errors show different icons and recovery options</li>
        </ul>
      </div>
    </div>
  </div>
</template>
