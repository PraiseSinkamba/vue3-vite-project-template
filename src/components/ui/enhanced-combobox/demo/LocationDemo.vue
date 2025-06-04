<template>
  <Card>
    <CardHeader>
      <CardTitle>Location Selector</CardTitle>
      <CardDescription>
        Navigate through countries, states, and cities with geographic hierarchy.
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <EnhancedNestedCombobox
        :options="options"
        :value="selectedValue"
        :onValueChange="handleValueChange"
        :onLoadChildren="handleLoadChildren"
        :onCreateOption="handleCreateOption"
        placeholder="Select location"
        searchPlaceholder="Search locations..."
      />

      <div v-if="selectedPath.length" class="space-y-2">
        <p class="text-sm font-medium">Selected Location:</p>
        <div class="text-sm text-muted-foreground">
          {{ formattedSelectedPath }}
        </div>
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

async function loadInitialLocations() {
  try {
    const backendOptions = await fakeBackend.loadLocations()
    options.value = convertBackendToNested(backendOptions)
  } catch (err) {
    console.error('Failed to load locations:', err)
  }
}

async function handleLoadChildren(parentId: string): Promise<NestedOption[]> {
  const backendOptions = await fakeBackend.loadLocations(parentId)
  return convertBackendToNested(backendOptions)
}

async function handleCreateOption(
  label: string,
  parentId?: string
): Promise<NestedOption> {
  const backendOption = await fakeBackend.createOption(
    label,
    parentId,
    'location'
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

const formattedSelectedPath = computed(() =>
  selectedPath.value.map((item) => item.label).join(' → ')
)

onMounted(() => {
  loadInitialLocations()
})
</script>
