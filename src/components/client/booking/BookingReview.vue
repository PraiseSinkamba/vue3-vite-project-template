<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useBookingStore } from '@/stores/booking'
import { format } from 'date-fns'
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Image as ImageIcon, AlertCircle } from 'lucide-vue-next'
import type { Service, AddOn } from '@/types'

interface Props {
  service: Service
  addons: AddOn[]
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const bookingStore = useBookingStore()
const { selectedDate, selectedTime, clientInfo, inspirationImage } = storeToRefs(bookingStore)

// Calculate totals
const totalDuration = computed(() => {
  return bookingStore.totalDuration(props.service, props.addons)
})

const totalPrice = computed(() => {
  return bookingStore.totalPrice(props.service, props.addons)
})

// Format date for display
const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  return format(selectedDate.value, 'EEEE, MMMM d, yyyy', {
    locale: locale.value === 'tr' ? undefined : undefined, // date-fns locale would go here
  })
})

// Format time for display
const formattedTime = computed(() => {
  if (!selectedTime.value) return ''
  const [hours, minutes] = selectedTime.value.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes)

  const endDate = new Date(date)
  endDate.setMinutes(endDate.getMinutes() + totalDuration.value)

  const formatter = new Intl.DateTimeFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale.value !== 'tr',
  })

  return `${formatter.format(date)} - ${formatter.format(endDate)}`
})

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: 'TRY',
  }).format(price)
}

// Get service name
const serviceName = computed(() => {
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
</script>

<template>
  <div class="space-y-6">
    <!-- Important Notice -->
    <div class="bg-primary/10 border border-primary/20 rounded-lg p-4">
      <div class="flex gap-3">
        <AlertCircle class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div class="space-y-1">
          <h4 class="font-semibold text-foreground">
            {{ t('booking.step3.importantNotice') }}
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ t('booking.step3.pendingMessage') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Service Details -->
    <div class="bg-card border rounded-lg p-6">
      <h3 class="font-serif text-lg font-semibold text-foreground mb-4">
        {{ t('booking.step3.serviceDetails') }}
      </h3>

      <div class="space-y-3">
        <!-- Main Service -->
        <div class="flex justify-between items-start">
          <div>
            <div class="font-medium text-foreground">{{ serviceName }}</div>
            <div class="text-sm text-muted-foreground">
              {{ t('booking.baseService') }}
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold text-foreground">{{ formatPrice(service.base_price) }}</div>
            <div class="text-sm text-muted-foreground">
              {{ Math.floor(service.duration_minutes / 60) }}h
              {{ service.duration_minutes % 60 > 0 ? `${service.duration_minutes % 60}min` : '' }}
            </div>
          </div>
        </div>

        <!-- Addons -->
        <div v-if="addons.length > 0" class="border-t pt-3 mt-3">
          <div v-for="addon in addons" :key="addon.id" class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium text-foreground">{{ getAddonName(addon) }}</div>
              <div class="text-sm text-muted-foreground">{{ t('booking.addon') }}</div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-foreground">{{ formatPrice(addon.price || 0) }}</div>
              <div v-if="addon.additional_time_minutes" class="text-sm text-muted-foreground">
                +{{ addon.additional_time_minutes }}min
              </div>
            </div>
          </div>
        </div>

        <!-- Total -->
        <div class="border-t pt-3 mt-3">
          <div class="flex justify-between items-center">
            <div class="font-serif font-bold text-foreground text-lg">
              {{ t('booking.total') }}
            </div>
            <div class="text-right">
              <div class="font-serif font-bold text-primary text-xl">
                {{ formatPrice(totalPrice) }}
              </div>
              <div class="text-sm text-muted-foreground">{{ formattedDuration }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Details -->
    <div class="bg-card border rounded-lg p-6">
      <h3 class="font-serif text-lg font-semibold text-foreground mb-4">
        {{ t('booking.step3.appointmentDetails') }}
      </h3>

      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <Calendar class="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div>
            <div class="text-sm text-muted-foreground">{{ t('booking.date') }}</div>
            <div class="font-medium text-foreground">{{ formattedDate }}</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <Clock class="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div>
            <div class="text-sm text-muted-foreground">{{ t('booking.time') }}</div>
            <div class="font-medium text-foreground">{{ formattedTime }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Client Information -->
    <div class="bg-card border rounded-lg p-6">
      <h3 class="font-serif text-lg font-semibold text-foreground mb-4">
        {{ t('booking.step3.yourInformation') }}
      </h3>

      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <User class="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div>
            <div class="text-sm text-muted-foreground">{{ t('booking.step2.fullName') }}</div>
            <div class="font-medium text-foreground">{{ clientInfo.client_name }}</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <MessageSquare class="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div>
            <div class="text-sm text-muted-foreground">{{ t('booking.step2.whatsapp') }}</div>
            <div class="font-medium text-foreground">{{ clientInfo.client_whatsapp }}</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <Phone class="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div>
            <div class="text-sm text-muted-foreground">{{ t('booking.step2.phone') }}</div>
            <div class="font-medium text-foreground">{{ clientInfo.client_phone }}</div>
          </div>
        </div>

        <div v-if="clientInfo.client_email" class="flex items-center gap-3">
          <Mail class="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div>
            <div class="text-sm text-muted-foreground">{{ t('booking.step2.email') }}</div>
            <div class="font-medium text-foreground">{{ clientInfo.client_email }}</div>
          </div>
        </div>

        <!-- Inspiration Image -->
        <div v-if="inspirationImage" class="flex items-start gap-3 pt-3 border-t">
          <ImageIcon class="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
          <div class="flex-1">
            <div class="text-sm text-muted-foreground mb-2">
              {{ t('booking.step2.designInspiration') }}
            </div>
            <div class="text-sm font-medium text-foreground">
              {{ inspirationImage.name }}
              <span class="text-muted-foreground ml-2">
                ({{ (inspirationImage.size / 1024 / 1024).toFixed(2) }}MB)
              </span>
            </div>
          </div>
        </div>

        <!-- Special Requests -->
        <div v-if="clientInfo.special_requests" class="pt-3 border-t">
          <div class="text-sm text-muted-foreground mb-2">
            {{ t('booking.step2.specialRequests') }}
          </div>
          <div class="text-sm text-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">
            {{ clientInfo.special_requests }}
          </div>
        </div>
      </div>
    </div>

    <!-- What's Next Section -->
    <div class="bg-accent/50 border rounded-lg p-6">
      <h3 class="font-serif text-lg font-semibold text-foreground mb-3">
        {{ t('booking.step3.whatsNext') }}
      </h3>

      <ol class="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
        <li>{{ t('booking.step3.whatsNextStep1') }}</li>
        <li>{{ t('booking.step3.whatsNextStep2') }}</li>
        <li>{{ t('booking.step3.whatsNextStep3') }}</li>
      </ol>
    </div>
  </div>
</template>
