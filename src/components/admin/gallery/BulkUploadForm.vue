<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from '@/components/ui/form'
import { Images, Plus, X, ChevronDown, Upload } from 'lucide-vue-next'
import { useServiceStore } from '@/stores/services'
import {
  TagsInputItemDelete,
  TagsInput,
  TagsInputItem,
  TagsInputItemText,
  TagsInputInput,
} from '@/components/ui/tags-input'
const { categorizedServices } = useServiceStore()
const categories = computed(() => categorizedServices)

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

// Zod Schema
const bulkUploadSchema = z.object({
  service_id: z.string().optional(),
  category_id: z.string().optional(),
  tags: z.array(z.string()).default([]),
  is_public: z.boolean().default(true),
  client_consent: z.boolean().default(true),
  auto_approve: z.boolean().default(true),
  generate_titles: z.boolean().default(true),
  technique_notes: z.string().optional(),
  description: z.string().optional(),
  start_order: z.coerce.number().min(0).default(0),
  resize_option: z.enum(['original', 'large', 'medium', 'small']).default('original'),
})

// Form setup
const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(bulkUploadSchema),
  initialValues: {
    tags: [],
    is_public: true,
    client_consent: true,
    auto_approve: true,
    generate_titles: true,
    technique_notes: '',
    description: '',
    start_order: 0,
    resize_option: 'original',
  },
})

const services = computed(() => {
  if (!values.category_id) return []
  return categorizedServices.find((category) => category.id === values.category_id)?.services || []
})

// State
const selectedFiles = ref<File[]>([])
const filePreviews = ref<string[]>([])
const uploading = ref(false)
const showAdvancedOptions = ref(false)
const fileError = ref('')

const uploadProgress = reactive({
  total: 0,
  current: 0,
  success: 0,
  failed: 0,
})

// File handling methods
const validateFile = (file: File): string | null => {
  if (!file.type.startsWith('image/')) {
    return `${file.name} is not an image file`
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    return `${file.name} is too large (max 10MB)`
  }

  return null
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  addFiles(files)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer?.files || [])
  addFiles(files)
}

const addFiles = (files: File[]) => {
  fileError.value = ''

  const validFiles: File[] = []
  const errors: string[] = []

  files.forEach((file) => {
    const error = validateFile(file)
    if (error) {
      errors.push(error)
    } else {
      validFiles.push(file)
    }
  })

  if (errors.length > 0) {
    fileError.value = errors.join(', ')
  }

  if (validFiles.length > 0) {
    selectedFiles.value = [...selectedFiles.value, ...validFiles]
    generatePreviews(validFiles, selectedFiles.value.length - validFiles.length)
  }
}

const generatePreviews = (files: File[], startIndex: number = 0) => {
  files.forEach((file, index) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      filePreviews.value[startIndex + index] = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  filePreviews.value.splice(index, 1)
  fileError.value = ''
}

const clearFiles = () => {
  selectedFiles.value = []
  filePreviews.value = []
  fileError.value = ''
}

// Title generation
const generateTitle = (filename: string, generateTitles: boolean) => {
  if (!generateTitles) return ''

  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
    .replace(/\b\w/g, (l) => l.toUpperCase()) // Title case
}

// Form submission
const onSubmit = handleSubmit(async (formValues) => {
  if (selectedFiles.value.length === 0) {
    fileError.value = 'Please select at least one image'
    return
  }

  uploading.value = true
  uploadProgress.total = selectedFiles.value.length
  uploadProgress.current = 0
  uploadProgress.success = 0
  uploadProgress.failed = 0

  const uploadItems = []

  try {
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i]
      uploadProgress.current = i + 1

      try {
        const itemData = {
          afterImage: file,
          service_id: formValues.service_id || null,
          category_id: formValues.category_id || null,
          title: generateTitle(file.name, formValues.generate_titles),
          description: formValues.description || '',
          technique_notes: formValues.technique_notes || '',
          tags: [...formValues.tags],
          tags_tr: [], // Could be generated or left empty
          is_featured: false, // Individual images from bulk upload not featured by default
          is_public: formValues.is_public,
          client_consent: formValues.client_consent,
          display_order: formValues.start_order + i,
        }

        uploadItems.push(itemData)
        uploadProgress.success++
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error)
        uploadProgress.failed++
      }
    }

    // Submit all items
    await emit('submit', { items: uploadItems })

    // Reset form on successful upload
    clearFiles()
    // Reset form values could be added here if needed
  } catch (error) {
    console.error('Bulk upload error:', error)
  } finally {
    uploading.value = false

    // Reset progress after a delay
    setTimeout(() => {
      uploadProgress.total = 0
      uploadProgress.current = 0
      uploadProgress.success = 0
      uploadProgress.failed = 0
    }, 3000)
  }
})
</script>

<template>
  <div class="space-y-6 pb-6 pt-3">
    <!-- Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="font-medium text-blue-900 mb-2">Bulk Upload Instructions</h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>• Upload multiple images of your past work at once</li>
        <li>• Each image will be processed as a separate gallery item</li>
        <li>• You can assign common settings to all images</li>
        <li>• Individual images can be edited after upload</li>
      </ul>
    </div>

    <form @submit="onSubmit" class="space-y-6">
      <!-- File Upload Area -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Select Images *</label>
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
        >
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            multiple
            @change="handleFileChange"
            class="hidden"
          />

          <div v-if="selectedFiles.length === 0" class="space-y-3">
            <Images class="mx-auto h-16 w-16 text-gray-400" />
            <div>
              <Button type="button" variant="outline" @click="$refs.fileInputRef?.click()">
                Choose Images
              </Button>
              <p class="text-sm text-gray-500 mt-2">or drag and drop images here</p>
            </div>
            <p class="text-xs text-gray-500">PNG, JPG, WebP up to 10MB each</p>
          </div>

          <div v-else class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">{{ selectedFiles.length }} images selected</span>
              <div class="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  @click="$refs.fileInputRef?.click()"
                >
                  <Plus class="w-4 h-4 mr-1" />
                  Add More
                </Button>
                <Button type="button" variant="outline" size="sm" @click="clearFiles">
                  <X class="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>

            <!-- Image Preview Grid -->
            <div
              class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-64 overflow-y-auto"
            >
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="relative aspect-square group"
              >
                <img
                  :src="filePreviews[index]"
                  :alt="file.name"
                  class="w-full h-full object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  class="absolute -top-1 -right-1 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeFile(index)"
                >
                  <X class="w-3 h-3" />
                </Button>
                <div
                  class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b truncate"
                >
                  {{ file.name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- File validation error -->
        <div v-if="fileError" class="text-sm text-red-600">
          {{ fileError }}
        </div>
      </div>

      <!-- Common Settings -->
      <div v-if="selectedFiles.length > 0" class="space-y-6 border-t pt-6">
        <h3 class="text-lg font-medium">Common Settings</h3>
        <p class="text-sm text-muted-foreground">
          These settings will be applied to all uploaded images. You can edit individual items
          later.
        </p>

        <!-- Service and Category -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="category_id">
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="category in categories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="service_id">
            <FormItem>
              <FormLabel>Service</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="service in services" :key="service.id" :value="service.id">
                      {{ service.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Common Tags -->
        <FormField v-slot="{ componentField }" name="tags">
          <FormItem>
            <FormLabel>Common Tags</FormLabel>
            <FormControl>
              <TagsInput
                :model-value="componentField.modelValue"
                @update:model-value="componentField['onUpdate:modelValue']"
              >
                <TagsInputItem v-for="tag in componentField.modelValue" :key="tag" :value="tag">
                  <TagsInputItemText />
                  <TagsInputItemDelete />
                </TagsInputItem>

                <TagsInputInput placeholder="Add common tags (e.g., polygel, chrome)" />
              </TagsInput>
            </FormControl>
            <FormDescription> These tags will be added to all uploaded images </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Default Settings -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField v-slot="{ value, handleChange }" name="is_public">
            <FormItem>
              <div class="flex items-center space-x-2">
                <FormControl>
                  <input type="checkbox" :value="value" @change="handleChange" class="rounded" />
                </FormControl>
                <FormLabel class="text-sm">Make public by default</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ value, handleChange }" name="client_consent">
            <FormItem>
              <div class="flex items-center space-x-2">
                <FormControl>
                  <input type="checkbox" :value="value" @change="handleChange" class="rounded" />
                </FormControl>
                <FormLabel class="text-sm">Client consent obtained</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ value, handleChange }" name="auto_approve">
            <FormItem>
              <div class="flex items-center space-x-2">
                <FormControl>
                  <input type="checkbox" :value="value" @change="handleChange" class="rounded" />
                </FormControl>
                <FormLabel class="text-sm">Auto-approve all</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ value, handleChange }" name="generate_titles">
            <FormItem>
              <div class="flex items-center space-x-2">
                <FormControl>
                  <input type="checkbox" :value="value" @change="handleChange" class="rounded" />
                </FormControl>
                <FormLabel class="text-sm">Generate titles from filename</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Advanced Options -->
        <div class="space-y-4">
          <Button
            type="button"
            variant="ghost"
            @click="showAdvancedOptions = !showAdvancedOptions"
            class="flex items-center gap-2"
          >
            Advanced Options
            <ChevronDown
              :class="['w-4 h-4 transition-transform', showAdvancedOptions ? 'rotate-180' : '']"
            />
          </Button>

          <div v-if="showAdvancedOptions" class="space-y-4 pl-4 border-l-2 border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField v-slot="{ componentField }" name="technique_notes">
                <FormItem>
                  <FormLabel>Default Technique Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      v-bind="componentField"
                      placeholder="Common techniques or products used..."
                      rows="3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="description">
                <FormItem>
                  <FormLabel>Default Description</FormLabel>
                  <FormControl>
                    <Textarea
                      v-bind="componentField"
                      placeholder="Common description for all images..."
                      rows="3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <FormField v-slot="{ componentField }" name="start_order">
                <FormItem>
                  <FormLabel>Start Display Order</FormLabel>
                  <FormControl>
                    <Input type="number" v-bind="componentField" min="0" placeholder="0" />
                  </FormControl>
                  <FormDescription>
                    Images will be numbered sequentially from this number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="resize_option">
                <FormItem>
                  <FormLabel>Resize Images</FormLabel>
                  <FormControl>
                    <Select v-bind="componentField">
                      <SelectTrigger>
                        <SelectValue placeholder="Keep original size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Keep original size</SelectItem>
                        <SelectItem value="large">Large (1920px)</SelectItem>
                        <SelectItem value="medium">Medium (1280px)</SelectItem>
                        <SelectItem value="small">Small (800px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Progress -->
      <div v-if="uploadProgress.total > 0" class="space-y-3">
        <div class="flex justify-between text-sm">
          <span>Uploading {{ uploadProgress.current }} of {{ uploadProgress.total }}...</span>
          <span>{{ Math.round((uploadProgress.current / uploadProgress.total) * 100) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }"
          ></div>
        </div>

        <div v-if="uploadProgress.current > 0" class="text-xs text-muted-foreground">
          <div>✓ Successfully uploaded: {{ uploadProgress.success }}</div>
          <div v-if="uploadProgress.failed > 0" class="text-red-600">
            ✗ Failed: {{ uploadProgress.failed }}
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" @click="$emit('cancel')" :disabled="uploading">
          Cancel
        </Button>
        <Button type="submit" :disabled="selectedFiles.length === 0 || uploading">
          <Upload class="w-4 h-4 mr-2" />
          {{ uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Images` }}
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
