<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- Service and Category Selection -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField v-slot="{ componentField }" name="category_id">
        <FormItem>
          <FormLabel>Category *</FormLabel>
          <FormControl>
            <Select v-bind="componentField">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
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
          <FormLabel>Service *</FormLabel>
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

    <!-- Title and Description -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel>Title (English) *</FormLabel>
            <FormControl>
              <Input v-bind="componentField" placeholder="e.g., Nude Polygel with French Tips" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="title_tr">
          <FormItem>
            <FormLabel>Title (Turkish)</FormLabel>
            <FormControl>
              <Input v-bind="componentField" placeholder="e.g., Nude Polygel Fransız Uçlu" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>Description (English)</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                placeholder="Describe the design, colors, and techniques used..."
                rows="3"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description_tr">
          <FormItem>
            <FormLabel>Description (Turkish)</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                placeholder="Tasarım, renkler ve kullanılan teknikleri açıklayın..."
                rows="3"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </div>

    <!-- Image Uploads -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Images</h3>

      <!-- After Image (Required) -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Final Result Image *</label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            ref="afterImageRef"
            type="file"
            accept="image/*"
            @change="handleAfterImageChange"
            class="hidden"
          />
          <div v-if="!afterImagePreview" class="text-center">
            <ImagePlus class="mx-auto h-12 w-12 text-gray-400" />
            <div class="mt-2">
              <Button type="button" variant="outline" @click="$refs.afterImageRef?.click()">
                Upload Final Result
              </Button>
            </div>
            <p class="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
          </div>
          <div v-else class="relative">
            <img
              :src="afterImagePreview"
              alt="Final result preview"
              class="max-h-48 mx-auto rounded"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="absolute top-2 right-2"
              @click="removeAfterImage"
            >
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div v-if="afterImageError" class="text-sm text-red-600">
          {{ afterImageError }}
        </div>
      </div>

      <!-- Before Image (Optional) -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Before Image (Optional)</label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            ref="beforeImageRef"
            type="file"
            accept="image/*"
            @change="handleBeforeImageChange"
            class="hidden"
          />
          <div v-if="!beforeImagePreview" class="text-center">
            <ImagePlus class="mx-auto h-8 w-8 text-gray-400" />
            <div class="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="$refs.beforeImageRef?.click()"
              >
                Upload Before Image
              </Button>
            </div>
          </div>
          <div v-else class="relative">
            <img :src="beforeImagePreview" alt="Before preview" class="max-h-32 mx-auto rounded" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="absolute top-2 right-2"
              @click="removeBeforeImage"
            >
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div v-if="beforeImageError" class="text-sm text-red-600">
          {{ beforeImageError }}
        </div>
      </div>

      <!-- Detail Images (Optional) -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Detail Images (Optional)</label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            ref="detailImagesRef"
            type="file"
            accept="image/*"
            multiple
            @change="handleDetailImagesChange"
            class="hidden"
          />
          <div v-if="detailImagePreviews.length === 0" class="text-center">
            <ImagePlus class="mx-auto h-8 w-8 text-gray-400" />
            <div class="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="$refs.detailImagesRef?.click()"
              >
                Upload Detail Images
              </Button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Multiple images showing close-ups and details</p>
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div v-for="(preview, index) in detailImagePreviews" :key="index" class="relative">
              <img :src="preview" alt="Detail preview" class="w-full h-24 object-cover rounded" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="absolute top-1 right-1 w-6 h-6 p-0"
                @click="removeDetailImage(index)"
              >
                <X class="w-3 h-3" />
              </Button>
            </div>
            <div
              class="border-2 border-dashed border-gray-300 rounded flex items-center justify-center h-24"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                @click="$refs.detailImagesRef?.click()"
              >
                <Plus class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div v-if="detailImagesError" class="text-sm text-red-600">
          {{ detailImagesError }}
        </div>
      </div>
    </div>

    <!-- Technique Notes -->
    <FormField v-slot="{ componentField }" name="technique_notes">
      <FormItem>
        <FormLabel>Technique Notes</FormLabel>
        <FormControl>
          <Textarea
            v-bind="componentField"
            placeholder="Products used, techniques applied, special considerations..."
            rows="3"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Tags -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField v-slot="{ componentField }" name="tags">
          <FormItem>
            <FormLabel>Tags (English)</FormLabel>
            <FormControl>
              <TagsInput
                :model-value="componentField.modelValue"
                @update:model-value="componentField['onUpdate:modelValue']"
              >
                <TagsInputItem v-for="tag in componentField.modelValue" :key="tag" :value="tag">
                  <TagsInputItemText />
                  <TagsInputItemDelete />
                </TagsInputItem>

                <TagsInputInput placeholder="Add tags (e.g., french_tips, chrome)" />
              </TagsInput>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="tags_tr">
          <FormItem>
            <FormLabel>Tags (Turkish)</FormLabel>
            <FormControl>
              <TagsInput
                :model-value="componentField.modelValue"
                @update:model-value="componentField['onUpdate:modelValue']"
              >
                <TagsInputItem v-for="tag in componentField.modelValue" :key="tag" :value="tag">
                  <TagsInputItemText />
                  <TagsInputItemDelete />
                </TagsInputItem>

                <TagsInputInput placeholder="Tags in turkish (ör. fransiz_ucu, krom)" />
              </TagsInput>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </div>

    <!-- Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Display Settings</h3>

      <div class="flex items-center space-x-6">
        <FormField v-slot="{ value, handleChange }" name="is_featured">
          <FormItem>
            <div class="flex items-center space-x-2">
              <FormControl>
                <input type="checkbox" :value="value" @change="handleChange" class="rounded" />
              </FormControl>
              <FormLabel class="text-sm">Feature this work</FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="is_public">
          <FormItem>
            <div class="flex items-center space-x-2">
              <FormControl>
                <input type="checkbox" :value="value" @change="handleChange" class="rounded" />
              </FormControl>
              <FormLabel class="text-sm">Show publicly</FormLabel>
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
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-2 pt-4 border-t">
      <Button type="button" variant="outline" @click="$emit('cancel')"> Cancel </Button>
      <Button type="submit" :disabled="isSubmitting || !afterImageFile">
        <Upload class="w-4 h-4 mr-2" />
        Add Past Work
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input'
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form'
import { ImagePlus, X, Plus, Upload } from 'lucide-vue-next'
import { useServiceStore } from '@/stores/services'

const { categorizedServices } = useServiceStore()
const categories = computed(() => categorizedServices)

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

// Zod Schema
const pastWorkSchema = z.object({
  service_id: z.string().min(1, 'Service is required'),
  category_id: z.string().min(1, 'Category is required'),
  appointment_id: z.string().optional(),
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  title_tr: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  description_tr: z.string().max(1000).optional(),
  technique_notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  tags_tr: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  is_public: z.boolean().default(true),
  client_consent: z.boolean().default(false),
})

// Form setup
const { handleSubmit, isSubmitting, values } = useForm({
  validationSchema: toTypedSchema(pastWorkSchema),
  initialValues: {
    service_id: '',
    category_id: '',
    appointment_id: '',
    title: '',
    title_tr: '',
    description: '',
    description_tr: '',
    technique_notes: '',
    tags: [],
    tags_tr: [],
    is_featured: false,
    is_public: true,
    client_consent: false,
  },
})

const services = computed(() => {
  if (!values.category_id) return []
  return categorizedServices.find((category) => category.id === values.category_id)?.services || []
})

// File handling state
const afterImageFile = ref<File | null>(null)
const beforeImageFile = ref<File | null>(null)
const detailImageFiles = ref<File[]>([])

const afterImagePreview = ref('')
const beforeImagePreview = ref('')
const detailImagePreviews = ref<string[]>([])

const afterImageError = ref('')
const beforeImageError = ref('')
const detailImagesError = ref('')

// File validation
const validateImageFile = (file: File): string | null => {
  if (!file.type.startsWith('image/')) {
    return 'File must be an image'
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    return 'File size must be less than 10MB'
  }

  return null
}

// Image handling methods
const handleAfterImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  afterImageError.value = ''

  if (file) {
    const error = validateImageFile(file)
    if (error) {
      afterImageError.value = error
      return
    }

    afterImageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      afterImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleBeforeImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  beforeImageError.value = ''

  if (file) {
    const error = validateImageFile(file)
    if (error) {
      beforeImageError.value = error
      return
    }

    beforeImageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      beforeImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleDetailImagesChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  detailImagesError.value = ''

  if (files.length > 0) {
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file) => {
      const error = validateImageFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      detailImagesError.value = errors.join(', ')
    }

    if (validFiles.length > 0) {
      detailImageFiles.value = [...detailImageFiles.value, ...validFiles]

      validFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          detailImagePreviews.value.push(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Reset input
  target.value = ''
}

const removeAfterImage = () => {
  afterImageFile.value = null
  afterImagePreview.value = ''
  afterImageError.value = ''
}

const removeBeforeImage = () => {
  beforeImageFile.value = null
  beforeImagePreview.value = ''
  beforeImageError.value = ''
}

const removeDetailImage = (index: number) => {
  detailImageFiles.value.splice(index, 1)
  detailImagePreviews.value.splice(index, 1)
  detailImagesError.value = ''
}

// Form submission
const onSubmit = handleSubmit(async (values) => {
  // Validate required after image
  if (!afterImageFile.value) {
    afterImageError.value = 'Final result image is required'
    return
  }

  const submitData = {
    ...values,
    afterImage: afterImageFile.value,
    beforeImage: beforeImageFile.value,
    detailImages: detailImageFiles.value,
  }

  emit('submit', submitData)
})
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
