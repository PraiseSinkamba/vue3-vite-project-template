<script setup lang="ts">
import { ref, computed } from 'vue'
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
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Plus,
  Trash2,
  Package,
  Info,
  Settings,
  ChevronDown,
  ChevronRight,
  Edit,
  Loader2,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useInventoryStore } from '@/stores/inventory'
import { useMutation } from '@pinia/colada'
import { useRouter } from 'vue-router'
import type { Product, ProductInsert, VariantInsert } from '@/types'

const router = useRouter()
const inventoryStore = useInventoryStore()

const props = defineProps<{
  product?: Product
  category?: string
}>()

// Fetch categories for the select
inventoryStore.fetchProducts()

const showOptionalFields = ref(false)
const expandedVariants = ref<Set<number>>(new Set([0])) // First variant expanded by default
const showVariantDetails = ref<Record<number, boolean>>({})

const productTypes = [
  { value: 'polygel', label: 'Polygel' },
  { value: 'gel_polish', label: 'Gel Polish' },
  { value: 'chrome', label: 'Chrome' },
  { value: 'decoration', label: 'Decoration' },
]

const unitTypes = [
  { value: 'piece', label: 'Piece' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'gram', label: 'Gram' },
  { value: 'ml', label: 'Milliliter' },
  { value: 'set', label: 'Set' },
]

const stockLevels = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

// Form schema with variants
const variantSchema = z.object({
  id: z.string().optional(),
  variant_name: z.string().min(1, 'Variant name is required'),
  variant_name_tr: z.string().optional(),
  sku: z.string().optional(),
  current_quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater').optional(),
  reorder_point: z.coerce.number().min(0, 'Reorder point must be 0 or greater').optional(),
  cost_price: z.coerce.number().min(0, 'Cost price must be 0 or greater').optional(),
  stock_level: z.enum(['in_stock', 'low', 'out_of_stock']).optional(),
})

const formSchema = toTypedSchema(
  z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Product name must be at least 2 characters').max(100),
    name_tr: z.string().optional(),
    description: z.string().optional(),
    brand: z.string().optional(),
    category_id: z.string().min(1, 'Please select a category'),
    product_type: z.enum(['polygel', 'gel_polish', 'chrome', 'decoration']),
    track_usage: z.boolean().default(false),
    track_quantity: z.boolean().default(false),
    unit_type: z.enum(['piece', 'bottle', 'gram', 'ml', 'set']).optional(),
    variants: z.array(variantSchema).min(1, 'At least one variant is required'),
  }),
)

const { handleSubmit, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    id: props.product?.id,
    name: props.product?.name || '',
    name_tr: props.product?.name_tr || '',
    description: props.product?.description || '',
    brand: props.product?.brand || '',
    category_id: props.product?.category_id || props.category || '',
    product_type: props.product?.product_type || 'gel_polish',
    track_usage: props.product?.track_usage || false,
    track_quantity: props.product?.track_quantity || false,
    unit_type: props.product?.unit_type || 'bottle',
    variants: props.product?.variants?.map((variant) => ({
      ...variant,
      sku: variant.sku || '',
      id: variant.id || null,
      variant_name_tr: variant.variant_name_tr || '',
    })) || [
      {
        variant_name: 'Default',
        variant_name_tr: '',
        sku: '',
        current_quantity: 0,
        reorder_point: 5,
        cost_price: 0,
        stock_level: 'in_stock',
      },
    ],
  },
})

// Track quantity dependency
const shouldShowQuantityFields = computed(() => values.track_quantity)

// Create product mutation
const { mutate: createProduct, isLoading } = useMutation({
  mutation: async (formData: typeof values) => {
    const { variants, ...productData } = formData

    // Insert product first
    const { data: product, error } = await inventoryStore.createOrUpadateProduct({
      id: productData.id || null,
      name: productData.name,
      name_tr: productData.name_tr || null,
      description: productData.description || null,
      brand: productData.brand || null,
      category_id: productData.category_id,
      product_type: productData.product_type,
      track_usage: productData.track_usage || false,
      track_quantity: productData.track_quantity || false,
      unit_type: productData.unit_type || null,
    } as ProductInsert)

    if (error || !product) throw new Error('Failed to create product')

    // Insert variants
    if (variants && variants.length > 0) {
      const variantsToInsert: VariantInsert[] = variants.map((variant) => ({
        id: variant.id || null,
        product_id: product.id,
        variant_name: variant.variant_name,
        variant_name_tr: variant.variant_name_tr || null,
        sku: variant.sku || null,
        current_quantity: variant.current_quantity || null,
        reorder_point: variant.reorder_point || null,
        cost_price: variant.cost_price || null,
        stock_level: variant.stock_level || null,
      }))

      await inventoryStore.createOrUpdateVariants(variantsToInsert)
    }

    return product
  },
  onSuccess: (data) => {
    toast.success(`Product "${data.name}" created successfully.`)
    router.push('/admin/inventory')
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to create product. Please try again.')
  },
})

const onSubmit = handleSubmit((formValues) => {
  createProduct(formValues)
})

const handleDiscard = () => {
  router.push('/admin/inventory')
}

// Variant management
const addVariant = () => {
  const currentVariants = values.variants || []
  const newIndex = currentVariants.length
  setFieldValue('variants', [
    ...currentVariants,
    {
      variant_name: '',
      variant_name_tr: '',
      sku: '',
      current_quantity: 0,
      reorder_point: 5,
      cost_price: 0,
      stock_level: 'in_stock',
    },
  ])
  // Add the new variant to expanded set without clearing others
  const newSet = new Set(expandedVariants.value)
  newSet.add(newIndex)
  expandedVariants.value = newSet
}

const setExpandedVariant = (index: number, open?: boolean) => {
  if (open === undefined) {
    open = !expandedVariants.value.has(index)
  }

  if (open) {
    // Instead of creating new Set with only this index, add to existing
    const newSet = new Set(expandedVariants.value)
    newSet.add(index)
    expandedVariants.value = newSet
  } else {
    // Create a new Set without this index
    const newSet = new Set(expandedVariants.value)
    newSet.delete(index)
    expandedVariants.value = newSet
  }
}

const removeVariant = (index: number) => {
  const currentVariants = values.variants || []
  if (currentVariants.length > 1) {
    setFieldValue(
      'variants',
      currentVariants.filter((_, i) => i !== index),
    )
    expandedVariants.value.clear()
  }
}

const toggleVariantDetails = (index: number) => {
  showVariantDetails.value[index] = !showVariantDetails.value[index]
}

const getStockLevelVariant = (level: string) => {
  switch (level) {
    case 'in_stock':
      return 'default'
    case 'low':
      return 'secondary'
    case 'out_of_stock':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getStockLevelDot = (level: string) => {
  switch (level) {
    case 'in_stock':
      return 'bg-green-500'
    case 'low':
      return 'bg-yellow-500'
    case 'out_of_stock':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getStockLevelLabel = (level: string) => {
  switch (level) {
    case 'in_stock':
      return 'In Stock'
    case 'low':
      return 'Low'
    case 'out_of_stock':
      return 'Out'
    default:
      return level
  }
}

const isVariantComplete = (variant: any) => {
  return variant?.variant_name && variant?.variant_name.trim().length > 0
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Main Content -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Information -->
      <div class="border rounded-lg overflow-hidden bg-card">
        <div class="px-6 py-4 border-b bg-muted/50">
          <h2 class="text-sm font-medium flex items-center gap-2">
            <Info class="h-4 w-4 text-primary" />
            Product Information
          </h2>
        </div>
        <div class="p-6 space-y-6">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="grid grid-cols-2 gap-6">
            <FormField v-slot="{ componentField }" name="category_id">
              <FormItem>
                <FormLabel>Product Category</FormLabel>
                <Select class="w-full" v-bind="componentField">
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue class="w-full" placeholder="Select Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      v-for="category in inventoryStore.categories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="product_type">
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select class="w-full" v-bind="componentField">
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue class="w-full" placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="type in productTypes" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <!-- Optional Fields Toggle -->
          <div class="pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="showOptionalFields = !showOptionalFields"
              class="text-primary"
            >
              <Plus class="h-4 w-4 mr-2" />
              {{ showOptionalFields ? 'Hide' : 'Add' }} Optional Information
            </Button>

            <div v-if="showOptionalFields" class="mt-4 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <FormField v-slot="{ componentField }" name="brand">
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Brand name" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="name_tr">
                  <FormItem>
                    <FormLabel>Turkish Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Türkçe ürün adı" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <FormField v-slot="{ componentField }" name="description">
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description..."
                      rows="3"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>
        </div>
      </div>

      <!-- Management Settings -->
      <div class="border rounded-lg overflow-hidden bg-card">
        <div class="px-6 py-4 border-b bg-muted/50">
          <h2 class="text-sm font-medium flex items-center gap-2">
            <Settings class="h-4 w-4 text-primary" />
            Management Settings
          </h2>
        </div>
        <div class="p-6 space-y-6">
          <!-- Tracking Options -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField v-slot="{ value, handleChange }" name="track_usage">
              <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
                <div class="space-y-0.5">
                  <FormLabel class="text-sm font-medium">Track Usage</FormLabel>
                  <FormDescription class="text-xs">
                    Monitor this product in service records
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch :modelValue="value" @update:modelValue="handleChange" />
                </FormControl>
              </FormItem>
            </FormField>

            <FormField v-slot="{ value, handleChange }" name="track_quantity">
              <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
                <div class="space-y-0.5">
                  <FormLabel class="text-sm font-medium">Track Quantity</FormLabel>
                  <FormDescription class="text-xs">
                    Monitor stock levels and quantities
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch :modelValue="value" @update:modelValue="handleChange" />
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <!-- Unit Type (only show when quantity tracking is enabled) -->
          <div v-if="shouldShowQuantityFields">
            <FormField v-slot="{ componentField }" name="unit_type">
              <FormItem class="max-w-xs">
                <FormLabel>Unit Type</FormLabel>
                <Select class="w-full" v-bind="componentField">
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue class="w-full" placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="unit in unitTypes" :key="unit.value" :value="unit.value">
                      {{ unit.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </div>
      </div>

      <!-- Variants -->
      <div class="border rounded-lg overflow-hidden bg-card">
        <div class="px-6 py-4 border-b bg-muted/50">
          <h2 class="text-sm font-medium flex items-center gap-2">
            <Package class="h-4 w-4 text-primary" />
            Product Variants
          </h2>
        </div>
        <div class="p-6">
          <FieldArray name="variants" v-slot="{ fields }">
            <div class="space-y-4">
              <div
                v-for="(field, index) in fields"
                :key="field.key"
                class="border rounded-lg overflow-hidden"
              >
                <Collapsible
                  :open="expandedVariants.has(index)"
                  @update:open="(open) => setExpandedVariant(index, open)"
                >
                  <CollapsibleTrigger class="w-full">
                    <div
                      class="flex items-center justify-between p-4 hover:bg-muted/30 transition-all duration-200 group"
                    >
                      <!-- Left side - Expand/Collapse indicator and main info -->
                      <div class="flex items-center gap-4 flex-1 min-w-0">
                        <!-- Expand/Collapse Icon -->
                        <div class="flex-shrink-0">
                          <component
                            :is="expandedVariants.has(index) ? ChevronDown : ChevronRight"
                            class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground"
                          />
                        </div>

                        <!-- Main Content Area -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-3 flex-wrap">
                            <!-- Variant Name -->
                            <div
                              v-if="values?.variants?.[index]?.variant_name"
                              class="flex items-center gap-2"
                            >
                              <div class="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                              <span class="text-sm font-medium text-foreground truncate">
                                {{ values.variants[index].variant_name }}
                              </span>
                            </div>

                            <!-- Empty state -->
                            <div v-else class="flex items-center gap-2">
                              <div
                                class="w-2 h-2 rounded-full bg-muted-foreground/40 flex-shrink-0"
                              ></div>
                              <span class="text-sm text-muted-foreground italic">
                                Unnamed variant
                              </span>
                            </div>

                            <!-- Summary Pills -->
                            <div class="flex items-center gap-2 flex-wrap">
                              <!-- SKU -->
                              <div
                                v-if="values?.variants?.[index]?.sku"
                                class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs"
                              >
                                <span class="text-muted-foreground">SKU:</span>
                                <span class="font-mono text-foreground">{{
                                  values.variants[index].sku
                                }}</span>
                              </div>

                              <!-- Quantity (only if tracking is enabled) -->
                              <div
                                v-if="
                                  shouldShowQuantityFields &&
                                  values?.variants?.[index]?.current_quantity !== undefined
                                "
                                class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-xs"
                              >
                                <span class="text-blue-600 dark:text-blue-400">Qty:</span>
                                <span class="font-medium text-blue-700 dark:text-blue-300">
                                  {{ values.variants[index].current_quantity }}
                                </span>
                              </div>

                              <!-- Stock Level -->
                              <div
                                v-if="values?.variants?.[index]?.stock_level"
                                class="inline-flex items-center"
                              >
                                <Badge
                                  :variant="
                                    getStockLevelVariant(values.variants[index].stock_level)
                                  "
                                  class="text-xs h-5"
                                >
                                  <div
                                    :class="getStockLevelDot(values.variants[index].stock_level)"
                                    class="w-1.5 h-1.5 rounded-full mr-1.5"
                                  ></div>
                                  {{ getStockLevelLabel(values.variants[index].stock_level) }}
                                </Badge>
                              </div>

                              <!-- Cost Price -->
                              <div
                                v-if="values?.variants?.[index]?.cost_price > 0"
                                class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-xs"
                              >
                                <span class="text-green-600 dark:text-green-400">Cost:</span>
                                <span class="font-medium text-green-700 dark:text-green-300">
                                  ${{ Number(values.variants[index].cost_price).toFixed(2) }}
                                </span>
                              </div>
                            </div>
                          </div>

                          <!-- Secondary line for Turkish name if exists -->
                          <div v-if="values?.variants?.[index]?.variant_name_tr" class="mt-1">
                            <span class="text-xs text-muted-foreground">
                              {{ values.variants[index].variant_name_tr }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Right side - Actions -->
                      <div class="flex items-center gap-2 flex-shrink-0 ml-4">
                        <!-- Status indicator -->
                        <div class="flex items-center gap-1">
                          <div
                            v-if="isVariantComplete(values.variants[index])"
                            class="w-2 h-2 rounded-full bg-green-500"
                            title="Variant complete"
                          ></div>
                          <div
                            v-else
                            class="w-2 h-2 rounded-full bg-yellow-500"
                            title="Variant needs attention"
                          ></div>
                        </div>

                        <!-- Delete button -->
                        <Button
                          v-if="(values.variants?.length || 0) > 1"
                          type="button"
                          variant="ghost"
                          size="sm"
                          @click.stop="removeVariant(index)"
                          class="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <Trash2 class="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <div
                    v-show="expandedVariants.has(index)"
                    class="border-t p-4 space-y-4"
                    style="transition: all 0.2s ease"
                  >
                    <!-- Basic variant info -->
                    <div class="grid grid-cols-2 gap-4">
                      <FormField
                        v-slot="{ componentField }"
                        :name="`variants.${index}.variant_name`"
                      >
                        <FormItem>
                          <FormLabel>Variant Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Pink, Size M" v-bind="componentField" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField
                        v-slot="{ componentField }"
                        :name="`variants.${index}.variant_name_tr`"
                      >
                        <FormItem>
                          <FormLabel>Turkish Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Türkçe varyant adı" v-bind="componentField" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>

                    <!-- Additional variant details -->
                    <div class="pt-4 border-t">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="toggleVariantDetails(index)"
                        class="text-primary"
                      >
                        <Edit class="h-4 w-4 mr-2" />
                        {{ showVariantDetails[index] ? 'Hide' : 'Add' }} Additional Details
                      </Button>

                      <div v-show="showVariantDetails[index]" class="mt-4 space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField v-slot="{ componentField }" :name="`variants.${index}.sku`">
                            <FormItem>
                              <FormLabel>SKU</FormLabel>
                              <FormControl>
                                <Input placeholder="Product code" v-bind="componentField" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </FormField>

                          <FormField
                            v-slot="{ componentField }"
                            :name="`variants.${index}.stock_level`"
                          >
                            <FormItem>
                              <FormLabel>Stock Level</FormLabel>
                              <Select class="w-full" v-bind="componentField">
                                <FormControl>
                                  <SelectTrigger class="w-full">
                                    <SelectValue class="w-full" placeholder="Select level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem
                                    v-for="level in stockLevels"
                                    :key="level.value"
                                    :value="level.value"
                                  >
                                    {{ level.label }}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          </FormField>
                        </div>

                        <!-- Quantity fields (only show when quantity tracking is enabled) -->
                        <div
                          v-if="shouldShowQuantityFields"
                          class="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <FormField
                            v-slot="{ componentField }"
                            :name="`variants.${index}.current_quantity`"
                          >
                            <FormItem>
                              <FormLabel>Current Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  v-bind="componentField"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </FormField>

                          <FormField
                            v-slot="{ componentField }"
                            :name="`variants.${index}.reorder_point`"
                          >
                            <FormItem>
                              <FormLabel>Reorder Point</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="5"
                                  v-bind="componentField"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </FormField>

                          <FormField
                            v-slot="{ componentField }"
                            :name="`variants.${index}.cost_price`"
                          >
                            <FormItem>
                              <FormLabel>Cost Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  v-bind="componentField"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </FormField>
                        </div>
                      </div>
                    </div>
                  </div>
                </Collapsible>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="addVariant"
                class="w-full border-dashed"
              >
                <Plus class="h-4 w-4 mr-2" />
                Add Another Variant
              </Button>
            </div>
          </FieldArray>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Quick Stats -->
      <div class="border rounded-lg overflow-hidden bg-card">
        <div class="px-4 py-3 border-b bg-muted/50">
          <h3 class="text-sm font-medium">Quick Stats</h3>
        </div>
        <div class="p-4 space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Variants</span>
            <span class="font-medium">{{ values.variants?.length || 0 }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Track Usage</span>
            <Badge :variant="values.track_usage ? 'default' : 'secondary'" class="text-xs">
              {{ values.track_usage ? 'Enabled' : 'Disabled' }}
            </Badge>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Track Quantity</span>
            <Badge :variant="values.track_quantity ? 'default' : 'secondary'" class="text-xs">
              {{ values.track_quantity ? 'Enabled' : 'Disabled' }}
            </Badge>
          </div>
        </div>
      </div>

      <Button type="submit" :disabled="isLoading">
        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
        <span v-else>
          {{ product ? 'Update Product' : 'Create Product' }}
        </span>
      </Button>

      <!-- Tips -->
      <div class="border rounded-lg overflow-hidden bg-card">
        <div class="p-4">
          <h3 class="text-sm font-medium mb-3">Tips</h3>
          <div class="space-y-2 text-xs text-muted-foreground">
            <p>• Use clear, descriptive product names</p>
            <p>• Add variants for different colors or sizes</p>
            <p>• Enable quantity tracking for inventory management</p>
            <p>• Set reorder points to avoid stockouts</p>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
