<template>
  <Card class="group hover:shadow-lg transition-all duration-200">
    <div class="relative">
      <!-- Image -->
      <div class="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
        <img 
          :src="image.image_url" 
          :alt="image.alt_text || image.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>
      
      <!-- Featured Badge -->
      <Badge 
        v-if="image.is_featured" 
        class="absolute top-2 left-2 bg-purple-500 text-white"
      >
        <Star class="w-3 h-3 mr-1" />
        Featured
      </Badge>
      
      <!-- Quick Actions Overlay -->
      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 rounded-t-lg">
        <Button size="sm" variant="secondary" @click="$emit('edit', image)">
          <Edit class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          :variant="image.is_featured ? 'default' : 'secondary'"
          @click="$emit('toggle-featured', image.id, !image.is_featured)"
        >
          <Star class="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          @click="confirmDelete"
        >
          <Trash2 class="w-4 h-4" />
        </Button>
      </div>
    </div>
    
    <CardContent class="p-4 space-y-2">
      <!-- Title and Description -->
      <div>
        <h3 class="font-medium text-sm line-clamp-1">
          {{ image.title || addonName }}
        </h3>
        <p v-if="image.description" class="text-xs text-muted-foreground line-clamp-2 mt-1">
          {{ image.description }}
        </p>
      </div>
      
      <!-- Metadata -->
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <div class="flex items-center gap-2">
          <span>Order: {{ image.display_order }}</span>
          <Badge variant="outline" class="text-xs">
            Add-on
          </Badge>
        </div>
        <div class="flex items-center gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            class="h-6 px-2 text-xs"
            @click="moveUp"
            :disabled="image.display_order === 0"
          >
            <ChevronUp class="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            class="h-6 px-2 text-xs"
            @click="moveDown"
          >
            <ChevronDown class="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <!-- Usage Info -->
      <div class="pt-2 border-t">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Usage Examples:</span>
          <Button size="sm" variant="ghost" class="h-6 px-2 text-xs">
            <Eye class="w-3 h-3 mr-1" />
            View
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import { Star, Edit, Trash2, ChevronUp, ChevronDown, Eye } from 'lucide-vue-next'

interface AddonImage {
  id: string
  addon_id: string
  image_url: string
  title?: string
  description?: string
  alt_text?: string
  is_featured: boolean
  display_order: number
  addon?: {
    name: string
    name_tr?: string
  }
}

interface Props {
  image: AddonImage
  addonName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [image: AddonImage]
  delete: [imageId: string]
  'toggle-featured': [imageId: string, featured: boolean]
  'move-up': [imageId: string]
  'move-down': [imageId: string]
}>()

const addonName = computed(() => {
  return props.addonName || props.image.addon?.name || 'Unknown Add-on'
})

const confirmDelete = () => {
  if (confirm(`Delete "${props.image.title || 'this image'}"?`)) {
    emit('delete', props.image.id)
  }
}

const moveUp = () => {
  emit('move-up', props.image.id)
}

const moveDown = () => {
  emit('move-down', props.image.id)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>