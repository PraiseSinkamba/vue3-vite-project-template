<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, FieldArray } from 'vee-validate'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  Trash2,
  Scissors,
  Info,
  Settings,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Package2,
  Paintbrush2,
  ImagePlus,
  Images,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useServiceStore } from '@/stores/services'
import { useInventoryStore } from '@/stores/inventory'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import type { Service, ServiceInsert, ServiceProductInsert } from '@/types'
import { useImageManager } from '@/composables/useImageUpload'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuCheckboxItem,
} from '@/components/ui/context-menu'
import { FileUpload } from '@/components/ui/file-upload'
import type { FileRecord } from '@/components/ui/file-upload'

const props = defineProps<{
  service?: Service
  category?: string
}>()

const router = useRouter()
const serviceStore = useServiceStore()
const inventoryStore = useInventoryStore()

// Fetch required data
serviceStore.fetchServices()
inventoryStore.fetchProducts()

const showOptionalFields = ref(false)
const showProductsSection = ref(!!props.service?.service_products?.length)
const expandedProducts = ref<Set<number>>(new Set())
const showImagesSection = ref(false)
const queryCache = useQueryCache()

// Image upload state
const uploadingImages = ref<FileRecord[]>([])

// Image manager composable
const imageManager = useImageManager({
  bucket: 'service-gallery',
  onUploadSuccess: (results) => {
    const count = results.length
    toast.success(`${count} image${count > 1 ? 's' : ''} uploaded successfully`)
    queryCache.invalidateQueries({ key: ['service-images'] })
    refreshImages()
    uploadingImages.value = []
  },
  onDeleteSuccess: () => {
    toast.success('Image deleted successfully')
    queryCache.invalidateQueries({ key: ['service-images'] })
    refreshImages()
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

// Duration presets in minutes
const durationPresets = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 180, label: '3 hours' },
]

// Service product schema
const serviceProductSchema = z.object({
  id: z.string().optional(),
  service_id: z.string().optional(),
  product_id: z.string().min(1, 'Please select a product'),
  typical_quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater').optional(),
  is_required: z.boolean().default(false),
})

// Main form schema
const formSchema = toTypedSchema(
  z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Service name must be at least 2 characters').max(100),
    name_tr: z.string().optional(),
    description: z.string().optional(),
    category_id: z.string().min(1, 'Please select a category'),
    duration_minutes: z.coerce.number().min(15, 'Duration must be at least 15 minutes'),
    base_price: z.coerce.number().min(0, 'Base price must be 0 or greater'),
    is_active: z.boolean().default(true),
    service_products: z.array(serviceProductSchema).optional(),
  }),
)

const { handleSubmit, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    id: props.service?.id,
    name: props.service?.name || '',
    name_tr: props.service?.name_tr || '',
    description: props.service?.description || '',
    category_id: props.service?.category_id || (props.category as string | undefined),
    duration_minutes: props.service?.duration_minutes || 60,
    base_price: props.service?.base_price || 0,
    is_active: props.service?.is_active || true,
    service_products: (props.service?.service_products || []).map((sp) => ({
      id: sp.id,
      service_id: sp.service_id,
      product_id: sp.product_id || '',
      typical_quantity: sp.typical_quantity,
      is_required: sp.is_required || false,
    })),
  },
})

// Computed values
const selectedDurationPreset = computed(() => {
  return durationPresets.find((preset) => preset.value === values.duration_minutes)
})

const availableProducts = computed(() => {
  return inventoryStore.products.filter(
    (product) =>
      product.track_usage && // Only products that can be tracked in services
      !values.service_products?.some((sp) => sp.product_id === product.id),
  )
})

const totalEstimatedCost = computed(() => {
  if (!values.service_products?.length) return 0
  return values.service_products.reduce((total, serviceProduct) => {
    const product = inventoryStore.products.find((p) => p.id === serviceProduct.product_id)
    if (!product) return total

    // Find the default variant or first variant for cost calculation
    const variant = product.variants?.find((v) => true)
    const costPrice = variant?.cost_price || 0
    const quantity = serviceProduct.typical_quantity || 0

    return total + costPrice * quantity
  }, 0)
})

const estimatedProfit = computed(() => {
  return Math.max(0, (values.base_price || 0) - totalEstimatedCost.value)
})

const profitMargin = computed(() => {
  if (!values.base_price || values.base_price <= 0) return 0
  return (estimatedProfit.value / values.base_price) * 100
})

// Create service mutation
const { mutate: createService, isLoading } = useMutation({
  mutation: async (formData: typeof values) => {
    const { service_products, ...serviceData } = formData

    console.log('in mutation', serviceData, service_products)
    // Insert service first
    const { data: service, error } = await serviceStore.createOrUpdateService({
      id: serviceData.id,
      name: serviceData.name,
      name_tr: serviceData.name_tr || null,
      description: serviceData.description || null,
      category_id: serviceData.category_id,
      duration_minutes: serviceData.duration_minutes,
      base_price: serviceData.base_price,
      is_active: serviceData.is_active,
    } as ServiceInsert)

    if (error || !service) throw new Error('Failed to create service')

    // Insert service products if any
    if (service_products && service_products.length > 0) {
      const serviceProductsToInsert: ServiceProductInsert[] = service_products.map((sp) => ({
        id: sp.id,
        service_id: service.id,
        product_id: sp.product_id,
        typical_quantity: sp.typical_quantity || null,
        is_required: sp.is_required || false,
      }))

      await serviceStore.createOrUpdateServiceProducts(serviceProductsToInsert)
    }

    return service
  },
  onSuccess: (data) => {
    toast.success(`Service "${data.name}" created successfully.`)
    router.push('/admin/services')
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to create service. Please try again.')
  },
})

const onSubmit = handleSubmit((formValues) => {
  console.log(formValues)
  createService(formValues)
})

const handleDiscard = () => {
  router.push('/admin/services')
}

// Duration preset selection
const selectDurationPreset = (minutes: number) => {
  setFieldValue('duration_minutes', minutes)
}

// Product management
const addProduct = () => {
  const currentProducts = values.service_products || []
  const newIndex = currentProducts.length
  setFieldValue('service_products', [
    ...currentProducts,
    {
      product_id: '',
      typical_quantity: 0,
      is_required: true,
    },
  ])
  // Expand the new product
  expandedProducts.value.add(newIndex)
}

const removeProduct = (index: number) => {
  const currentProducts = values.service_products || []
  setFieldValue(
    'service_products',
    currentProducts.filter((_, i) => i !== index),
  )
  expandedProducts.value.delete(index)
}

const toggleProductExpansion = (index: number) => {
  if (expandedProducts.value.has(index)) {
    expandedProducts.value.delete(index)
  } else {
    expandedProducts.value.add(index)
  }
}

const getProductName = (productId: string) => {
  const product = inventoryStore.products.find((p) => p.id === productId)
  return product?.name || 'Unknown Product'
}

const getProductCostEstimate = (productId: string, quantity: number = 1) => {
  const product = inventoryStore.products.find((p) => p.id === productId)
  if (!product) return 0

  const variant = product.variants?.[0]
  return (variant?.cost_price || 0) * quantity
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount)
}

// Format duration
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

// Service images query
const { data: serviceImages, refresh: refreshImages } = useQuery({
  key: () => ['service-images', props.service?.id],
  query: async () => {
    if (!props.service?.id) return []

    const { data, error } = await supabase
      .from('service_images')
      .select(
        `
        id, service_id, image_url, image_path, title, description,
        image_type, is_featured, display_order, is_active,
        image_metadata (width, height, thumbnail_url)
      `,
      )
      .eq('service_id', props.service.id)
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data || []
  },
  enabled: computed(() => !!props.service?.id),
  staleTime: 300_000, // 5 minutes
})

// Watch for service images to show section
watch(
  serviceImages,
  (images) => {
    if (images && images.length > 0) {
      showImagesSection.value = true
    }
  },
  { immediate: true },
)

// Upload multiple service images mutation
const uploadServiceImageMutation = useMutation({
  mutation: async (files: File[]) => {
    if (!props.service?.id) {
      throw new Error('Service must be saved before uploading images')
    }

    // Get starting display order
    const maxOrder = Math.max(
      0,
      ...(serviceImages.value?.map((img) => img.display_order ?? 0) || []),
    )

    // Upload images with metadata using image manager
    const uploadResults = await imageManager.uploadImages(
      files,
      (file, index) => `services/${props.service!.id}/${Date.now()}_${index}_${file.name}`,
    )

    // Create service image records for each uploaded image
    const serviceImagePromises = uploadResults.map(async (result, index) => {
      const { data, error } = await supabase
        .from('service_images')
        .insert({
          service_id: props.service!.id,
          image_url: result.imageUrl,
          image_path: result.imagePath,
          title: result.metadata.originalFilename.replace(/\.[^/.]+$/, ''),
          alt_text: result.metadata.originalFilename.replace(/\.[^/.]+$/, ''),
          image_type: 'gallery',
          is_featured: false,
          display_order: maxOrder + index + 1,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    })

    return await Promise.all(serviceImagePromises)
  },
  onError: (error) => {
    console.error('Upload error:', error)
    toast.error('Failed to upload images')
  },
})

// Delete service image
const deleteServiceImage = async (imageId: string) => {
  try {
    // Get image details first
    const { data: image } = await supabase
      .from('service_images')
      .select('image_path, image_url')
      .eq('id', imageId)
      .single()

    if (!image?.image_path) {
      throw new Error('Image not found')
    }

    // Delete from storage and metadata using image manager
    await imageManager.deleteImage({
      path: image.image_path,
      imageUrl: image.image_url,
      deleteMetadata: true,
    })

    // Delete from service_images table
    const { error } = await supabase.from('service_images').delete().eq('id', imageId)

    if (error) throw error
  } catch (error) {
    console.error('Delete error:', error)
    toast.error('Failed to delete image')
  }
}

// Toggle featured
const toggleFeatured = async (imageId: string, featured: boolean) => {
  try {
    const { error } = await supabase
      .from('service_images')
      .update({ is_featured: featured })
      .eq('id', imageId)

    if (error) throw error

    toast.success(`Image ${featured ? 'featured' : 'unfeatured'}`)
    queryCache.invalidateQueries({ key: ['service-images'] })
    refreshImages()
  } catch (error) {
    console.error('Toggle featured error:', error)
    toast.error('Failed to update image')
  }
}

// Set image as hero
const setAsHero = async (imageId: string) => {
  try {
    // First, set all images of this service to gallery type
    const { error: resetError } = await supabase
      .from('service_images')
      .update({ image_type: 'gallery' })
      .eq('service_id', props.service?.id ?? '')

    if (resetError) throw resetError

    // Then set the selected image as hero
    const { error } = await supabase
      .from('service_images')
      .update({ image_type: 'hero', display_order: 0 })
      .eq('id', imageId)

    if (error) throw error

    toast.success('Image set as hero')
    queryCache.invalidateQueries({ key: ['service-images'] })
    refreshImages()
  } catch (error) {
    console.error('Set hero error:', error)
    toast.error('Failed to set hero image')
  }
}

// Update image type
const updateImageType = async (
  imageId: string,
  imageType: 'hero' | 'gallery' | 'before_after' | 'technique' | 'detail',
) => {
  try {
    // If setting as hero, reset other hero images first
    if (imageType === 'hero') {
      await supabase
        .from('service_images')
        .update({ image_type: 'gallery' })
        .eq('service_id', props.service?.id ?? '')
        .eq('image_type', 'hero')
    }

    const { error } = await supabase
      .from('service_images')
      .update({ image_type: imageType })
      .eq('id', imageId)

    if (error) throw error

    toast.success(`Image type updated to ${imageType}`)
    queryCache.invalidateQueries({ key: ['service-images'] })
    refreshImages()
  } catch (error) {
    console.error('Update image type error:', error)
    toast.error('Failed to update image type')
  }
}

// Handle file upload from FileUpload component
const handleFileUploaded = async (files: FileRecord | FileRecord[]) => {
  if (!props.service?.id) {
    toast.error('Please save the service before uploading images')
    return
  }

  // Handle both single file and array of files
  const fileArray = Array.isArray(files) ? files : [files]
  const validFiles = fileArray.map((f) => f.file).filter((f): f is File => f !== undefined)

  if (validFiles.length === 0) return

  uploadServiceImageMutation.mutate(validFiles)
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Main Content -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Basic Information -->
      <Card class="shadow-none border border-muted-background">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Info class="h-5 w-5 text-primary" />
            Service Information
          </CardTitle>
          <CardDescription> Basic details about your service offering </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Polygel Manicure, Nail Art Design" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField v-slot="{ componentField }" name="category_id">
              <FormItem>
                <FormLabel>Service Category</FormLabel>
                <Select class="w-full" v-bind="componentField">
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="category in serviceStore.categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ value, handleChange }" name="is_active">
              <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
                <div class="space-y-0.5">
                  <FormLabel class="text-sm font-medium">Active Service</FormLabel>
                  <FormDescription class="text-xs">
                    Available for booking by clients
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch :modelValue="value" @update:modelValue="handleChange" />
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <!-- Optional Fields -->
          <div class="pt-4 border-t">
            <Button type="button" variant="ghost" size="sm" @click="showOptionalFields = !showOptionalFields"
              class="text-primary">
              <Plus class="h-4 w-4 mr-2" />
              {{ showOptionalFields ? 'Hide' : 'Add' }} Optional Information
            </Button>

            <div v-if="showOptionalFields" class="mt-4 space-y-4">
              <FormField v-slot="{ componentField }" name="name_tr">
                <FormItem>
                  <FormLabel>Turkish Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Türkçe hizmet adı" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="description">
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this service includes..." rows="3" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Pricing & Duration -->
      <Card class="shadow-none border border-muted-background">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Settings class="h-5 w-5 text-primary" />
            Pricing & Duration
          </CardTitle>
          <CardDescription> Set the time and cost for this service </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Duration -->
          <div class="space-y-4">
            <FormField v-slot="{ componentField }" name="duration_minutes">
              <FormItem>
                <FormLabel class="flex items-center gap-2">
                  <Clock class="h-4 w-4" />
                  Duration (minutes)
                </FormLabel>
                <div class="space-y-3">
                  <FormControl>
                    <Input type="number" min="15" step="15" placeholder="60" v-bind="componentField" />
                  </FormControl>

                  <!-- Duration Presets -->
                  <div class="flex flex-wrap gap-2">
                    <Button v-for="preset in durationPresets" :key="preset.value" type="button" variant="outline"
                      size="sm" :class="selectedDurationPreset?.value === preset.value
                          ? 'bg-primary text-primary-foreground'
                          : ''
                        " @click="selectDurationPreset(preset.value)">
                      {{ preset.label }}
                    </Button>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <!-- Base Price -->
          <FormField v-slot="{ componentField }" name="base_price">
            <FormItem>
              <FormLabel class="flex items-center gap-2">
                <DollarSign class="h-4 w-4" />
                Base Price
              </FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="0.00" v-bind="componentField" />
              </FormControl>
              <FormDescription>
                Starting price for this service (can be adjusted during booking)
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </CardContent>
      </Card>

      <!-- Service Products -->
      <Card class="shadow-none border border-muted-background">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Package2 class="h-5 w-5 text-primary" />
            Required Products
            <Badge variant="secondary" class="ml-auto">
              {{ values.service_products?.length || 0 }} products
            </Badge>
          </CardTitle>
          <CardDescription> Products typically used when performing this service </CardDescription>
          <Button type="button" variant="ghost" size="sm" @click="showProductsSection = !showProductsSection"
            class="text-primary w-fit">
            <Plus class="h-4 w-4 mr-2" />
            {{ showProductsSection ? 'Hide' : 'Manage' }} Product Usage
          </Button>
        </CardHeader>

        <CardContent v-show="showProductsSection">
          <FieldArray name="service_products" v-slot="{ fields }">
            <div class="space-y-4">
              <div v-for="(field, index) in fields" :key="field.key" class="border rounded-lg overflow-hidden">
                <div class="flex items-center justify-between p-4 bg-muted/30">
                  <div class="flex items-center gap-3">
                    <Button type="button" variant="ghost" size="sm" @click="toggleProductExpansion(index)"
                      class="h-8 w-8 p-0">
                      <component :is="expandedProducts.has(index) ? ChevronDown : ChevronRight" class="h-4 w-4" />
                    </Button>

                    <div>
                      <p class="font-medium">
                        {{
                          values.service_products?.[index]?.product_id
                            ? getProductName(values.service_products[index].product_id)
                            : 'Select Product'
                        }}
                      </p>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge v-if="values.service_products?.[index]?.is_required" variant="default" class="text-xs">
                          Required
                        </Badge>
                        <span class="text-xs text-muted-foreground">
                          Qty: {{ values.service_products?.[index]?.typical_quantity || 1 }}
                        </span>
                        <span v-if="values.service_products?.[index]?.product_id" class="text-xs text-muted-foreground">
                          Cost:
                          {{
                            formatCurrency(
                              getProductCostEstimate(
                                values.service_products[index].product_id,
                                values.service_products[index].typical_quantity || 1,
                              ),
                            )
                          }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button type="button" variant="ghost" size="sm" @click="removeProduct(index)"
                    class="h-8 w-8 p-0 text-destructive hover:text-destructive">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>

                <div v-show="expandedProducts.has(index)" class="p-4 border-t">
                  <div class="space-y-4">
                    <FormField v-slot="{ componentField }" :name="`service_products.${index}.product_id`">
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select class="w-full" v-bind="componentField">
                          <FormControl>
                            <SelectTrigger class="w-full">
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem v-for="product in inventoryStore.products" :key="product.id"
                              :value="product.id">
                              {{ product.name }}
                              <span class="text-xs text-muted-foreground ml-2">
                                ({{ product.brand }})
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <div class="grid grid-cols-1 mg:grid-cols-2 gap-4">
                      <FormField v-slot="{ componentField }" :name="`service_products.${index}.typical_quantity`">
                        <FormItem>
                          <FormLabel>Typical Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.1" placeholder="1" v-bind="componentField" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ value, handleChange }" :name="`service_products.${index}.is_required`">
                        <FormItem class="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div>
                            <FormLabel class="text-sm font-medium">Required</FormLabel>
                            <FormDescription class="text-xs">
                              Must be used for this service
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch :modelValue="value" @update:modelValue="handleChange" />
                          </FormControl>
                        </FormItem>
                      </FormField>
                    </div>
                  </div>
                </div>
              </div>

              <Button v-if="availableProducts.length > 0" type="button" variant="outline" size="sm" @click="addProduct"
                class="w-full border-dashed">
                <Plus class="h-4 w-4 mr-2" />
                Add Product
              </Button>

              <p v-else class="text-sm text-muted-foreground text-center py-4">
                No more trackable products available to add
              </p>
            </div>
          </FieldArray>
        </CardContent>
      </Card>

      <!-- Service Images -->
      <Card class="shadow-none border border-muted-background">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Images class="h-5 w-5 text-primary" />
            Service Images
            <Badge variant="secondary" class="ml-auto">
              {{ serviceImages?.length || 0 }} images
            </Badge>
          </CardTitle>
          <CardDescription>
            Upload and manage images for this service
          </CardDescription>
          <Button type="button" variant="ghost" size="sm" @click="showImagesSection = !showImagesSection"
            class="text-primary w-fit">
            <Plus class="h-4 w-4 mr-2" />
            {{ showImagesSection ? 'Hide' : 'Manage' }} Images
          </Button>
        </CardHeader>

        <CardContent v-show="showImagesSection" class="overflow-hidden">
          <!-- No Service Warning -->
          <div v-if="!props.service?.id" class="text-center py-8 text-muted-foreground">
            <p class="text-sm">Save the service first before uploading images</p>
          </div>

          <!-- Images Grid with Upload Area -->
          <div v-else class="space-y-4">
            <!-- Upload Area - Full Width -->
            <div class="w-full">
              <FileUpload v-model="uploadingImages" accept="image/*" multiple file-type="image" display-mode="grid"
                shape="rounded" :max-size="10 * 1024 * 1024" :max-files="12" @files-added="handleFileUploaded" />
            </div>

            <!-- Existing Images Grid -->
            <div v-if="serviceImages && serviceImages.length > 0"
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <!-- Existing Images with Context Menu -->
              <ContextMenu v-for="image in serviceImages" :key="image.id">
                <ContextMenuTrigger>
                  <div
                    class="group relative aspect-square overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer">
                    <!-- Main Image Badge -->
                    <div v-if="image.image_type === 'hero'" class="absolute left-2 top-2 z-10">
                      <Badge variant="default" class="bg-primary text-primary-foreground">
                        Main Image
                      </Badge>
                    </div>

                    <!-- Image -->
                    <img :src="image.image_url" :alt="image.title as string"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy" />

                    <!-- Hover Overlay -->
                    <div
                      class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <!-- Image Info on Hover -->
                    <div
                      class="absolute bottom-0 left-0 right-0 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                      <div class="bg-white/95 backdrop-blur-sm rounded-md px-3 py-2">
                        <p class="text-xs font-medium text-gray-900 truncate">{{ image.title }}</p>
                        <div class="flex items-center justify-between mt-1">
                          <span class="text-xs text-muted-foreground">Order: {{ image.display_order }}</span>
                          <Badge v-if="image.is_featured" variant="secondary" class="text-xs">
                            Featured
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>

                <ContextMenuContent class="w-56">
                  <!-- Set as Main Image -->
                  <ContextMenuItem @click="setAsHero(image.id)" :disabled="image.image_type === 'hero'">
                    <ImagePlus class="mr-2 h-4 w-4" />
                    <span>Set as Main Image</span>
                  </ContextMenuItem>

                  <ContextMenuSeparator />

                  <!-- Image Type Submenu -->
                  <ContextMenuItem @click="updateImageType(image.id, 'gallery')">
                    <ContextMenuCheckboxItem :checked="image.image_type === 'gallery'" class="mr-2" />
                    Gallery
                  </ContextMenuItem>
                  <ContextMenuItem @click="updateImageType(image.id, 'before_after')">
                    <ContextMenuCheckboxItem :checked="image.image_type === 'before_after'" class="mr-2" />
                    Before/After
                  </ContextMenuItem>
                  <ContextMenuItem @click="updateImageType(image.id, 'technique')">
                    <ContextMenuCheckboxItem :checked="image.image_type === 'technique'" class="mr-2" />
                    Technique
                  </ContextMenuItem>
                  <ContextMenuItem @click="updateImageType(image.id, 'detail')">
                    <ContextMenuCheckboxItem :checked="image.image_type === 'detail'" class="mr-2" />
                    Detail
                  </ContextMenuItem>

                  <ContextMenuSeparator />

                  <!-- Featured Toggle -->
                  <ContextMenuItem @click="toggleFeatured(image.id, !image.is_featured)">
                    <ContextMenuCheckboxItem :checked="image.is_featured" class="mr-2" />
                    Featured
                  </ContextMenuItem>

                  <ContextMenuSeparator />

                  <!-- Delete -->
                  <ContextMenuItem @click="deleteServiceImage(image.id)" class="text-destructive">
                    <Trash2 class="mr-2 h-4 w-4" />
                    <span>Delete Image</span>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Service Preview -->
      <Card class="shadow-none border border-muted-background">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Paintbrush2 class="h-5 w-5" />
            Service Preview
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-3">
            <div class="flex justify-between items-center text-sm">
              <span class="text-muted-foreground">Duration</span>
              <Badge variant="outline">
                {{ values.duration_minutes ? formatDuration(values.duration_minutes) : '0m' }}
              </Badge>
            </div>

            <div class="flex justify-between items-center text-sm">
              <span class="text-muted-foreground">Base Price</span>
              <span class="font-medium">{{ formatCurrency(values.base_price || 0) }}</span>
            </div>

            <div class="flex justify-between items-center text-sm">
              <span class="text-muted-foreground">Est. Product Cost</span>
              <span class="font-medium text-red-600">
                -{{ formatCurrency(totalEstimatedCost) }}
              </span>
            </div>

            <div class="border-t pt-3">
              <div class="flex justify-between items-center">
                <span class="font-medium">Est. Profit</span>
                <div class="text-right">
                  <div class="font-medium text-green-600">
                    {{ formatCurrency(estimatedProfit) }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ profitMargin.toFixed(1) }}% margin
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quick Stats -->
      <Card class="shadow-none border border-muted-background">
        <CardHeader>
          <CardTitle class="text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Status</span>
            <Badge :variant="values.is_active ? 'default' : 'secondary'" class="text-xs">
              {{ values.is_active ? 'Active' : 'Inactive' }}
            </Badge>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Products</span>
            <span class="font-medium">{{ values.service_products?.length || 0 }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Required Products</span>
            <span class="font-medium">
              {{values.service_products?.filter((sp) => sp.is_required).length || 0}}
            </span>
          </div>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <Button type="submit" :disabled="isLoading" class="w-full">
          <Scissors class="h-4 w-4 mr-2" />
          {{ isLoading ? 'Creating...' : 'Create Service' }}
        </Button>
        <Button type="button" variant="outline" @click="handleDiscard" class="w-full">
          Discard Changes
        </Button>
      </div>

      <!-- Tips -->
      <Card class="shadow-none border border-muted-background">
        <CardHeader>
          <CardTitle class="text-base">Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2 text-xs text-muted-foreground">
            <p>• Use clear, descriptive service names</p>
            <p>• Set realistic duration estimates</p>
            <p>• Track product usage for cost analysis</p>
            <p>• Consider profit margins when pricing</p>
            <p>• Mark essential products as required</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </form>
</template>
