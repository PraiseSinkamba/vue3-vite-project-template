<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuery, useMutation, useQueryClient, useQueryCache } from '@pinia/colada'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { Upload, Plus, ImagePlus } from 'lucide-vue-next'

// Components
import ServiceImageCard from './ServiceImageCard.vue'
import PastWorkCard from './PastWorkCard.vue'
import CategoryImageCard from './CategoryImageCard.vue'
import AddonImageCard from './AddonImageCard.vue'
import PastWorkForm from './PastWorkForm.vue'
import BulkUploadForm from './BulkUploadForm.vue'
import ImageUploadForm from '@/components/shared/ImageUploadForm.vue'
import { PageHeader } from '@/components/ui/page'
import { RDialog } from '@/components/ui/reponsive'

// Types
interface Service {
  id: string
  name: string
  category_id: string
}

interface ServiceCategory {
  id: string
  name: string
  name_tr: string
}

interface Addon {
  id: string
  name: string
}

interface ServiceImage {
  id: string
  service_id: string
  image_url: string
  title: string
  image_type: 'hero' | 'gallery' | 'before_after' | 'technique' | 'detail'
  is_featured: boolean
  display_order: number
}

interface PastWork {
  id: string
  service_id: string
  category_id: string
  service_name: string
  category_name: string
  before_image_url?: string
  after_image_url: string
  detail_images: string[]
  title: string
  description: string
  tags: string[]
  is_featured: boolean
  is_public: boolean
  approval_status: 'pending' | 'approved' | 'rejected'
}

// Reactive state
const activeTab = ref('services')
const showAddWork = ref(false)
const showBulkUpload = ref(false)
const showImageUpload = ref(false)
const uploadTitle = ref('')
const uploadConfig = ref({})

// Filters
const selectedService = ref('')
const selectedAddon = ref('')
const filterService = ref('all')
const filterCategory = ref('all')
const filterStatus = ref('all')

const queryClient = useQueryCache()

// Fetch data
const { data: services } = useQuery({
  key: ['services'],
  query: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, category_id')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  },
})

const { data: categories } = useQuery({
  key: ['service-categories'],
  query: async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('id, name, name_tr')
      .order('name')

    if (error) throw error
    return data || []
  },
})

const { data: addons } = useQuery({
  key: ['addons'],
  query: async () => {
    const { data, error } = await supabase
      .from('addons')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  },
})

// Service images query
const { data: serviceImages } = useQuery({
  key: computed(() => ['service-images', selectedService.value]),
  query: async () => {
    if (!selectedService.value) return []

    const { data, error } = await supabase
      .from('service_images')
      .select(
        `
        id, service_id, image_url, image_path, title, description,
        image_type, is_featured, display_order, is_active,
        image_metadata (width, height, thumbnail_url)
      `,
      )
      .eq('service_id', selectedService.value)
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data || []
  },
  enabled: computed(() => !!selectedService.value),
})

// Past work query with filters
const { data: pastWork } = useQuery({
  key: computed(() => ['past-work', filterService.value, filterCategory.value, filterStatus.value]),
  query: async () => {
    let query = supabase.from('past_work_gallery').select(`
        id, service_id, category_id, appointment_id,
        before_image_url, after_image_url, detail_images,
        title, description, technique_notes, tags,
        is_featured, is_public, approval_status,
        client_consent, created_at,
        services (name),
        service_categories (name)
      `)

    // Apply filters
    if (filterService.value && filterService.value !== 'all') {
      query = query.eq('service_id', filterService.value)
    }

    if (filterCategory.value && filterCategory.value !== 'all') {
      query = query.eq('category_id', filterCategory.value)
    }

    if (filterStatus.value === 'featured') {
      query = query.eq('is_featured', true)
    } else if (filterStatus.value !== 'all') {
      query = query.eq('approval_status', filterStatus.value)
    }

    query = query
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error

    return (
      data?.map((item) => ({
        ...item,
        service_name: item.services?.name,
        category_name: item.service_categories?.name,
      })) || []
    )
  },
})

// Addon images query
const { data: addonImages } = useQuery({
  key: computed(() => ['addon-images', selectedAddon.value]),
  query: async () => {
    if (!selectedAddon.value) return []

    const { data, error } = await supabase
      .from('addon_images')
      .select('*')
      .eq('addon_id', selectedAddon.value)
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data || []
  },
  enabled: computed(() => !!selectedAddon.value),
})

// Mutations
const uploadServiceImageMutation = useMutation({
  mutation: async (imageData: any) => {
    // Upload to storage
    const fileName = `services/${imageData.service_id}/${Date.now()}_${imageData.file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('service-gallery')
      .upload(fileName, imageData.file)

    if (uploadError) throw uploadError

    const imageUrl = supabase.storage.from('service-gallery').getPublicUrl(fileName).data.publicUrl

    // Create database record
    const { data, error } = await supabase
      .from('service_images')
      .insert({
        service_id: imageData.service_id,
        image_url: imageUrl,
        image_path: fileName,
        title: imageData.title,
        description: imageData.description,
        alt_text: imageData.alt_text,
        image_type: imageData.image_type,
        is_featured: imageData.is_featured || false,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single()

    if (error) throw error

    // Create metadata
    await supabase.rpc('create_image_metadata', {
      p_image_url: imageUrl,
      p_original_filename: imageData.file.name,
      p_storage_bucket: 'service-gallery',
      p_storage_path: fileName,
      p_file_size: imageData.file.size,
      p_mime_type: imageData.file.type,
    })

    return data
  },
  onSuccess: () => {
    toast({ title: 'Success', description: 'Service image uploaded successfully' })
    queryClient.invalidateQueries({ key: ['service-images'] })
    showImageUpload.value = false
  },
  onError: (error) => {
    console.error('Upload error:', error)
    toast({
      title: 'Error',
      description: 'Failed to upload image',
      variant: 'destructive',
    })
  },
})

const addPastWorkMutation = useMutation({
  mutation: async (workData: any) => {
    console.log(workData)
    const uploads = []

    // Upload after image (required)
    if (workData.afterImage) {
      const afterFileName = `past-work/${Date.now()}_after_${workData.afterImage.name}`
      const { error: afterError } = await supabase.storage
        .from('service-gallery')
        .upload(afterFileName, workData.afterImage)

      if (afterError) throw afterError
      workData.after_image_url = supabase.storage
        .from('service-gallery')
        .getPublicUrl(afterFileName).data.publicUrl
      workData.after_image_path = afterFileName
    }

    // Upload before image (optional)
    if (workData.beforeImage) {
      const beforeFileName = `past-work/${Date.now()}_before_${workData.beforeImage.name}`
      const { error: beforeError } = await supabase.storage
        .from('service-gallery')
        .upload(beforeFileName, workData.beforeImage)

      if (beforeError) throw beforeError
      workData.before_image_url = supabase.storage
        .from('service-gallery')
        .getPublicUrl(beforeFileName).data.publicUrl
      workData.before_image_path = beforeFileName
    }

    // Upload detail images (optional)
    const detailImages = []
    if (workData.detailImages?.length > 0) {
      for (let i = 0; i < workData.detailImages.length; i++) {
        const file = workData.detailImages[i]
        const detailFileName = `past-work/${Date.now()}_detail_${i}_${file.name}`
        const { error: detailError } = await supabase.storage
          .from('service-gallery')
          .upload(detailFileName, file)

        if (detailError) throw detailError

        const detailUrl = supabase.storage.from('service-gallery').getPublicUrl(detailFileName)
          .data.publicUrl

        detailImages.push({
          url: detailUrl,
          path: detailFileName,
          alt: `Detail shot ${i + 1}`,
        })
      }
    }

    // Insert past work record
    const { data, error } = await supabase
      .from('past_work_gallery')
      .insert({
        service_id: workData.service_id,
        category_id: workData.category_id,
        appointment_id: workData.appointment_id,
        before_image_url: workData.before_image_url,
        before_image_path: workData.before_image_path,
        after_image_url: workData.after_image_url,
        after_image_path: workData.after_image_path,
        detail_images: detailImages,
        title: workData.title,
        title_tr: workData.title_tr,
        description: workData.description,
        description_tr: workData.description_tr,
        technique_notes: workData.technique_notes,
        tags: workData.tags || [],
        tags_tr: workData.tags_tr || [],
        is_featured: workData.is_featured || false,
        is_public: workData.is_public !== false,
        client_consent: workData.client_consent !== false,
        approval_status: 'approved', // Auto-approve for existing business
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
  onSuccess: () => {
    toast({ title: 'Success', description: 'Past work added successfully' })
    queryClient.invalidateQueries({ key: ['past-work'] })
    showAddWork.value = false
  },
  onError: (error) => {
    console.error('Add past work error:', error)
    toast({
      title: 'Error',
      description: 'Failed to add past work',
      variant: 'destructive',
    })
  },
})

// Event handlers
const uploadServiceImage = () => {
  if (!selectedService.value) return

  uploadTitle.value = 'Upload Service Image'
  uploadConfig.value = {
    type: 'service',
    service_id: selectedService.value,
    accept: 'image/*',
    multiple: false,
  }
  showImageUpload.value = true
}

const uploadCategoryImage = (categoryId: string) => {
  uploadTitle.value = 'Upload Category Image'
  uploadConfig.value = {
    type: 'category',
    category_id: categoryId,
    accept: 'image/*',
    multiple: false,
  }
  showImageUpload.value = true
}

const uploadAddonImage = () => {
  if (!selectedAddon.value) return

  uploadTitle.value = 'Upload Add-on Image'
  uploadConfig.value = {
    type: 'addon',
    addon_id: selectedAddon.value,
    accept: 'image/*',
    multiple: false,
  }
  showImageUpload.value = true
}

const handleAddPastWork = (workData: any) => {
  addPastWorkMutation.mutate(workData)
}

const handleBulkUpload = async (uploadData: any) => {
  try {
    // Process bulk upload
    const results = []
    for (const item of uploadData.items) {
      const result = await addPastWorkMutation.mutateAsync(item)
      results.push(result)
    }

    toast({
      title: 'Success',
      description: `Successfully uploaded ${results.length} items`,
    })
    showBulkUpload.value = false
  } catch (error) {
    console.error('Bulk upload error:', error)
    toast({
      title: 'Error',
      description: 'Some items failed to upload',
      variant: 'destructive',
    })
  }
}

const handleImageUpload = (imageData: any) => {
  console.log('Image upload:', imageData)
  uploadServiceImageMutation.mutate(imageData)
}

const editServiceImage = (image: ServiceImage) => {
  // Open edit modal
  console.log('Edit service image:', image)
}

const deleteServiceImage = async (imageId: string) => {
  try {
    const { error } = await supabase.from('service_images').delete().eq('id', imageId)

    if (error) throw error

    toast({ title: 'Success', description: 'Image deleted successfully' })
    queryClient.invalidateQueries({ key: ['service-images'] })
  } catch (error) {
    console.error('Delete error:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete image',
      variant: 'destructive',
    })
  }
}

const toggleFeatured = async (imageId: string, featured: boolean) => {
  try {
    const { error } = await supabase
      .from('service_images')
      .update({ is_featured: featured })
      .eq('id', imageId)

    if (error) throw error

    toast({
      title: 'Success',
      description: `Image ${featured ? 'featured' : 'unfeatured'}`,
    })
    queryClient.invalidateQueries({ key: ['service-images'] })
  } catch (error) {
    console.error('Toggle featured error:', error)
    toast({
      title: 'Error',
      description: 'Failed to update image',
      variant: 'destructive',
    })
  }
}

const editPastWork = (work: PastWork) => {
  console.log('Edit past work:', work)
}

const deletePastWork = async (workId: string) => {
  try {
    const { error } = await supabase.from('past_work_gallery').delete().eq('id', workId)

    if (error) throw error

    toast({ title: 'Success', description: 'Past work deleted successfully' })
    queryClient.invalidateQueries({ key: ['past-work'] })
  } catch (error) {
    console.error('Delete past work error:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete past work',
      variant: 'destructive',
    })
  }
}

const approvePastWork = async (workId: string) => {
  try {
    const { error } = await supabase
      .from('past_work_gallery')
      .update({ approval_status: 'approved' })
      .eq('id', workId)

    if (error) throw error

    toast({ title: 'Success', description: 'Past work approved' })
    queryClient.invalidateQueries({ key: ['past-work'] })
  } catch (error) {
    console.error('Approve error:', error)
    toast({
      title: 'Error',
      description: 'Failed to approve past work',
      variant: 'destructive',
    })
  }
}

const toggleFeaturedWork = async (workId: string, featured: boolean) => {
  try {
    const { error } = await supabase
      .from('past_work_gallery')
      .update({ is_featured: featured })
      .eq('id', workId)

    if (error) throw error

    queryClient.invalidateQueries({ key: ['past-work'] })
  } catch (error) {
    console.error('Toggle featured work error:', error)
  }
}

const togglePublicWork = async (workId: string, isPublic: boolean) => {
  try {
    const { error } = await supabase
      .from('past_work_gallery')
      .update({ is_public: isPublic })
      .eq('id', workId)

    if (error) throw error

    queryClient.invalidateQueries({ key: ['past-work'] })
  } catch (error) {
    console.error('Toggle public work error:', error)
  }
}

const editCategoryImage = (image: any) => {
  console.log('Edit category image:', image)
}

const deleteCategoryImage = (imageId: string) => {
  console.log('Delete category image:', imageId)
}

const editAddonImage = (image: any) => {
  console.log('Edit addon image:', image)
}

const deleteAddonImage = (imageId: string) => {
  console.log('Delete addon image:', imageId)
}

onMounted(() => {
  // Load initial data
})
</script>

<template>
  <div class="service-gallery-manager p-6 space-y-6">
    <!-- Header -->
    <PageHeader
      title="My Portfolio"
      subtitle="Upload and manage service images and past work"
      :actions="{
        primary: {
          icon: Plus,
          text: 'Add Past Work',
          onClick: () => (showAddWork = true),
        },
        secondary: {
          icon: Upload,
          text: 'Bulk Upload',
          variant: 'outline',
          onClick: () => (showBulkUpload = true),
        },
      }"
    />

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="services">Service Images</TabsTrigger>
        <TabsTrigger value="categories">Category Images</TabsTrigger>
        <TabsTrigger value="past-work">Past Work Gallery</TabsTrigger>
        <TabsTrigger value="addons">Add-on Images</TabsTrigger>
      </TabsList>

      <!-- Service Images Tab -->
      <TabsContent value="services" class="space-y-4">
        <div class="flex gap-4 items-center">
          <Select v-model="selectedService">
            <SelectTrigger class="w-[300px]">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="service in services" :key="service.id" :value="service.id">
                {{ service.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button @click="uploadServiceImage" :disabled="!selectedService">
            <ImagePlus class="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>

        <div
          v-if="serviceImages?.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <ServiceImageCard
            v-for="image in serviceImages"
            :key="image.id"
            :image="image"
            @edit="editServiceImage"
            @delete="deleteServiceImage"
            @toggle-featured="toggleFeatured"
          />
        </div>
        <div v-else-if="selectedService" class="text-center py-8 text-muted-foreground">
          No images uploaded for this service yet.
        </div>
      </TabsContent>

      <!-- Past Work Gallery Tab -->
      <TabsContent value="past-work" class="space-y-4">
        <div class="flex gap-4 items-center flex-wrap">
          <Select v-model="filterService">
            <SelectTrigger class="w-[200px]">
              <SelectValue placeholder="Filter by service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem v-for="service in services" :key="service.id" :value="service.id">
                {{ service.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="filterCategory">
            <SelectTrigger class="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="filterStatus">
            <SelectTrigger class="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="featured">Featured Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          v-if="pastWork?.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <PastWorkCard
            v-for="work in pastWork"
            :key="work.id"
            :work="work"
            @edit="editPastWork"
            @delete="deletePastWork"
            @approve="approvePastWork"
            @toggle-featured="toggleFeaturedWork"
            @toggle-public="togglePublicWork"
          />
        </div>
        <div v-else class="text-center py-8 text-muted-foreground">No past work uploaded yet.</div>
      </TabsContent>

      <!-- Categories Tab -->
      <TabsContent value="categories" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CategoryImageCard
            v-for="category in categories"
            :key="category.id"
            :category="category"
            @upload="uploadCategoryImage"
            @edit="editCategoryImage"
            @delete="deleteCategoryImage"
          />
        </div>
      </TabsContent>

      <!-- Add-ons Tab -->
      <TabsContent value="addons" class="space-y-4">
        <div class="flex gap-4 items-center">
          <Select v-model="selectedAddon">
            <SelectTrigger class="w-[300px]">
              <SelectValue placeholder="Select an add-on" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="addon in addons" :key="addon.id" :value="addon.id">
                {{ addon.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button @click="uploadAddonImage" :disabled="!selectedAddon">
            <ImagePlus class="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>

        <div
          v-if="addonImages?.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AddonImageCard
            v-for="image in addonImages"
            :key="image.id"
            :image="image"
            @edit="editAddonImage"
            @delete="deleteAddonImage"
          />
        </div>
      </TabsContent>
    </Tabs>

    <!-- Add Past Work Modal -->
    <RDialog
      v-model:open="showAddWork"
      title="Add Past Work"
      description="Upload photos of completed work to showcase your services"
    >
      <PastWorkForm @submit="handleAddPastWork" @cancel="showAddWork = false" />
    </RDialog>

    <!-- Bulk Upload Modal -->
    <RDialog
      v-model:open="showBulkUpload"
      title="Bulk Upload Past Work"
      description="Upload multiple images at once for your existing portfolio"
    >
      <BulkUploadForm @submit="handleBulkUpload" @cancel="showBulkUpload = false" />
    </RDialog>

    <!-- Image Upload Modal -->
    <RDialog v-model:open="showImageUpload" :title="uploadTitle">
      <ImageUploadForm
        :upload-config="uploadConfig"
        @submit="handleImageUpload"
        @cancel="showImageUpload = false"
      />
    </RDialog>
  </div>
  <!--
   {
    "service_id": "0fc36cf2-0a5c-4899-8e45-7a7d62e24ec5",
    "category_id": "66977500-4698-4a5a-8872-ce487ca2e76f",
    "appointment_id": "",
    "title": "Nude Polygel nails",
    "title_tr": "Çıplak Polijel tırnaklar",
    "description": "These are some beautiful square polygel nails with chrome",
    "description_tr": "Bunlar krom ile bazı güzel kare poligel tırnakları",
    "technique_notes": "Used pristine nude polygel from italy gold chrome and white french tips ",
    "tags": [
        "french tips",
        "chrome",
        "square nails"
    ],
    "tags_tr": [
        "fransız ipuçları",
        "krom",
        "kare çivi"
    ],
    "is_featured": false,
    "is_public": true,
    "client_consent": false,
    "afterImage": {},
    "beforeImage": {},
    "detailImages": [
        {},
        {}
    ]
}
   -->
</template>

<style scoped>
.service-gallery-manager {
  min-height: 100vh;
}
</style>
