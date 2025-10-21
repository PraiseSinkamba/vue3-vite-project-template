<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMutation, useQueryCache } from '@pinia/colada'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, Clock } from 'lucide-vue-next'
import type { AvailabilitySchedule, AvailabilityScheduleInsert } from '@/types'

interface Props {
  dayOfWeek: number
  dayLabel: string
  schedules: AvailabilitySchedule[]
}

const props = defineProps<Props>()

const authStore = useAuthStore()
const { userProfile } = storeToRefs(authStore)
const queryCache = useQueryCache()

// Local editing state
const isEditing = ref(false)
const localEnabled = ref(props.schedules.length > 0)
const localStartTime = ref('09:00')
const localEndTime = ref('17:30')

// Initialize from existing schedule
if (props.schedules.length > 0) {
  const schedule = props.schedules[0]
  localStartTime.value = formatTimeForInput(schedule.start_time)
  localEndTime.value = formatTimeForInput(schedule.end_time)
}

// Format time for input (HH:MM)
function formatTimeForInput(time: string): string {
  return time.substring(0, 5)
}

// Track if values have changed
const hasChanges = computed(() => {
  const wasEnabled = props.schedules.length > 0
  const enabledChanged = localEnabled.value !== wasEnabled

  if (!localEnabled.value && !wasEnabled) {
    return false // Both disabled, no change
  }

  if (enabledChanged) {
    return true // Enable/disable changed
  }

  // Check time changes
  if (props.schedules.length > 0) {
    const schedule = props.schedules[0]
    const originalStart = formatTimeForInput(schedule.start_time)
    const originalEnd = formatTimeForInput(schedule.end_time)

    return localStartTime.value !== originalStart || localEndTime.value !== originalEnd
  }

  return false
})

// Watch for changes
watch([localEnabled, localStartTime, localEndTime], () => {
  if (hasChanges.value) {
    isEditing.value = true
  }
})

// Create schedule mutation
const createScheduleMutation = useMutation({
  mutation: async (schedule: AvailabilityScheduleInsert) => {
    const { error } = await supabase.from('availability_schedules').insert(schedule)
    if (error) throw error
  },
  onSuccess: () => {
    queryCache.invalidateQueries({ key: ['admin', 'availability-schedules'] })
    isEditing.value = false
  },
})

// Update schedule mutation
const updateScheduleMutation = useMutation({
  mutation: async ({ id, startTime, endTime }: { id: string; startTime: string; endTime: string }) => {
    const { error } = await supabase
      .from('availability_schedules')
      .update({
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
      })
      .eq('id', id)

    if (error) throw error
  },
  onSuccess: () => {
    queryCache.invalidateQueries({ key: ['admin', 'availability-schedules'] })
    isEditing.value = false
  },
})

// Delete schedule mutation
const deleteScheduleMutation = useMutation({
  mutation: async (id: string) => {
    const { error } = await supabase.from('availability_schedules').delete().eq('id', id)
    if (error) throw error
  },
  onSuccess: () => {
    queryCache.invalidateQueries({ key: ['admin', 'availability-schedules'] })
    isEditing.value = false
  },
})

// Save changes
const saveChanges = async () => {
  if (!hasChanges.value) return

  const wasEnabled = props.schedules.length > 0

  if (localEnabled.value && !wasEnabled) {
    // Create new schedule
    await createScheduleMutation.mutateAsync({
      technician_id: userProfile.value?.id || null,
      day_of_week: props.dayOfWeek,
      start_time: `${localStartTime.value}:00`,
      end_time: `${localEndTime.value}:00`,
      is_active: true,
    })
  } else if (!localEnabled.value && wasEnabled) {
    // Delete all schedules for this day
    for (const schedule of props.schedules) {
      await deleteScheduleMutation.mutateAsync(schedule.id)
    }
  } else if (localEnabled.value && wasEnabled) {
    // Update existing schedule
    const schedule = props.schedules[0]
    await updateScheduleMutation.mutateAsync({
      id: schedule.id,
      startTime: localStartTime.value,
      endTime: localEndTime.value,
    })
  }
}

// Cancel changes
const cancelChanges = () => {
  const wasEnabled = props.schedules.length > 0
  localEnabled.value = wasEnabled

  if (wasEnabled && props.schedules.length > 0) {
    const schedule = props.schedules[0]
    localStartTime.value = formatTimeForInput(schedule.start_time)
    localEndTime.value = formatTimeForInput(schedule.end_time)
  }

  isEditing.value = false
}

// Auto-commit on blur
const handleBlur = () => {
  if (hasChanges.value) {
    saveChanges()
  }
}

// Update local values when props change
watch(
  () => props.schedules,
  (newSchedules) => {
    if (!isEditing.value) {
      localEnabled.value = newSchedules.length > 0
      if (newSchedules.length > 0) {
        const schedule = newSchedules[0]
        localStartTime.value = formatTimeForInput(schedule.start_time)
        localEndTime.value = formatTimeForInput(schedule.end_time)
      }
    }
  },
  { deep: true }
)

const isLoading = computed(
  () =>
    createScheduleMutation.isLoading.value ||
    updateScheduleMutation.isLoading.value ||
    deleteScheduleMutation.isLoading.value
)
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4 border-b last:border-0"
    @focusout="handleBlur">
    <!-- Mobile: Day + Toggle in row -->
    <div class="flex items-center justify-between sm:justify-start sm:gap-4">
      <div class="flex items-center gap-3">
        <Switch :model-value="localEnabled" @update:model-value="(val) => (localEnabled = val)" :disabled="isLoading"
          class="flex-shrink-0" />
        <div class="font-medium min-w-[100px]">{{ dayLabel }}</div>
      </div>

      <!-- Mobile: Action buttons (shown at top on mobile when editing) -->
      <div v-if="isEditing && hasChanges" class="flex sm:hidden items-center gap-1">
        <Button size="icon" variant="ghost"
          class="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
          @click.stop="saveChanges" :disabled="isLoading">
          <Check class="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" class="h-8 w-8 text-destructive hover:bg-destructive/10"
          @click.stop="cancelChanges" :disabled="isLoading">
          <X class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Time inputs or Closed indicator -->
    <div class="flex items-center gap-2 flex-1 ml-9 sm:ml-0">
      <template v-if="localEnabled">
        <!-- Mobile-friendly time inputs -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-sm text-muted-foreground min-w-[40px]">From</span>
            <Input type="time" :model-value="localStartTime"
              @update:model-value="(val) => (localStartTime = val as string)" class="w-full sm:w-32"
              :disabled="isLoading" />
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-sm text-muted-foreground min-w-[40px]">To</span>
            <Input type="time" :model-value="localEndTime" @update:model-value="(val) => (localEndTime = val as string)"
              class="w-full sm:w-32" :disabled="isLoading" />
          </div>
        </div>

        <!-- Desktop: Action buttons -->
        <div v-if="isEditing && hasChanges" class="hidden sm:flex items-center gap-1 ml-2">
          <Button size="icon" variant="ghost"
            class="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
            @click.stop="saveChanges" :disabled="isLoading">
            <Check class="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" class="h-8 w-8 text-destructive hover:bg-destructive/10"
            @click.stop="cancelChanges" :disabled="isLoading">
            <X class="w-4 h-4" />
          </Button>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="hidden sm:block ml-2">
          <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center gap-2 text-muted-foreground">
          <Clock class="w-4 h-4" />
          <span class="text-sm">Closed</span>
        </div>
      </template>
    </div>

    <!-- Mobile: Loading indicator at bottom -->
    <div v-if="isLoading" class="sm:hidden ml-9">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Saving...</span>
      </div>
    </div>
  </div>
</template>
