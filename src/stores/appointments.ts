import { defineStore } from 'pinia'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { supabase } from '@/lib/supabase'
import type {
  Appointment,
  AppointmentCalendar,
  AppointmentInsert,
  AppointmentUpdate,
} from '@/types'

export const useAppointmentsStore = defineStore('appointments', {
  state: () => ({
    selectedAppointmentId: null as string | null,
    selectedDate: null as string | null, // ISO date string for filtering
  }),

  getters: {
    hasSelection: (state) => !!state.selectedAppointmentId,
  },

  actions: {
    /**
     * Fetch all appointments from calendar view
     * Returns query controller for caller to manage loading state
     */
    useAppointmentCalendar(startDate?: string, endDate?: string) {
      return useQuery({
        key: () => ['appointments', 'calendar', startDate, endDate],
        query: async (): Promise<AppointmentCalendar[]> => {
          let query = supabase
            .from('appointment_calendar')
            .select('*')
            .order('appointment_date', { ascending: true })
            .order('start_time', { ascending: true })

          // Filter by date range if provided
          if (startDate) {
            query = query.gte('appointment_date', startDate)
          }
          if (endDate) {
            query = query.lte('appointment_date', endDate)
          }

          const { data, error } = await query

          if (error) throw error
          return (data ?? []) as AppointmentCalendar[]
        },
        staleTime: 60_000, // 1 minute - appointments change frequently
      })
    },

    /**
     * Fetch single appointment by ID
     */
    useAppointmentById(appointmentId: string) {
      return useQuery({
        key: () => ['appointments', appointmentId],
        query: async (): Promise<Appointment> => {
          const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('id', appointmentId)
            .single()

          if (error) throw error
          return data as Appointment
        },
        staleTime: 300_000, // 5 minutes
      })
    },

    /**
     * Fetch appointments for a specific technician
     */
    useAppointmentsByTechnician(technicianId: string, startDate?: string, endDate?: string) {
      return useQuery({
        key: () => ['appointments', 'technician', technicianId, startDate, endDate],
        query: async (): Promise<AppointmentCalendar[]> => {
          let query = supabase
            .from('appointment_calendar')
            .select('*')
            .eq('technician_name', technicianId)
            .order('appointment_date', { ascending: true })
            .order('start_time', { ascending: true })

          if (startDate) {
            query = query.gte('appointment_date', startDate)
          }
          if (endDate) {
            query = query.lte('appointment_date', endDate)
          }

          const { data, error } = await query

          if (error) throw error
          return (data ?? []) as AppointmentCalendar[]
        },
        staleTime: 60_000, // 1 minute
      })
    },

    /**
     * Create new appointment
     */
    async createAppointment(input: AppointmentInsert): Promise<Appointment> {
      const { data, error } = await supabase
        .from('appointments')
        .insert([input])
        .select()
        .single()

      if (error) throw error

      const created = data as Appointment
      const cache = useQueryCache()

      // Invalidate all appointment queries
      cache.invalidateQueries({ key: ['appointments'] })

      return created
    },

    /**
     * Update existing appointment
     */
    async updateAppointment(id: string, updates: AppointmentUpdate): Promise<Appointment> {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updated = data as Appointment
      const cache = useQueryCache()

      // Invalidate specific appointment and calendar queries
      cache.invalidateQueries({ key: ['appointments', id] })
      cache.invalidateQueries({ key: ['appointments', 'calendar'] })

      return updated
    },

    /**
     * Reschedule appointment (move to new date/time)
     */
    async rescheduleAppointment(
      id: string,
      appointmentDate: string,
      startTime: string,
      endTime: string
    ): Promise<Appointment> {
      return this.updateAppointment(id, {
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
      })
    },

    /**
     * Update appointment status
     */
    async updateAppointmentStatus(
      id: string,
      status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
    ): Promise<Appointment> {
      return this.updateAppointment(id, { status })
    },

    /**
     * Delete appointment
     */
    async deleteAppointment(id: string): Promise<void> {
      const { error } = await supabase.from('appointments').delete().eq('id', id)

      if (error) throw error

      const cache = useQueryCache()
      cache.invalidateQueries({ key: ['appointments'] })
    },

    /**
     * Set selected appointment
     */
    setSelectedAppointment(id: string | null): void {
      this.selectedAppointmentId = id
    },

    /**
     * Set selected date for filtering
     */
    setSelectedDate(date: string | null): void {
      this.selectedDate = date
    },
  },
})
