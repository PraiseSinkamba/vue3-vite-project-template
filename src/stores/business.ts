import { defineStore } from 'pinia'
import { useQuery } from '@pinia/colada'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type {
  BusinessSettings,
  BusinessSettingsUpdate,
  AvailabilitySchedule,
} from '@/types'

export interface BusinessStoreState {
  settings: BusinessSettings | null
  schedules: AvailabilitySchedule[]
}

export const useBusinessStore = defineStore('business', {
  state: (): BusinessStoreState => ({
    settings: null,
    schedules: [],
  }),

  getters: {
    // Get availability schedules grouped by day of week (0-6)
    availabilityByDay: (state) => {
      const grouped: Record<number, AvailabilitySchedule[]> = {}

      for (let i = 0; i < 7; i++) {
        grouped[i] = state.schedules.filter((s) => s.day_of_week === i && s.is_active)
      }

      return grouped
    },

    // Check if a specific day is enabled
    isDayEnabled: (state) => (dayOfWeek: number) => {
      return state.schedules.some((s) => s.day_of_week === dayOfWeek && s.is_active)
    },

    // Get all enabled days
    enabledDays(state) {
      const days = new Set<number>()
      state.schedules.forEach((s) => {
        if (s.is_active) {
          days.add(s.day_of_week)
        }
      })
      return Array.from(days).sort()
    },

    // Get default hours for a specific day
    getDefaultHoursForDay: (state) => (dayOfWeek: number) => {
      return state.schedules.find((s) => s.day_of_week === dayOfWeek && s.is_active) || null
    },

    // Business settings getters
    isAcceptingBookings: (state) => state.settings?.is_accepting_bookings ?? true,
    slotDuration: (state) => state.settings?.slot_duration ?? 30,
    advanceBookingDays: (state) => state.settings?.advance_booking_days ?? 30,
  },

  actions: {
    // Fetch business settings using Pinia Colada
    fetchBusinessSettings() {
      return useQuery({
        key: ['admin', 'business-settings'],
        query: async () => {
          const { data, error } = await supabase
            .from('business_settings')
            .select('*')
            .limit(1)
            .single()

          if (error && error.code !== 'PGRST116') throw error
          this.settings = data as BusinessSettings | null
          return data as BusinessSettings | null
        },
        staleTime: 300000, // 5 minutes
      })
    },

    // Fetch availability schedules using Pinia Colada
    fetchAvailabilitySchedules() {
      return useQuery({
        key: ['admin', 'availability-schedules'],
        query: async () => {
          const { data, error } = await supabase
            .from('availability_schedules')
            .select('*')
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true })

          if (error) throw error
          const result = (data || []) as AvailabilitySchedule[]
          this.schedules = result
          return result
        },
        staleTime: 300000,
      })
    },

    // Update business settings
    async updateSettings(update: BusinessSettingsUpdate): Promise<BusinessSettings> {
      const { data: existingSettings } = await supabase
        .from('business_settings')
        .select()
        .maybeSingle()

      if (existingSettings) {
        const { data, error } = await supabase
          .from('business_settings')
          .update(update)
          .eq('id', existingSettings.id)
          .select()
          .single()

        if (error) throw error
        this.settings = data as BusinessSettings
        return data as BusinessSettings
      }

      // Create new settings if none exist
      const authStore = useAuthStore()
      const { data, error } = await supabase
        .from('business_settings')
        .insert({
          ...update,
          technician_id: authStore.userProfile?.id,
        })
        .select()
        .single()

      if (error) throw error
      this.settings = data as BusinessSettings
      return data as BusinessSettings
    },

    // Save business settings (convenience method)
    async saveSettings(settings: {
      isAcceptingBookings?: boolean
      slotDuration?: number
      advanceBookingDays?: number
    }): Promise<BusinessSettings> {
      const updateData: BusinessSettingsUpdate = {}

      if (settings.isAcceptingBookings !== undefined) {
        updateData.is_accepting_bookings = settings.isAcceptingBookings
      }
      if (settings.slotDuration !== undefined) {
        updateData.slot_duration = settings.slotDuration
      }
      if (settings.advanceBookingDays !== undefined) {
        updateData.advance_booking_days = settings.advanceBookingDays
      }

      return this.updateSettings(updateData)
    },
  },

  persist: {
    key: 'business-store',
    pick: ['settings', 'schedules'],
  },
})
