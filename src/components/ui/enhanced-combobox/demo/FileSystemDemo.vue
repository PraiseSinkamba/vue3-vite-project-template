<template>
  <Card>
    <CardHeader>
      <CardTitle>File System Browser</CardTitle>
      <CardDescription>
        Browse through folders and files with a hierarchical structure.
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <EnhancedNestedCombobox
        :options="options"
        :value="selectedValue"
        :onValueChange="handleValueChange"
        :onLoadChildren="handleLoadChildren"
        :onCreateOption="handleCreateOption"
        placeholder="Select file or folder"
        searchPlaceholder="Search files and folders..."
        :allowCreate="true"
      />

      <div v-if="selectedPath.length" class="space-y-2">
        <p class="text-sm font-medium">Selected Path:</p>
        <code class="text-sm bg-muted px-2 py-1 rounded">
          /{{ formattedFilesystemPath }}
        </code>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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

async function loadInitialFiles() {
  try {
    const backendOptions = await fakeBackend.loadFileSystem()
    options.value = convertBackendToNested(backendOptions)
  } catch (err) {
    console.error('Failed to load file system:', err)
  }
}

async function handleLoadChildren(parentId: string): Promise<NestedOption[]> {
  const backendOptions = await fakeBackend.loadFileSystem(parentId)
  return convertBackendToNested(backendOptions)
}

async function handleCreateOption(
  label: string,
  parentId?: string
): Promise<NestedOption> {
  const backendOption = await fakeBackend.createOption(label, parentId, 'file')
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

const formattedFilesystemPath = computed(() =>
  selectedPath.value
    .map((item) => item.label.replace(/^[📁📄]\s/u, ''))
    .join('/')
)

onMounted(() => {
  loadInitialFiles()
})
</script>
