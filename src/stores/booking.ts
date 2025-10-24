import { defineStore } from 'pinia'
import { useQuery, useQueryCache } from '@pinia/colada'
import { supabase } from '@/lib/supabase'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { addMinutes, format } from 'date-fns'
import type { AddOn, Appointment, AppointmentInsert, GetTimeSlotsForDayArgs, Service, TimeSlot } from '@/types'
import { useAuthStore } from './auth'

interface ClientInfo {
  client_name: string
  client_whatsapp: string
  client_phone: string
  client_email?: string
  special_requests?: string
}

interface BookingState {
  // Pre-filled from URL
  selectedServiceId: string | null
  selectedAddonIds: string[]

  // Step 1: Date/Time
  selectedDate: Date | null
  selectedTime: string | null // "14:00"

  // Step 2: Authentication (new)
  isAuthFlowSkipped: boolean

  // Step 3: Client Info
  clientInfo: ClientInfo
  inspirationImage: File | null

  // Current step (1-5: date/time, auth, client info, review, confirmation)
  currentStep: number

  // Default technician (will be fetched from business_settings)
  defaultTechnicianId: string
}

export const useBookingStore = defineStore('booking', {
  state: (): BookingState => ({
    selectedServiceId: null,
    selectedAddonIds: [],

    selectedDate: null,
    selectedTime: null,

    isAuthFlowSkipped: false,

    clientInfo: {
      client_name: '',
      client_whatsapp: '',
      client_phone: '',
      client_email: '',
      special_requests: '',
    },
    inspirationImage: null,

    currentStep: 1,

    // TODO: Get from business_settings table
    defaultTechnicianId: '',
  }),

  getters: {
    // Calculate total duration (service + addons)
    totalDuration(): (service: Service | null, addons: AddOn[]) => number {
      return (service: Service | null, addons: AddOn[]) => {
        if (!service) return 0
        const serviceDuration = service.duration_minutes
        const addonsDuration = addons.reduce(
          (sum, addon) => sum + (addon.additional_time_minutes || 0),
          0,
        )
        return serviceDuration + addonsDuration
      }
    },

    // Calculate total price (service + addons)
    totalPrice(): (service: Service | null, addons: AddOn[]) => number {
      return (service: Service | null, addons: AddOn[]) => {
        if (!service) return 0
        const servicePrice = service.base_price
        const addonsPrice = addons.reduce((sum, addon) => sum + (addon.price || 0), 0)
        return servicePrice + addonsPrice
      }
    },

    // Can proceed to step 2 (auth gateway)
    canProceedToStep2(state): boolean {
      return !!(state.selectedDate && state.selectedTime)
    },

    // Can proceed to step 3 (client info)
    canProceedToStep3(): boolean {
      return this.canProceedToStep2
    },

    // Can proceed to step 4 (review)
    canProceedToStep4(state): boolean {
      return (
        this.canProceedToStep3 &&
        !!state.clientInfo.client_name &&
        !!state.clientInfo.client_whatsapp &&
        !!state.clientInfo.client_phone
      )
    },
  },

  actions: {
    // Initialize booking from URL params
    initializeFromParams(serviceId: string, addonIds: string[]) {
      this.selectedServiceId = serviceId
      this.selectedAddonIds = addonIds
      this.currentStep = 1
    },

    // Fetch default technician from business_settings
    useDefaultTechnician() {
      return useQuery({
        key: ['business-settings', 'default-technician'],
        query: async () => {
          const { data, error } = await supabase
            .from('business_settings')
            .select('technician_id')
            .limit(1)
            .single()

          if (error) throw error
          if (data?.technician_id) {
            this.defaultTechnicianId = data.technician_id
          }
          return data?.technician_id || null
        },
        staleTime: 600_000, // 10 minutes
      })
    },

    // Fetch available time slots for a specific date using RPC function
    useAvailableSlots(
      date: MaybeRefOrGetter<Date>,
      serviceDuration: MaybeRefOrGetter<number>,
    ) {
      return useQuery({
        key: () => ['booking', 'available-slots', format(toValue(date), 'yyyy-MM-dd')],
        query: async (): Promise<string[]> => {
          const selectedDate = toValue(date)
          if (!selectedDate) throw new Error('Please select a date')
          if (!this.defaultTechnicianId) {
            const { data, error } = await supabase.from('business_settings')
              .select('technician_id')
              .single()
            if (error) throw error;
            this.defaultTechnicianId = data.technician_id as string
          }

          const dateStr = format(selectedDate, 'yyyy-MM-dd')
          const duration = toValue(serviceDuration)

          // Call the RPC function to get time slots
          const { data, error } = await supabase.rpc('get_time_slots_for_day', {
            p_date: dateStr,
            p_technician_id: this.defaultTechnicianId,
            p_service_duration_minutes: duration,
            p_slot_interval_minutes: 30,
          } as GetTimeSlotsForDayArgs)

          if (error) throw error

          // Filter to only return available slots and extract time_slot values
          return (data as TimeSlot[])
            .filter((slot) => slot.is_available)
            .map((slot) => {
              // Convert TIME format "HH:MM:SS" to "HH:MM"
              const timeStr = slot.time_slot.toString()
              return timeStr.substring(0, 5) // Extract HH:MM
            })
        },
        staleTime: 60_000,
      })
    },

    // Set selected date and time
    setDateTime(date: Date, time: string) {
      this.selectedDate = date
      this.selectedTime = time
    },

    // Set client information
    setClientInfo(info: ClientInfo) {
      this.clientInfo = info
    },

    // Set inspiration image
    setInspirationImage(file: File | null) {
      this.inspirationImage = file
    },

    // Navigate to specific step
    goToStep(step: number) {
      if (step >= 1 && step <= 5) {
        this.currentStep = step
      }
    },

    // Auto-fill client info from authenticated user profile
    autoFillFromProfile(profile: { full_name?: string | null; phone?: string | null; email?: string }): void {
      if (profile.full_name) {
        this.clientInfo.client_name = profile.full_name
      }
      if (profile.phone) {
        this.clientInfo.client_phone = profile.phone
        this.clientInfo.client_whatsapp = profile.phone // Default to same number
      }
      if (profile.email) {
        this.clientInfo.client_email = profile.email
      }
    },

    // Mark auth flow as skipped (guest checkout)
    skipAuthFlow(): void {
      this.isAuthFlowSkipped = true
    },

    // Submit booking and create appointment
    async createBooking(service: Service, addons: AddOn[]): Promise<string> {
      if (!this.canProceedToStep4) {
        throw new Error('Cannot create booking: missing required information')
      }

      // Get auth store to check if user is authenticated
      const { userProfile } = useAuthStore()

      // 1. Upload inspiration image if provided
      let inspirationUrl: string | null = null
      if (this.inspirationImage) {
        const timestamp = Date.now()
        const fileName = this.inspirationImage.name
        const path = `inspiration-images/${timestamp}_${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inspiration-images')
          .upload(path, this.inspirationImage)

        if (uploadError) throw uploadError

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('inspiration-images').getPublicUrl(uploadData.path)

        inspirationUrl = publicUrl
      }

      // 2. Calculate appointment times and price
      const duration = this.totalDuration(service, addons)
      const totalPrice = this.totalPrice(service, addons)

      const startTime = this.selectedTime!
      const [hours, minutes] = startTime.split(':').map(Number)
      const startDateTime = new Date(this.selectedDate!)
      startDateTime.setHours(hours, minutes, 0, 0)
      const endDateTime = addMinutes(startDateTime, duration)
      const endTime = format(endDateTime, 'HH:mm')

      // 3. Create appointment record
      const appointmentData: AppointmentInsert = {
        technician_id: this.defaultTechnicianId,
        appointment_date: format(this.selectedDate!, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        duration_minutes: duration,
        service_id: this.selectedServiceId!,
        quoted_price: totalPrice,
        client_id: userProfile?.id || null, //will be set automatically in supabase
        client_name: this.clientInfo.client_name,
        client_phone: this.clientInfo.client_phone,
        client_whatsapp: this.clientInfo.client_whatsapp,
        client_email: this.clientInfo.client_email || null,
        inspiration_image_url: inspirationUrl,
        special_requests: this.clientInfo.special_requests || null,
        status: 'pending',
      }

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single()

      if (appointmentError) throw appointmentError

      // 4. Create appointment_addons records
      if (this.selectedAddonIds.length > 0) {
        const addonRecords = this.selectedAddonIds.map((addonId) => ({
          appointment_id: appointment.id,
          addon_id: addonId,
          quantity: 1,
        }))

        const { error: addonsError } = await supabase
          .from('appointment_addons')
          .insert(addonRecords)

        if (addonsError) throw addonsError
      }

      // 5. Invalidate relevant queries
      const queryCache = useQueryCache()
      queryCache.invalidateQueries({ key: ['booking', 'available-slots'] })
      queryCache.invalidateQueries({ key: ['appointments'] })

      // 6. Return appointment number
      return appointment.appointment_number
    },

    // Reset booking state
    resetBooking() {
      this.$reset()
    },
  },

  persist: {
    key: 'booking-store',
    pick: ['selectedServiceId', 'selectedAddonIds', 'selectedDate', 'selectedTime', 'isAuthFlowSkipped', 'clientInfo'],
  },
})
