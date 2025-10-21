<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RDialog } from '@/components/ui/reponsive'
import type { ServiceCategory, ServiceCategoryInsert, ServiceCategoryUpdate } from '@/types'
import { z } from 'zod'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from '@/components/ui/form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useMutation, useQueryCache } from '@pinia/colada'
import { toast } from 'vue-sonner'
import { useServiceStore } from '@/stores/services'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import type { FileRecord } from '@/components/ui/file-upload'
import { Save, Loader2 } from 'lucide-vue-next'
import { useImageManager } from '@/composables/useImageUpload'

const isOpen = defineModel<boolean>('open')
const queryCache = useQueryCache()

const store = useServiceStore()
const props = defineProps<{
  category?: ServiceCategory | null
}>()

// Image state
const categoryImage = ref<FileRecord[]>([])
const existingImage = ref<any>(null)

// Image manager composable
const imageManager = useImageManager({
  bucket: 'service-gallery',
  onUploadSuccess: (results) => {
    toast.success('Category image uploaded successfully')
  },
  onDeleteSuccess: () => {
    toast.success('Image deleted successfully')
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  name_tr: z.string().optional(),
  description: z.string().optional(),
})

const { handleSubmit, setValues, resetForm, values } = useForm({
  validationSchema: toTypedSchema(categorySchema),
  initialValues: {
    id: '',
    name: '',
    name_tr: '',
    description: '',
  },
})

const deleteExistingImage = async () => {
  if (!existingImage.value) return

  try {
    // Delete from storage and metadata using image manager
    await imageManager.deleteImage({
      path: existingImage.value.image_path,
      imageUrl: existingImage.value.image_url,
      deleteMetadata: true,
    })

    // Delete from database
    await supabase.from('service_category_images').delete().eq('id', existingImage.value.id)

    existingImage.value = null
  } catch (error) {
    console.error('Delete image error:', error)
    throw error
  }
}

// Load existing category image
const loadExistingImage = async (categoryId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_category_images')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error

    if (data) {
      existingImage.value = data
      // Set existing image in FileUpload
      categoryImage.value = [
        {
          id: data.id,
          name: data.title || 'Category Image',
          url: data.image_url,
          type: 'image/jpeg',
          status: 'completed',
          uploadPercentage: 100,
        },
      ]
    } else {
      existingImage.value = null
      categoryImage.value = []
    }
  } catch (error) {
    console.error('Load existing image error:', error)
  }
}

const { mutate: saveCategory, isLoading } = useMutation({
  mutation: async (data: ServiceCategoryInsert | ServiceCategoryUpdate) => {
    // First save the category
    const savedCategory = await store.saveServiceCategory(data)

    // Then handle image if present
    if (categoryImage.value.length > 0 && savedCategory) {
      const fileRecord = categoryImage.value[0]

      // If it's a new upload (has file object)
      if (fileRecord.file) {
        // If editing and has existing image, delete it first
        if (existingImage.value) {
          await deleteExistingImage()
        }

        // Upload to storage with metadata using image manager
        const uploadResults = await imageManager.uploadImages(
          [fileRecord.file],
          (file, index) => `categories/${savedCategory.id}/${Date.now()}_${file.name}`,
        )

        const uploadResult = uploadResults[0]

        // Create new database record
        const { error: dbError } = await supabase.from('service_category_images').insert({
          category_id: savedCategory.id,
          image_url: uploadResult.imageUrl,
          image_path: uploadResult.imagePath,
          title: `${savedCategory.name} Category Image`,
          alt_text: savedCategory.name,
          is_hero_image: true,
          is_active: true,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        })

        if (dbError) {
          console.error('Database error:', dbError)
          throw new Error('Failed to save image information')
        }
      }
    }

    return savedCategory
  },
  onSuccess: (data) => {
    toast.success(`Category "${data.name}" saved successfully`)
    isOpen.value = false
    resetForm()
    categoryImage.value = []
    existingImage.value = null
    queryCache.invalidateQueries({ key: ['service-categories'] })
  },
  onError: (error) => {
    toast.error(error.message || 'Failed to save category')
  },
})

const onSubmit = handleSubmit((formValues) => {
  saveCategory(formValues)
})

const handleCancel = () => {
  isOpen.value = false
  resetForm()
  categoryImage.value = []
  existingImage.value = null
}

// Handle file deletion
const handleFileDeleted = (file: FileRecord) => {
  // If deleting existing image from server
  if (existingImage.value && file.url === existingImage.value.image_url) {
    deleteExistingImage()
  }
}

// Watch for category prop changes and dialog open state
watch(
  [() => props.category, isOpen],
  ([newCategory, open]) => {
    if (newCategory && open) {
      setValues({
        id: newCategory.id,
        name: newCategory.name,
        name_tr: newCategory.name_tr || '',
        description: newCategory.description || '',
      })

      // Load existing image - force reload when dialog opens
      loadExistingImage(newCategory.id)
    } else if (!newCategory && open) {
      // New category case - reset form
      resetForm()
      existingImage.value = null
      categoryImage.value = []
    } else if (!open) {
      // Dialog closed - clean up
      resetForm()
      existingImage.value = null
      categoryImage.value = []
    }
  },
  { immediate: true }
)
</script>

<template>
  <RDialog :title="props.category ? 'Edit Category' : 'Add Category'"
    description="Manage service category details and image" v-model:open="isOpen" class="max-w-2xl">
    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- Category Image Upload -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category Image</label>
        <FileUpload v-model="categoryImage" accept="image/*" file-type="image" display-mode="single" shape="rounded"
          height="lg" :max-size="10 * 1024 * 1024" @file-deleted="handleFileDeleted" />
        <p class="text-xs text-muted-foreground">
          Upload a hero image for this category (PNG, JPG, WebP up to 10MB)
        </p>
      </div>

      <!-- Basic Information -->
      <div class="space-y-4">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Category Name</FormLabel>
            <FormControl>
              <Input v-bind="componentField" placeholder="e.g., Nail Extensions, Nail Art" />
            </FormControl>
            <FormDescription>
              This will be displayed to clients when browsing services
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="name_tr">
          <FormItem>
            <FormLabel>Turkish Name (Optional)</FormLabel>
            <FormControl>
              <Input v-bind="componentField" placeholder="e.g., Tırnak Uzatma, Tırnak Sanatı" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" placeholder="Describe what services are included in this category..."
                rows="3" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-background">
        <Button type="button" variant="outline" @click="handleCancel" :disabled="isLoading">
          Cancel
        </Button>
        <Button type="submit" :disabled="isLoading">
          <component :is="isLoading ? Loader2 : Save" class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoading }" />
          {{ isLoading ? 'Saving...' : 'Save Category' }}
        </Button>
      </div>
    </form>
  </RDialog>
</template>
