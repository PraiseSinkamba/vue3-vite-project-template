<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Image Upload Area -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Image *</label>
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        @click="triggerFileInput"
        @drop.prevent="handleDrop"
        @dragover.prevent
        @dragenter.prevent="dragActive = true"
        @dragleave.prevent="dragActive = false"
        :class="{ 'border-blue-400 bg-blue-50': dragActive }"
      >
        <input
          ref="fileInputRef"
          type="file"
          :accept="uploadConfig.accept || 'image/*'"
          :multiple="uploadConfig.multiple"
          @change="handleFileChange"
          class="hidden"
        />

        <div v-if="!imagePreview && selectedFiles.length === 0" class="space-y-2">
          <ImagePlus class="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <Button type="button" variant="outline">
              Choose {{ uploadConfig.multiple ? 'Images' : 'Image' }}
            </Button>
          </div>
          <p class="text-xs text-gray-500">
            {{ getFileTypeDescription() }}
          </p>
          <p class="text-xs text-gray-400">
            Or drag and drop files here
          </p>
        </div>

        <!-- Single Image Preview -->
        <div v-else-if="imagePreview && !uploadConfig.multiple" class="relative inline-block">
          <img :src="imagePreview" alt="Preview" class="max-h-48 rounded-lg" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="absolute -top-2 -right-2"
            @click.stop="removeImage"
          >
            <X class="w-4 h-4" />
          </Button>
          <div class="mt-2 text-sm text-gray-600">
            {{ selectedFiles[0]?.name }} ({{ formatFileSize(selectedFiles[0]?.size || 0) }})
          </div>
        </div>

        <!-- Multiple Images Preview -->
        <div v-else-if="selectedFiles.length > 0 && uploadConfig.multiple" class="space-y-3">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div v-for="(file, index) in selectedFiles" :key="index" class="relative">
              <img :src="filePreviews[index]" :alt="file.name" class="w-full h-24 object-cover rounded" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="absolute -top-1 -right-1 w-6 h-6 p-0"
                @click.stop="removeFile(index)"
              >
                <X class="w-3 h-3" />
              </Button>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" @click="triggerFileInput">
            <Plus class="w-4 h-4 mr-1" />
            Add More
          </Button>
        </div>
      </div>
    </div>

    <!-- Image Details -->
    <div v-if="selectedFiles.length > 0" class="space-y-4">
      <!-- Title -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Title</label>
        <Input
          v-model="formData.title"
          placeholder="Enter image title..."
        />
      </div>

      <!-- Title (Turkish) - if internationalization needed -->
      <div v-if="showTranslations" class="space-y-2">
        <label class="text-sm font-medium">Title (Turkish)</label>
        <Input
          v-model="formData.title_tr"
          placeholder="Resim başlığı girin..."
        />
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Description</label>
        <Textarea
          v-model="formData.description"
          placeholder="Describe this image..."
          rows="3"
        />
      </div>

      <!-- Alt Text -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Alt Text</label>
        <Input
          v-model="formData.alt_text"
          placeholder="Alternative text for accessibility..."
        />
      </div>

      <!-- Service-specific fields -->
      <div v-if="uploadConfig.type === 'service'" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Image Type</label>
          <Select v-model="formData.image_type">
            <SelectTrigger>
              <SelectValue placeholder="Select image type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hero">Hero Image</SelectItem>
              <SelectItem value="gallery">Gallery Image</SelectItem>
              <SelectItem value="before_after">Before/After</SelectItem>
              <SelectItem value="technique">Technique Demo</SelectItem>
              <SelectItem value="detail">Detail Shot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Display Order</label>
          <Input
            type="number"
            v-model.number="formData.display_order"
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <!-- Category-specific fields -->
      <div v-if="uploadConfig.type === 'category'" class="space-y-4">
        <label class="flex items-center space-x-2">
          <input type="checkbox" v-model="formData.is_hero_image" class="rounded" />
          <span class="text-sm">Set as hero image for this category</span>
        </label>
      </div>

      <!-- Common settings -->
      <div class="space-y-4">
        <label class="flex items-center space-x-2">
          <input type="checkbox" v-model="formData.is_featured" class="rounded" />
          <span class="text-sm">Feature this image</span>
        </label>

        <div v-if="uploadConfig.type !== 'category'" class="space-y-2">
          <label class="text-sm font-medium">Display Order</label>
          <Input
            type="number"
            v-model.number="formData.display_order"
            min="0"
            placeholder="0"
          />
        </div>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="space-y-2">
      <div class="flex justify-between text-sm">
        <span>Uploading...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-2 pt-4 border-t">
      <Button type="button" variant="outline" @click="$emit('cancel')" :disabled="uploading">
        Cancel
      </Button>
      <Button
        type="submit"
        :disabled="!canSubmit || uploading"
      >
        <Upload class="w-4 h-4 mr-2" />
        {{ uploading ? 'Uploading...' : 'Upload Image' + (uploadConfig.multiple && selectedFiles.value.length > 1 ? 's' : '') }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
  Select, SelectContent, SelectItem,SelectTrigger, SelectValue
} from '@/components/ui/select'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import { ImagePlus, X, Plus, Upload } from 'lucide-vue-next'

interface UploadConfig {
  type: 'service' | 'category' | 'addon'
  service_id?: string
  category_id?: string
  addon_id?: string
  accept?: string
  multiple?: boolean
}

interface Props {
  uploadConfig: UploadConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

// Refs
const fileInputRef = ref<HTMLInputElement>()

// Reactive state
const selectedFiles = ref<File[]>([])
const imagePreview = ref<string>('')
const filePreviews = ref<string[]>([])
const uploadProgress = ref(0)
const uploading = ref(false)
const showTranslations = ref(true) // Could be based on user settings
const dragActive = ref(false)

const formData = reactive({
  title: '',
  title_tr: '',
  description: '',
  alt_text: '',
  image_type: 'gallery',
  display_order: 0,
  is_featured: false,
  is_hero_image: false
})

// Computed properties
const canSubmit = computed(() => {
  return selectedFiles.value.length > 0 && !uploading.value
})

// Methods
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processFiles(files)
}

const handleDrop = (event: DragEvent) => {
  dragActive.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  processFiles(files)
}

const processFiles = (files: File[]) => {
  if (files.length === 0) return

  // Validate file types and sizes
  const validFiles = files.filter(file => {
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`)
      return false
    }

    const maxSize = getMaxFileSize()
    if (file.size > maxSize) {
      alert(`${file.name} is too large. Maximum size: ${formatFileSize(maxSize)}`)
      return false
    }

    return true
  })

  if (props.uploadConfig.multiple) {
    selectedFiles.value = [...selectedFiles.value, ...validFiles]
    generatePreviews()
  } else {
    selectedFiles.value = validFiles.slice(0, 1)
    generatePreview()
  }
}

const generatePreview = () => {
  if (selectedFiles.value.length === 0) {
    imagePreview.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(selectedFiles.value[0])
}

const generatePreviews = () => {
  filePreviews.value = []

  selectedFiles.value.forEach((file, index) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      filePreviews.value[index] = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = () => {
  selectedFiles.value = []
  imagePreview.value = ''
  resetForm()
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  filePreviews.value.splice(index, 1)

  if (selectedFiles.value.length === 0) {
    resetForm()
  }
}

const resetForm = () => {
  formData.title = ''
  formData.title_tr = ''
  formData.description = ''
  formData.alt_text = ''
  formData.image_type = 'gallery'
  formData.display_order = 0
  formData.is_featured = false
  formData.is_hero_image = false
}

const getMaxFileSize = () => {
  const sizes = {
    service: 10 * 1024 * 1024, // 10MB
    category: 5 * 1024 * 1024,  // 5MB
    addon: 5 * 1024 * 1024      // 5MB
  }
  return sizes[props.uploadConfig.type] || 5 * 1024 * 1024
}

const getFileTypeDescription = () => {
  const maxSize = formatFileSize(getMaxFileSize())
  const types = 'PNG, JPG, WebP'
  return `${types} up to ${maxSize}`
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    const submitData = {
      files: selectedFiles.value,
      file: selectedFiles.value[0], // For single file uploads
      ...formData,
      ...props.uploadConfig
    }

    emit('submit', submitData)

    clearInterval(progressInterval)
    uploadProgress.value = 100

    // Reset form after successful upload (handled by parent component)

  } catch (error) {
    console.error('Upload error:', error)
  } finally {
    // Don't reset uploading here - let parent handle it
    setTimeout(() => {
      uploading.value = false
      uploadProgress.value = 0
    }, 1000)
  }
}

// Watch for file changes to auto-generate alt text
watch(selectedFiles, (newFiles) => {
  if (newFiles.length > 0 && !formData.alt_text) {
    const fileName = newFiles[0].name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
    formData.alt_text = fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }
}, { immediate: true })

// Auto-generate display order based on type
watch(() => props.uploadConfig, (config) => {
  if (config.type === 'service' && formData.image_type === 'hero') {
    formData.display_order = 0
    formData.is_featured = true
  } else if (config.type === 'category') {
    formData.display_order = 0
  }
}, { immediate: true })

// Reset drag state when component unmounts
watch(dragActive, (active) => {
  if (!active) {
    // Clean up drag state
  }
})
</script>

<style lang="scss" scoped>
.drag-over {
  @apply border-blue-400 bg-blue-50;
}

input[type="checkbox"] {
  @apply ;
}
</style>
