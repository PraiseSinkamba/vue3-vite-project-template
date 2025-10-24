<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useBookingStore } from '@/stores/booking'
import { useServiceStore } from '@/stores/services'
import { useAuthStore } from '@/stores/auth'
import { ConditionalContent } from '@/components/ui/conditional'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-vue-next'
import BookingStepIndicator from '@/components/client/booking/BookingStepIndicator.vue'
import BookingSummaryCard from '@/components/client/booking/BookingSummaryCard.vue'
import DateTimeSelector from '@/components/client/booking/DateTimeSelector.vue'
import AuthenticationGateway from '@/components/client/booking/AuthenticationGateway.vue'
import ClientInfoForm from '@/components/client/booking/ClientInfoForm.vue'
import BookingReview from '@/components/client/booking/BookingReview.vue'
import BookingConfirmation from '@/components/client/booking/BookingConfirmation.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const bookingStore = useBookingStore()
const serviceStore = useServiceStore()
const authStore = useAuthStore()

const { currentStep } = storeToRefs(bookingStore)
const { user } = storeToRefs(authStore)

// State
const isSubmitting = ref(false)
const isInitialized = ref(false)
const confirmationData = ref<{
  appointmentNumber: string
  date: Date
  time: string
  serviceName: string
  addonCount: number
  totalPrice: number
  whatsappNumber: string
} | null>(null)

// Initialize from URL params
onMounted(async () => {
  const serviceId = route.query.service as string
  const addonsParam = route.query.addons as string
  const addonIds = addonsParam ? addonsParam.split(',') : []

  if (!serviceId) {
    // No service selected, redirect to home
    router.push('/')
    return
  }

  bookingStore.initializeFromParams(serviceId, addonIds)

  // Initialize default technician
  bookingStore.useDefaultTechnician()

  // Mark as initialized
  isInitialized.value = true

  // Handle OAuth callback - if user just authenticated via Google
  // Wait a moment for auth state to be set by the listener
  await new Promise(resolve => setTimeout(resolve, 500))

  // If user is authenticated and on step 1 or 2, move them to step 3
  if (user.value && currentStep.value <= 2) {
    bookingStore.goToStep(3)
  }
})

// Check if user is authenticated
const isAuthenticated = computed(() => !!user.value)

// Fetch service details
const serviceQuery = serviceStore.fetchServiceDetailById(() => bookingStore.selectedServiceId)

const service = computed(() => serviceQuery.data.value || null)

// Fetch addons
const addonsQuery = serviceStore.fetchAddons()
const allAddons = computed(() => addonsQuery.data.value || [])

// Selected addons
const selectedAddons = computed(() => {
  return allAddons.value.filter((addon) => bookingStore.selectedAddonIds.includes(addon.id))
})

// Can proceed checks
const canProceedToStep2 = computed(() => bookingStore.canProceedToStep2)
const canProceedToStep3 = computed(() => bookingStore.canProceedToStep3)
const canProceedToStep4 = computed(() => bookingStore.canProceedToStep4)

const canProceed = computed(() => {
  if (currentStep.value === 1) return canProceedToStep2.value
  if (currentStep.value === 2) return true // Auth step - can always skip or proceed
  if (currentStep.value === 3) return canProceedToStep4.value
  if (currentStep.value === 4) return canProceedToStep4.value
  return false
})

// Loading state
const isLoading = computed(() => {
  // Show loading until initialized and queries have data
  if (!isInitialized.value) return true
  return serviceQuery.isLoading.value || addonsQuery.isLoading.value
})

const hasError = computed(() => {
  return serviceQuery.status.value === 'error' || addonsQuery.status.value === 'error'
})

// Navigation
const goBack = () => {
  if (currentStep.value > 1) {
    bookingStore.goToStep(currentStep.value - 1)
  } else {
    router.push(`/service/${bookingStore.selectedServiceId}`)
  }
}

const goNext = () => {
  // Step 1 → Step 2 (Auth Gateway)
  if (currentStep.value === 1) {
    // If already authenticated, skip step 2 and go to step 3
    if (isAuthenticated.value) {
      bookingStore.goToStep(3)
    } else {
      bookingStore.goToStep(2)
    }
  }
  // Step 2 → Step 3 (handled by auth gateway events)
  // Step 3 → Step 4
  else if (currentStep.value === 3) {
    bookingStore.goToStep(4)
  }
  // Step 4 → Submit
  else if (currentStep.value < 5) {
    bookingStore.goToStep(currentStep.value + 1)
  }
}

// Handle authentication success - move to client info
const handleAuthenticated = () => {
  bookingStore.goToStep(3)
}

// Handle skip authentication - move to client info
const handleSkipAuth = () => {
  bookingStore.skipAuthFlow()
  bookingStore.goToStep(3)
}

// Handle client info form submission
const handleClientInfoSubmit = () => {
  goNext()
}

// Submit booking
const submitBooking = async () => {
  if (!service.value || !canProceedToStep4.value) return

  isSubmitting.value = true

  try {
    const appointmentNumber = await bookingStore.createBooking(service.value, selectedAddons.value)

    // Prepare confirmation data
    confirmationData.value = {
      appointmentNumber,
      date: bookingStore.selectedDate!,
      time: bookingStore.selectedTime!,
      serviceName:
        service.value.name_tr && t('locale') === 'tr' ? service.value.name_tr : service.value.name,
      addonCount: selectedAddons.value.length,
      totalPrice: bookingStore.totalPrice(service.value, selectedAddons.value),
      whatsappNumber: bookingStore.clientInfo.client_whatsapp,
    }

    // Move to step 5 (confirmation)
    bookingStore.goToStep(5)
  } catch (error) {
    console.error('Error creating booking:', error)
    alert(t('booking.error.submitFailed'))
  } finally {
    isSubmitting.value = false
  }
}

// Refresh queries when needed
const refreshData = () => {
  serviceQuery.refresh()
  addonsQuery.refresh()
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <ConditionalContent :is-loading="isLoading" :has-error="hasError"
      :error="hasError ? (serviceQuery?.error ?? addonsQuery.error) : undefined" :retry="refreshData"
      :is-empty="!service" :empty-title="t('booking.error.serviceNotFound')"
      :empty-message="t('booking.error.serviceNotFoundMessage')" empty-icon="search">
      <div v-if="service && currentStep !== 5" class="pb-20">
        <!-- Header -->
        <div class="bg-card border-b">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" @click="goBack">
                <ArrowLeft class="w-4 h-4 mr-2" />
                {{ t('booking.back') }}
              </Button>
            </div>

            <h1 class="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              {{ t('booking.title') }}
            </h1>
            <p class="text-muted-foreground">
              {{ t('booking.subtitle') }}
            </p>
          </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Step Indicator (only show for steps 1-4) -->
          <BookingStepIndicator v-if="currentStep <= 4" :current-step="currentStep" />

          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Steps Content (2/3) -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Step 1: Date & Time Selection -->
              <div v-if="currentStep === 1">
                <h2 class="font-serif text-2xl font-semibold text-foreground mb-6">
                  {{ t('booking.step1.title') }}
                </h2>
                <DateTimeSelector :service="service" :addons="selectedAddons" />
              </div>

              <!-- Step 2: Authentication Gateway -->
              <div v-if="currentStep === 2">
                <AuthenticationGateway @authenticated="handleAuthenticated" @skip="handleSkipAuth" />
              </div>

              <!-- Step 3: Client Information -->
              <div v-if="currentStep === 3">
                <h2 class="font-serif text-2xl font-semibold text-foreground mb-6">
                  {{ t('booking.step3.title') }}
                </h2>
                <ClientInfoForm @submit="handleClientInfoSubmit" />
              </div>

              <!-- Step 4: Review & Confirm -->
              <div v-if="currentStep === 4">
                <h2 class="font-serif text-2xl font-semibold text-foreground mb-6">
                  {{ t('booking.step4.title') }}
                </h2>
                <BookingReview :service="service" :addons="selectedAddons" />
              </div>

              <!-- Navigation Buttons (Desktop - Bottom of Content) -->
              <div class="hidden lg:flex justify-between items-center pt-6 border-t" v-if="currentStep !== 2">
                <Button variant="outline" @click="goBack" v-if="currentStep > 1">
                  <ArrowLeft class="w-4 h-4 mr-2" />
                  {{ t('booking.previous') }}
                </Button>

                <div class="flex-1" v-if="currentStep === 1"></div>

                <Button v-if="currentStep < 4" :disabled="!canProceed" @click="goNext">
                  {{ t('booking.continue') }}
                  <ArrowRight class="w-4 h-4 ml-2" />
                </Button>

                <Button v-if="currentStep === 4" :disabled="!canProceed || isSubmitting" @click="submitBooking">
                  <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
                  {{ t('booking.confirmBooking') }}
                </Button>
              </div>
            </div>

            <!-- Right Column: Summary Card (1/3) - Sticky on Desktop -->
            <div class="lg:col-span-1" v-if="currentStep !== 2">
              <BookingSummaryCard :service="service" :addons="selectedAddons" :current-step="currentStep"
                :can-proceed="canProceed" @continue="currentStep === 4 ? submitBooking() : goNext()" />
            </div>
          </div>
        </div>

        <!-- Mobile Bottom Navigation -->
        <div class="fixed bottom-0 left-0 right-0 bg-card border-t p-4 lg:hidden z-20" v-if="currentStep !== 2">
          <div class="flex gap-3">
            <Button variant="outline" @click="goBack" v-if="currentStep > 1" class="flex-1">
              <ArrowLeft class="w-4 h-4 mr-2" />
              {{ t('booking.back') }}
            </Button>

            <Button v-if="currentStep < 4" :disabled="!canProceed" @click="goNext" class="flex-1">
              {{ t('booking.continue') }}
              <ArrowRight class="w-4 h-4 ml-2" />
            </Button>

            <Button v-if="currentStep === 4" :disabled="!canProceed || isSubmitting" @click="submitBooking"
              class="flex-1">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              {{ t('booking.confirm') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Step 5: Confirmation -->
      <div v-if="confirmationData && currentStep === 5" class="py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingConfirmation :appointment-number="confirmationData.appointmentNumber" :date="confirmationData.date"
            :time="confirmationData.time" :service-name="confirmationData.serviceName"
            :addon-count="confirmationData.addonCount" :total-price="confirmationData.totalPrice"
            :whatsapp-number="confirmationData.whatsappNumber" />
        </div>
      </div>
    </ConditionalContent>
  </div>
</template>
