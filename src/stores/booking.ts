import { defineStore } from 'pinia'
import { useQuery, useQueryCache } from '@pinia/colada'
import { supabase } from '@/lib/supabase'
import type { MaybeRefOrGetter } from 'vue'
import { toValue, computed } from 'vue'
import {
  addMinutes,
  format,
  parseISO,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  endOfDay,
  getDay,
  formatISO,
} from 'date-fns'
import type { Service, AddOn, Appointment, AppointmentInsert } from '@/types'

interface ClientInfo {
  client_name: string
  client_whatsapp: string
  client_phone: string
  client_email?: string
  special_requests?: string
}

interface AvailabilitySchedule {
  id: string
  technician_id: string
  day_of_week: number
  start_time: string // "09:00:00"
  end_time: string // "17:00:00"
  is_active: boolean
}

interface UnavailablePeriod {
  id: string
  start_datetime: string
  end_datetime: string
}

interface BookingState {
  // Pre-filled from URL
  selectedServiceId: string | null
  selectedAddonIds: string[]

  // Step 1: Date/Time
  selectedDate: Date | null
  selectedTime: string | null // "14:00"

  // Step 2: Client Info
  clientInfo: ClientInfo
  inspirationImage: File | null

  // Current step (1, 2, or 3)
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

    // Can proceed to step 2 (client info)
    canProceedToStep2(state): boolean {
      return !!(state.selectedDate && state.selectedTime)
    },

    // Can proceed to step 3 (review)
    canProceedToStep3(state): boolean {
      return (
        this.canProceedToStep2 &&
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

    // Fetch available time slots for a specific date
    useAvailableSlots(
      date: MaybeRefOrGetter<Date | null>,
      serviceDuration: MaybeRefOrGetter<number>,
    ) {
      return useQuery({
        key: () => {
          const dateValue = toValue(date)
          return [
            'booking',
            'available-slots',
            dateValue ? formatISO(dateValue, { representation: 'date' }) : null,
            toValue(serviceDuration),
          ]
        },
        query: async () => {
          const selectedDate = toValue(date)
          if (!selectedDate || !this.defaultTechnicianId) return []

          const dayOfWeek = getDay(selectedDate)
          const dateStr = format(selectedDate, 'yyyy-MM-dd')

          // 1. Get technician's working hours for this day
          const { data: schedule } = await supabase
            .from('availability_schedules')
            .select<'*', AvailabilitySchedule>('*')
            .eq('technician_id', this.defaultTechnicianId)
            .eq('day_of_week', dayOfWeek)
            .eq('is_active', true)
            .limit(1)
            .single()

          if (!schedule) return []

          // 2. Get existing appointments for this date
          const { data: appointments } = await supabase
            .from('appointments')
            .select('start_time, end_time, duration_minutes')
            .eq('appointment_date', dateStr)
            .eq('technician_id', this.defaultTechnicianId)
            .in('status', ['pending', 'confirmed', 'in_progress'])

          // 3. Get unavailable periods that overlap with this date
          const dayStart = startOfDay(selectedDate)
          const dayEnd = endOfDay(selectedDate)

          const { data: unavailablePeriods } = await supabase
            .from('unavailable_periods')
            .select<'*', UnavailablePeriod>('*')
            .eq('technician_id', this.defaultTechnicianId)
            .gte('end_datetime', formatISO(dayStart))
            .lte('start_datetime', formatISO(dayEnd))

          // 4. Generate 30-minute time slots
          const duration = toValue(serviceDuration)
          const slots = this.generateTimeSlots(schedule.start_time, schedule.end_time, 30)

          // 5. Filter available slots
          const now = new Date()
          const isToday = isSameDay(selectedDate, now)

          const availableSlots = slots.filter((slotTime) => {
            // Parse slot time
            const slotDateTime = parseISO(`${dateStr}T${slotTime}`)

            // Check if slot is in the past (only for today)
            if (isToday && isBefore(slotDateTime, now)) {
              return false
            }

            // Calculate end time for this slot (slot + service duration)
            const slotEndTime = addMinutes(slotDateTime, duration)

            // Check if service would finish before closing time
            const closingDateTime = parseISO(`${dateStr}T${schedule.end_time}`)
            if (isAfter(slotEndTime, closingDateTime)) {
              return false
            }

            // Check if slot overlaps with existing appointments
            const overlapsAppointment = appointments?.some((apt) => {
              const aptStart = parseISO(`${dateStr}T${apt.start_time}`)
              const aptEnd = parseISO(`${dateStr}T${apt.end_time}`)

              // Slot conflicts if it starts before appointment ends and ends after appointment starts
              return slotDateTime < aptEnd && slotEndTime > aptStart
            })

            if (overlapsAppointment) return false

            // Check if slot overlaps with unavailable periods
            const overlapsUnavailable = unavailablePeriods?.some((period) => {
              const periodStart = parseISO(period.start_datetime)
              const periodEnd = parseISO(period.end_datetime)

              return slotDateTime < periodEnd && slotEndTime > periodStart
            })

            if (overlapsUnavailable) return false

            return true
          })

          return availableSlots
        },
        staleTime: 60_000, // 1 minute
        enabled: () => !!toValue(date) && !!this.defaultTechnicianId,
      })
    },

    // Helper: Generate time slots in 30-min intervals
    generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
      const slots: string[] = []

      // Parse start and end times (format: "HH:MM:SS")
      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)

      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin

      for (let minutes = startMinutes; minutes < endMinutes; minutes += intervalMinutes) {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
        slots.push(timeStr)
      }

      return slots
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
      if (step >= 1 && step <= 3) {
        this.currentStep = step
      }
    },

    // Submit booking and create appointment
    async createBooking(service: Service, addons: AddOn[]): Promise<string> {
      if (!this.canProceedToStep3) {
        throw new Error('Cannot create booking: missing required information')
      }

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
        .select<'*', Appointment>()
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
    pick: ['selectedServiceId', 'selectedAddonIds', 'selectedDate', 'selectedTime', 'clientInfo'],
  },
})
