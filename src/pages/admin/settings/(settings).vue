<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import PageHeader from '@/components/ui/page/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConditionalContent } from '@/components/ui/conditional'
import AddTimeOffDialog from '@/components/admin/settings/AddTimeOffDialog.vue'
import DayScheduleRow from '@/components/admin/settings/DayScheduleRow.vue'
import { useBusinessStore } from '@/stores/business'
import { Clock, Plus, Trash2 } from 'lucide-vue-next'
import type { UnavailablePeriod } from '@/types'
import { format, parseISO } from 'date-fns'

const queryCache = useQueryCache()

// Use business store
const businessStore = useBusinessStore()
const { availabilityByDay, isAcceptingBookings, slotDuration, advanceBookingDays } = storeToRefs(businessStore)

// Fetch business settings and schedules
const businessSettingsQuery = businessStore.fetchBusinessSettings()
const availabilitySchedulesQuery = businessStore.fetchAvailabilitySchedules()

// Save business settings wrapper
const saveBusinessSettings = async () => {
  await businessStore.saveSettings({
    isAcceptingBookings: isAcceptingBookings.value,
    slotDuration: slotDuration.value,
    advanceBookingDays: advanceBookingDays.value,
  })
}

// Combined loading and error states
const businessSettingsLoading = computed(() =>
  businessSettingsQuery.isLoading.value || availabilitySchedulesQuery.isLoading.value
)
const businessSettingsHasError = computed(() =>
  businessSettingsQuery.status.value === 'error' || availabilitySchedulesQuery.status.value === 'error'
)
const businessSettingsError = computed(() =>
  businessSettingsQuery.error.value ?? availabilitySchedulesQuery.error.value
)

// Day of week labels
const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Fetch unavailable periods
const unavailablePeriodsQuery = useQuery({
  key: ['admin', 'unavailable-periods'],
  query: async () => {
    const { data, error } = await supabase
      .from('unavailable_periods')
      .select('*')
      .order('start_datetime', { ascending: true })

    if (error) throw error
    return (data || []) as UnavailablePeriod[]
  },
  staleTime: 300000,
})

// Delete unavailable period mutation
const deleteUnavailablePeriodMutation = useMutation({
  mutation: async (id: string) => {
    const { error } = await supabase.from('unavailable_periods').delete().eq('id', id)
    if (error) throw error
  },
  onSuccess: () => {
    queryCache.invalidateQueries({ key: ['admin', 'unavailable-periods'] })
  },
})

// Dialog state
const showAddTimeOffDialog = ref(false)

// Combined loading state
const isLoading = computed(() => businessSettingsLoading.value || unavailablePeriodsQuery.isLoading.value)

const hasError = computed(() => businessSettingsHasError.value || unavailablePeriodsQuery.status.value === 'error')

const combinedError = computed(() => businessSettingsError.value ?? unavailablePeriodsQuery.error.value)

const refreshAll = () => {
  unavailablePeriodsQuery.refresh()
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader hide-back-button>
      <template #title>
        <span class="font-bold text-2xl">Business Settings</span>
      </template>
      <template #description>Manage your availability, working hours, and time off</template>
    </PageHeader>

    <ConditionalContent :is-loading="isLoading" :has-error="hasError"
      :error="combinedError" :retry="refreshAll" :is-empty="false"
      empty-icon="settings">
      <div class="space-y-6">
        <!-- Business Hours Section -->
        <div class="bg-card border rounded-lg">
          <div class="flex items-center gap-3 p-6 border-b">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock class="w-5 h-5 text-primary" />
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-semibold">Business Hours</h2>
              <p class="text-sm text-muted-foreground">
                Control how this business works at different times of day
              </p>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- Enable/Disable Bookings -->
            <div class="flex items-center justify-between">
              <div>
                <Label class="text-base font-medium">Enable Bookings</Label>
                <p class="text-sm text-muted-foreground">
                  Quickly enable or disable business hours
                </p>
              </div>
              <Switch v-model:model-value="isAcceptingBookings" @update:model-value="saveBusinessSettings" />
            </div>

            <!-- Timezone (read-only for now) -->
            <div class="space-y-2">
              <Label>Timezone</Label>
              <Input value="(UTC-08:00) Pacific Time" disabled class="bg-muted" />
              <p class="text-xs text-muted-foreground">Set your timezone</p>
            </div>

            <!-- Weekly Schedule -->
            <div>
              <DayScheduleRow v-for="(day, index) in dayLabels" :key="index" :day-of-week="index" :day-label="day"
                :schedules="availabilityByDay[index] || []" />
            </div>
          </div>
        </div>

        <!-- Time Off / Unavailable Periods -->
        <div class="bg-card border rounded-lg">
          <div class="p-6 border-b">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold">Time Off</h2>
                <p class="text-sm text-muted-foreground">Block out periods when you're unavailable</p>
              </div>
              <Button size="sm" @click="showAddTimeOffDialog = true">
                <Plus class="w-4 h-4 mr-2" />
                Add Time Off
              </Button>
            </div>
          </div>

          <!-- Periods List -->
          <div class="divide-y">
            <div v-for="period in unavailablePeriodsQuery.data.value" :key="period.id"
              class="p-4 hover:bg-accent/50 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-medium">{{ period.title }}</h3>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                      {{ period.period_type }}
                    </span>
                  </div>
                  <p v-if="period.description" class="text-sm text-muted-foreground mt-1">
                    {{ period.description }}
                  </p>
                  <div class="text-sm text-muted-foreground mt-2">
                    {{ format(parseISO(period.start_datetime), 'MMM d, yyyy h:mm a') }} -
                    {{ format(parseISO(period.end_datetime), 'MMM d, yyyy h:mm a') }}
                  </div>
                </div>
                <Button variant="ghost" size="sm" @click="deleteUnavailablePeriodMutation.mutate(period.id)"
                  :disabled="deleteUnavailablePeriodMutation.isLoading.value">
                  <Trash2 class="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div v-if="!unavailablePeriodsQuery.data.value?.length" class="p-8 text-center text-muted-foreground">
              <p class="text-sm">No time off periods scheduled</p>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div class="bg-card border rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">Advanced Settings</h2>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label>Appointment Slot Duration (minutes)</Label>
              <Input :model-value="slotDuration" @update:model-value="(val) => slotDuration = Number(val)" type="number"
                min="15" max="120" step="15" @blur="saveBusinessSettings" />
              <p class="text-xs text-muted-foreground">
                Default time slot duration for appointments
              </p>
            </div>
            <div class="space-y-2">
              <Label>Advance Booking Limit (days)</Label>
              <Input :model-value="advanceBookingDays" @update:model-value="(val) => advanceBookingDays = Number(val)"
                type="number" min="1" max="90" @blur="saveBusinessSettings" />
              <p class="text-xs text-muted-foreground">
                How far in advance clients can book
              </p>
            </div>
          </div>
        </div>
      </div>
    </ConditionalContent>

    <!-- Add Time Off Dialog -->
    <AddTimeOffDialog v-model:open="showAddTimeOffDialog" />
  </div>
</template>
