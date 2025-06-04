<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { NestedOption } from '../types'
import  EnhancedNestedCombobox  from '../EnhancedCombobox.vue'
import { fakeBackend, type BackendOption } from './fake-backend'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw as RefreshCwIcon } from 'lucide-vue-next'

/**
 * Convert a list of BackendOption items into NestedOption[] for the combobox
 */
function convertBackendToNested(
  backendOptions: BackendOption[]
): NestedOption[] {
  return backendOptions.map((option) => ({
    id: option.id,
    label: option.label,
    value: option.value,
    hasChildren: option.hasChildren,
    metadata: option.metadata,
  }))
}

const selectedValue = ref<string>('')
const selectedPath = ref<NestedOption[]>([])
const options = ref<NestedOption[]>([])
const loading = ref<boolean>(true)

/*function updateOptions(opts: NestedOption[]) {
  options.value = opts
}*/
async function loadInitialCategories() {
  try {
    const backendOptions = await fakeBackend.loadCategories()
    options.value = convertBackendToNested(backendOptions)
  } catch (err) {
    console.error('Failed to load categories:', err)
  } finally {
    loading.value = false
  }
}

async function handleLoadChildren(parentId: string): Promise<NestedOption[]> {
  const backendOptions = await fakeBackend.loadCategories(parentId)
  return convertBackendToNested(backendOptions)
}

async function handleCreateOption(
  label: string,
  parentId?: string
): Promise<NestedOption> {
  const backendOption = await fakeBackend.createOption(
    label,
    parentId,
    'category'
  )
  return {
    id: backendOption.id,
    label: backendOption.label,
    value: backendOption.value,
    hasChildren: backendOption.hasChildren,
    metadata: backendOption.metadata,
  }
}

function handleValueChange(value: string, path: NestedOption[]) {
  selectedValue.value = value
  selectedPath.value = path
}
function handleOptionUpdate(opts:NestedOption[]){
  options.value = opts
}

onMounted(() => {
  loadInitialCategories()
})
</script>

<template>
  <Card v-if="loading">
    <CardContent class="flex items-center justify-center py-8">
      <RefreshCwIcon class="h-6 w-6 animate-spin mr-2" />
      Loading categories...
    </CardContent>
  </Card>

  <Card v-else>
    <CardHeader>
      <CardTitle>Product Categories</CardTitle>
      <CardDescription>
        Select a product category with async loading and creation capabilities.
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <EnhancedNestedCombobox
        :options="options"
        :value="selectedValue"
        :onValueChange="handleValueChange"
        :onLoadChildren="handleLoadChildren"
        :onCreateOption="handleCreateOption"
        @update:options="handleOptionUpdate"
        placeholder="Choose a product category"
        searchPlaceholder="Search categories... (use / to navigate)"
      />

      <div v-if="selectedPath.length" class="space-y-2">
        <p class="text-sm font-medium">Selected Category:</p>
        <div class="flex flex-wrap gap-1">
          <div
            v-for="(item, index) in selectedPath"
            :key="item.id"
            class="flex items-center gap-1"
          >
            <Badge variant="secondary">{{ item.label }}</Badge>
            <span
              v-if="index < selectedPath.length - 1"
              class="text-muted-foreground"
            >
              /
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>


