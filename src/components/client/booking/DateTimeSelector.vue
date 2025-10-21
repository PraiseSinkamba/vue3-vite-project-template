<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { syncRef } from '@vueuse/core'
import { useBookingStore } from '@/stores/booking'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { ConditionalContent } from '@/components/ui/conditional'
import { Calendar as CalendarIcon, Clock } from 'lucide-vue-next'
import { addDays, startOfToday, format as formatDate, parse } from 'date-fns'
import type { Service, AddOn } from '@/types'

interface Props {
  service: Service
  addons: AddOn[]
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const bookingStore = useBookingStore()
const { selectedDate, selectedTime } = storeToRefs(bookingStore)

// Local state for date picker (synced with store)
const localDate = ref<Date | null>(selectedDate.value)
const today = startOfToday()

// Sync local date with store date using VueUse
syncRef(localDate, selectedDate, { direction: 'both' })

// Calculate total duration
const totalDuration = computed(() => {
  return bookingStore.totalDuration(props.service, props.addons)
})

// Fetch available slots for selected date
const availableSlotsQuery = bookingStore.useAvailableSlots(localDate, totalDuration)

// Select a time slot
const selectTimeSlot = (time: string) => {
  if (localDate.value) {
    bookingStore.setDateTime(localDate.value, time)
  }
}

// Format time for display using date-fns
const formatTime = (timeStr: string) => {
  // Parse the time string (HH:mm) into a Date object
  const timeDate = parse(timeStr, 'HH:mm', today)

  // Format based on locale preference
  // Turkish uses 24-hour format, English uses 12-hour format
  const timeFormat = locale.value === 'tr' ? 'HH:mm' : 'h:mm a'
  return formatDate(timeDate, timeFormat)
}

// Group time slots by morning/afternoon/evening
const groupedSlots = computed(() => {
  if (!availableSlotsQuery.data.value) return {}

  const slots = availableSlotsQuery.data.value
  const groups: Record<string, string[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  }

  slots.forEach((time) => {
    const hour = parseInt(time.split(':')[0])

    if (hour < 12) {
      groups.morning.push(time)
    } else if (hour < 17) {
      groups.afternoon.push(time)
    } else {
      groups.evening.push(time)
    }
  })

  return groups
})

const hasSlots = computed(() => {
  const slots = groupedSlots.value
  return (
    (slots.morning?.length ?? 0) > 0 ||
    (slots.afternoon?.length ?? 0) > 0 ||
    (slots.evening?.length ?? 0) > 0
  )
})

// Group label translations
const getGroupLabel = (group: string) => {
  const labels: Record<string, Record<string, string>> = {
    morning: { en: 'Morning', tr: 'Sabah' },
    afternoon: { en: 'Afternoon', tr: 'Öğleden Sonra' },
    evening: { en: 'Evening', tr: 'Akşam' },
  }

  return labels[group]?.[locale.value] || group
}
</script>

<template>
  <div class="space-y-6">
    <!-- Date Selection -->
    <div>
      <label class="block text-sm font-medium text-foreground mb-2">
        <CalendarIcon class="w-4 h-4 inline mr-2" />
        {{ t('booking.step1.selectDate') }}
      </label>

      <DatePicker
        v-model="localDate"
        :min-date="today"
        :max-date="addDays(today, 30)"
        :locale="locale"
        :placeholder="t('booking.step1.selectDate')"
        class="w-full"
      />

      <p v-if="totalDuration" class="text-sm text-muted-foreground mt-2">
        {{ t('booking.serviceDuration') }}: {{ Math.floor(totalDuration / 60) }}h
        {{ totalDuration % 60 > 0 ? `${totalDuration % 60}min` : '' }}
      </p>
    </div>

    <!-- Time Slot Selection -->
    <div v-if="localDate">
      <label class="block text-sm font-medium text-foreground mb-2">
        <Clock class="w-4 h-4 inline mr-2" />
        {{ t('booking.step1.selectTime') }}
      </label>

      <ConditionalContent
        :is-loading="availableSlotsQuery.isLoading.value"
        :has-error="availableSlotsQuery.status.value === 'error'"
        :error="availableSlotsQuery.error.value"
        :retry="availableSlotsQuery.refresh"
        :is-empty="!hasSlots"
        :empty-title="t('booking.step1.noSlots')"
        :empty-message="t('booking.step1.noSlotsMessage')"
        empty-icon="calendar"
      >
        <div class="space-y-6">
          <!-- Morning Slots -->
          <div v-if="groupedSlots.morning && groupedSlots.morning.length > 0">
            <div class="text-sm font-medium text-muted-foreground mb-3">
              {{ getGroupLabel('morning') }}
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              <Button
                v-for="time in groupedSlots.morning"
                :key="time"
                variant="outline"
                size="sm"
                :class="{
                  'bg-primary text-primary-foreground hover:bg-primary/90':
                    selectedTime === time,
                }"
                @click="selectTimeSlot(time)"
              >
                {{ formatTime(time) }}
              </Button>
            </div>
          </div>

          <!-- Afternoon Slots -->
          <div v-if="groupedSlots.afternoon && groupedSlots.afternoon.length > 0">
            <div class="text-sm font-medium text-muted-foreground mb-3">
              {{ getGroupLabel('afternoon') }}
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              <Button
                v-for="time in groupedSlots.afternoon"
                :key="time"
                variant="outline"
                size="sm"
                :class="{
                  'bg-primary text-primary-foreground hover:bg-primary/90':
                    selectedTime === time,
                }"
                @click="selectTimeSlot(time)"
              >
                {{ formatTime(time) }}
              </Button>
            </div>
          </div>

          <!-- Evening Slots -->
          <div v-if="groupedSlots.evening && groupedSlots.evening.length > 0">
            <div class="text-sm font-medium text-muted-foreground mb-3">
              {{ getGroupLabel('evening') }}
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              <Button
                v-for="time in groupedSlots.evening"
                :key="time"
                variant="outline"
                size="sm"
                :class="{
                  'bg-primary text-primary-foreground hover:bg-primary/90':
                    selectedTime === time,
                }"
                @click="selectTimeSlot(time)"
              >
                {{ formatTime(time) }}
              </Button>
            </div>
          </div>
        </div>
      </ConditionalContent>
    </div>

    <!-- Instruction text when no date selected -->
    <div
      v-else
      class="flex items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground"
    >
      <div class="text-center">
        <CalendarIcon class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p class="text-sm">{{ t('booking.step1.selectDateFirst') }}</p>
      </div>
    </div>
  </div>
</template>
