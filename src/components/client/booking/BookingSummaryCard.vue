<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useBookingStore } from '@/stores/booking'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Check } from 'lucide-vue-next'
import { format } from 'date-fns'
import type { Service, AddOn } from '@/types'

interface Props {
  service: Service | null
  addons: AddOn[]
  currentStep: number
  canProceed: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  continue: []
}>()

const { t, locale } = useI18n()
const bookingStore = useBookingStore()
const { selectedDate, selectedTime } = storeToRefs(bookingStore)

// Calculate totals
const totalDuration = computed(() => {
  if (!props.service) return 0
  return bookingStore.totalDuration(props.service, props.addons)
})

const totalPrice = computed(() => {
  if (!props.service) return 0
  return bookingStore.totalPrice(props.service, props.addons)
})

// Format price
const formattedPrice = computed(() => {
  return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: 'TRY',
  }).format(totalPrice.value)
})

// Get service name
const serviceName = computed(() => {
  if (!props.service) return ''
  return locale.value === 'tr' && props.service.name_tr
    ? props.service.name_tr
    : props.service.name
})

// Get addon name
const getAddonName = (addon: AddOn) => {
  return locale.value === 'tr' && addon.name_tr ? addon.name_tr : addon.name
}

// Format duration
const formattedDuration = computed(() => {
  const hours = Math.floor(totalDuration.value / 60)
  const minutes = totalDuration.value % 60

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${minutes}min`
  }
})

// Format selected date/time
const formattedDateTime = computed(() => {
  if (!selectedDate.value || !selectedTime.value) return null

  const dateStr = format(selectedDate.value, 'MMM d, yyyy')
  const [hours, minutes] = selectedTime.value.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes)

  const timeStr = new Intl.DateTimeFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale.value !== 'tr',
  }).format(date)

  return { date: dateStr, time: timeStr }
})

// Format addon price
const formatAddonPrice = (addon: AddOn) => {
  return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: 'TRY',
  }).format(addon.price || 0)
}

// Step labels
const steps = computed(() => [
  {
    number: 1,
    label: t('booking.step1.title'),
    completed: props.currentStep > 1,
  },
  {
    number: 2,
    label: t('booking.step2.title'),
    completed: props.currentStep > 2,
  },
  {
    number: 3,
    label: t('booking.step3.title'),
    completed: false,
  },
])
</script>

<template>
  <div class="bg-card border rounded-lg p-6 sticky top-6">
    <h3 class="font-serif text-xl font-semibold text-foreground mb-6">
      {{ t('booking.yourBooking') }}
    </h3>

    <!-- Service Info -->
    <div v-if="service" class="space-y-4 mb-6">
      <div>
        <div class="text-sm text-muted-foreground mb-1">{{ t('booking.service') }}</div>
        <div class="font-medium text-foreground">{{ serviceName }}</div>
        <div class="text-sm text-muted-foreground">
          {{ formattedDuration }} • {{ formattedPrice }}
        </div>
      </div>

      <!-- Addons -->
      <div v-if="addons.length > 0" class="border-t pt-4">
        <div class="text-sm font-medium text-muted-foreground mb-2">
          {{ t('booking.addonsSelected', { count: addons.length }) }}
        </div>
        <div class="space-y-2">
          <div v-for="addon in addons" :key="addon.id" class="flex justify-between text-sm">
            <span class="text-foreground">{{ getAddonName(addon) }}</span>
            <span class="text-muted-foreground">{{ formatAddonPrice(addon) }}</span>
          </div>
        </div>
      </div>

      <!-- Selected Date/Time -->
      <div v-if="formattedDateTime" class="border-t pt-4 space-y-2">
        <div class="flex items-center gap-2 text-sm">
          <Calendar class="w-4 h-4 text-muted-foreground" />
          <span class="text-foreground">{{ formattedDateTime.date }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <Clock class="w-4 h-4 text-muted-foreground" />
          <span class="text-foreground">{{ formattedDateTime.time }}</span>
        </div>
      </div>

      <!-- Total -->
      <div class="border-t pt-4">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-foreground">{{ t('booking.total') }}</span>
          <span class="font-serif font-bold text-primary text-xl">{{ formattedPrice }}</span>
        </div>
      </div>
    </div>

    <!-- Progress Steps -->
    <div class="mb-6">
      <div class="space-y-3">
        <div
          v-for="step in steps"
          :key="step.number"
          class="flex items-center gap-3"
          :class="{
            'opacity-50': step.number > currentStep && !step.completed,
          }"
        >
          <div
            class="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
            :class="{
              'bg-primary text-primary-foreground': step.number === currentStep || step.completed,
              'bg-muted text-muted-foreground': step.number > currentStep && !step.completed,
            }"
          >
            <Check v-if="step.completed" class="w-4 h-4" />
            <span v-else class="text-xs font-bold">{{ step.number }}</span>
          </div>
          <span
            class="text-sm"
            :class="{
              'font-medium text-foreground': step.number === currentStep,
              'text-muted-foreground': step.number !== currentStep,
            }"
          >
            {{ step.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Continue Button -->
    <Button
      size="lg"
      class="w-full"
      :disabled="!canProceed"
      @click="emit('continue')"
    >
      {{
        currentStep === 3
          ? t('booking.confirmBooking')
          : t('booking.continueToNextStep')
      }}
    </Button>

    <p v-if="currentStep === 3" class="text-xs text-center text-muted-foreground mt-3">
      {{ t('booking.reviewBeforeConfirm') }}
    </p>
  </div>
</template>
