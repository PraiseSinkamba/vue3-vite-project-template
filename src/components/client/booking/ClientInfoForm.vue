<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useBookingStore } from '@/stores/booking'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { User, Phone, Mail, MessageSquare, Upload, X, Image as ImageIcon } from 'lucide-vue-next'

const { t, locale } = useI18n()
const bookingStore = useBookingStore()
const { clientInfo } = storeToRefs(bookingStore)

// Form validation schema
const formSchema = toTypedSchema(
  z.object({
    client_name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(100, { message: 'Name must be less than 100 characters' }),
    client_whatsapp: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, { message: 'Invalid WhatsApp number' })
      .transform((val) => val.replace(/\s/g, '')), // Remove spaces
    client_phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, { message: 'Invalid phone number' })
      .transform((val) => val.replace(/\s/g, '')),
    client_email: z
      .string()
      .email({ message: 'Invalid email address' })
      .optional()
      .or(z.literal('')),
    special_requests: z.string().max(500, { message: 'Requests must be less than 500 characters' }).optional(),
  }),
)

const { handleSubmit, isFieldDirty, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    client_name: clientInfo.value.client_name || '',
    client_whatsapp: clientInfo.value.client_whatsapp || '',
    client_phone: clientInfo.value.client_phone || '',
    client_email: clientInfo.value.client_email || '',
    special_requests: clientInfo.value.special_requests || '',
  },
})

// Image upload state
const imagePreview = ref<string | null>(null)
const imageFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Image upload handling
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert(t('booking.step2.invalidImageType'))
    return
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    alert(t('booking.step2.imageTooLarge'))
    return
  }

  imageFile.value = file
  bookingStore.setInspirationImage(file)

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = null
  bookingStore.setInspirationImage(null)
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// Auto-save form values to store
const saveToStore = () => {
  bookingStore.setClientInfo({
    client_name: values.client_name || '',
    client_whatsapp: values.client_whatsapp || '',
    client_phone: values.client_phone || '',
    client_email: values.client_email || '',
    special_requests: values.special_requests || '',
  })
}

// Emit event when form is valid
const emit = defineEmits<{
  submit: []
}>()

const onSubmit = handleSubmit((formValues) => {
  // Save to store
  bookingStore.setClientInfo({
    client_name: formValues.client_name,
    client_whatsapp: formValues.client_whatsapp,
    client_phone: formValues.client_phone,
    client_email: formValues.client_email || '',
    special_requests: formValues.special_requests || '',
  })

  // Emit submit event
  emit('submit')
})

// Auto-fill phone number from WhatsApp if empty
const autoFillPhone = () => {
  if (!values.client_phone && values.client_whatsapp) {
    setFieldValue('client_phone', values.client_whatsapp)
  }
}
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- Client Information Section -->
    <div class="space-y-4">
      <h3 class="font-serif text-lg font-semibold text-foreground">
        {{ t('booking.step2.yourInformation') }}
      </h3>

      <!-- Full Name -->
      <FormField v-slot="{ componentField }" name="client_name" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>{{ t('booking.step2.fullName') }} *</FormLabel>
          <FormControl>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                :placeholder="t('booking.step2.fullNamePlaceholder')"
                class="pl-10"
                v-bind="componentField"
                @blur="saveToStore"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- WhatsApp Number -->
      <FormField
        v-slot="{ componentField }"
        name="client_whatsapp"
        :validate-on-blur="!isFieldDirty"
      >
        <FormItem>
          <FormLabel>{{ t('booking.step2.whatsapp') }} *</FormLabel>
          <FormControl>
            <div class="relative">
              <MessageSquare class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                :placeholder="locale === 'tr' ? '+90 5XX XXX XX XX' : '+1 XXX XXX XXXX'"
                class="pl-10"
                v-bind="componentField"
                @blur="saveToStore(); autoFillPhone()"
              />
            </div>
          </FormControl>
          <p class="text-xs text-muted-foreground mt-1">
            {{ t('booking.step2.whatsappHelp') }}
          </p>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Phone Number -->
      <FormField v-slot="{ componentField }" name="client_phone" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>{{ t('booking.step2.phone') }} *</FormLabel>
          <FormControl>
            <div class="relative">
              <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                :placeholder="locale === 'tr' ? '+90 5XX XXX XX XX' : '+1 XXX XXX XXXX'"
                class="pl-10"
                v-bind="componentField"
                @blur="saveToStore"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Email (Optional) -->
      <FormField v-slot="{ componentField }" name="client_email" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>{{ t('booking.step2.email') }} ({{ t('booking.step2.optional') }})</FormLabel>
          <FormControl>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                :placeholder="t('booking.step2.emailPlaceholder')"
                class="pl-10"
                v-bind="componentField"
                @blur="saveToStore"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- Inspiration Image Section -->
    <div class="space-y-4 pt-4 border-t">
      <h3 class="font-serif text-lg font-semibold text-foreground">
        {{ t('booking.step2.designInspiration') }}
      </h3>

      <div class="space-y-3">
        <p class="text-sm text-muted-foreground">
          {{ t('booking.step2.inspirationHelp') }}
        </p>

        <!-- Image Upload Area -->
        <div
          v-if="!imagePreview"
          class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
          @click="triggerFileInput"
        >
          <Upload class="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p class="text-sm font-medium text-foreground mb-1">
            {{ t('booking.step2.uploadImage') }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ t('booking.step2.imageTypes') }}
          </p>
        </div>

        <!-- Image Preview -->
        <div v-else class="relative border rounded-lg overflow-hidden">
          <img :src="imagePreview" alt="Inspiration" class="w-full h-64 object-cover" />
          <Button
            variant="destructive"
            size="sm"
            class="absolute top-2 right-2"
            @click="removeImage"
            type="button"
          >
            <X class="w-4 h-4 mr-1" />
            {{ t('booking.step2.remove') }}
          </Button>
        </div>

        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageUpload"
        />
      </div>
    </div>

    <!-- Special Requests Section -->
    <div class="space-y-4 pt-4 border-t">
      <FormField
        v-slot="{ componentField }"
        name="special_requests"
        :validate-on-blur="!isFieldDirty"
      >
        <FormItem>
          <FormLabel>
            {{ t('booking.step2.specialRequests') }} ({{ t('booking.step2.optional') }})
          </FormLabel>
          <FormControl>
            <Textarea
              :placeholder="t('booking.step2.specialRequestsPlaceholder')"
              rows="4"
              v-bind="componentField"
              @blur="saveToStore"
            />
          </FormControl>
          <p class="text-xs text-muted-foreground mt-1">
            {{ values.special_requests?.length || 0 }} / 500
          </p>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- Hidden submit button (form will be submitted by parent) -->
    <button type="submit" class="hidden">Submit</button>
  </form>
</template>
