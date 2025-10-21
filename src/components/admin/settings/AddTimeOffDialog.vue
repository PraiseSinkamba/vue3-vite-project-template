<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMutation, useQueryCache } from '@pinia/colada'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import RDialog from '@/components/ui/reponsive/RDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-vue-next'
import type { UnavailablePeriodInsert } from '@/types'

const isOpen = defineModel('open', { type: Boolean, default: false })

const authStore = useAuthStore()
const { userProfile } = storeToRefs(authStore)
const queryCache = useQueryCache()

// Form state
const newPeriod = ref({
  title: '',
  description: '',
  start_datetime: '',
  end_datetime: '',
  period_type: 'other' as 'exam' | 'study' | 'vacation' | 'other',
})

const resetForm = () => {
  newPeriod.value = {
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    period_type: 'other',
  }
}

// Create unavailable period mutation
const createUnavailablePeriodMutation = useMutation({
  mutation: async (period: UnavailablePeriodInsert) => {
    const { error } = await supabase.from('unavailable_periods').insert(period)
    if (error) throw error
  },
  onSuccess: () => {
    queryCache.invalidateQueries({ key: ['admin', 'unavailable-periods'] })
    isOpen.value = false
    resetForm()
  },
})

const savePeriod = async () => {
  if (!newPeriod.value.title || !newPeriod.value.start_datetime || !newPeriod.value.end_datetime) {
    return
  }

  await createUnavailablePeriodMutation.mutateAsync({
    ...newPeriod.value,
    technician_id: userProfile.value?.id || null,
  })
}

// Reset form when dialog closes
watch(isOpen, (value) => {
  if (!value) {
    resetForm()
  }
})
</script>

<template>
  <RDialog
    v-model:open="isOpen"
    title="Add Time Off"
    description="Block out periods when you're unavailable for appointments"
  >
    <div class="space-y-4 py-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="title">
            Title
            <span class="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            :model-value="newPeriod.title"
            @update:model-value="(val) => (newPeriod.title = val)"
            placeholder="e.g., Vacation, Study Break"
            :disabled="createUnavailablePeriodMutation.isLoading.value"
          />
        </div>
        <div class="space-y-2">
          <Label for="type">Type</Label>
          <select
            id="type"
            v-model="newPeriod.period_type"
            class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="createUnavailablePeriodMutation.isLoading.value"
          >
            <option value="vacation">Vacation</option>
            <option value="exam">Exam</option>
            <option value="study">Study</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="start_datetime">
            Start Date & Time
            <span class="text-destructive">*</span>
          </Label>
          <Input
            id="start_datetime"
            :model-value="newPeriod.start_datetime"
            @update:model-value="(val) => (newPeriod.start_datetime = val)"
            type="datetime-local"
            :disabled="createUnavailablePeriodMutation.isLoading.value"
          />
        </div>
        <div class="space-y-2">
          <Label for="end_datetime">
            End Date & Time
            <span class="text-destructive">*</span>
          </Label>
          <Input
            id="end_datetime"
            :model-value="newPeriod.end_datetime"
            @update:model-value="(val) => (newPeriod.end_datetime = val)"
            type="datetime-local"
            :disabled="createUnavailablePeriodMutation.isLoading.value"
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label for="description">Description (Optional)</Label>
        <textarea
          id="description"
          v-model="newPeriod.description"
          class="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Add any additional notes..."
          :disabled="createUnavailablePeriodMutation.isLoading.value"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end w-full">
        <Button
          variant="outline"
          @click="isOpen = false"
          :disabled="createUnavailablePeriodMutation.isLoading.value"
        >
          Cancel
        </Button>
        <Button
          @click="savePeriod"
          :disabled="
            createUnavailablePeriodMutation.isLoading.value ||
            !newPeriod.title ||
            !newPeriod.start_datetime ||
            !newPeriod.end_datetime
          "
        >
          <Save class="w-4 h-4 mr-2" />
          {{ createUnavailablePeriodMutation.isLoading.value ? 'Saving...' : 'Save Period' }}
        </Button>
      </div>
    </template>
  </RDialog>
</template>
