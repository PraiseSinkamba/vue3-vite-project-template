import { computed, type Ref } from 'vue'
import { DayPilot } from '@daypilot/daypilot-lite-vue'
import type { AppointmentCalendar } from '@/types'

/**
 * Appointment status type from database schema
 */
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

/**
 * DayPilot calendar event with appointment data
 */
export interface CalendarEvent extends DayPilot.EventData {
  id: string | number
  start: string
  end: string
  text: string
  resource?: string
  backColor?: string
  borderColor?: string
  barColor?: string
  cssClass?: string
  data: {
    appointmentNumber: string
    clientName: string
    clientPhone: string
    status: AppointmentStatus
    serviceName?: string
    bundleName?: string
    quotedPrice?: number
    finalPrice?: number
    technicianName?: string
    specialRequests?: string
    internalNotes?: string
  }
}

/**
 * Status styling configuration
 */
interface StatusConfig {
  back: string
  border: string
  bar: string
  badge: string
  icon: string
  label: string
}

/**
 * Get status color and styling information
 */
export function getStatusInfo(status: AppointmentStatus): StatusConfig {
  const statusConfig: Record<AppointmentStatus, StatusConfig> = {
    pending: {
      back: '#FEF3C7',
      border: '#F59E0B',
      bar: '#F59E0B',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: '⏳',
      label: 'Pending',
    },
    confirmed: {
      back: '#DBEAFE',
      border: '#3B82F6',
      bar: '#3B82F6',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '✓',
      label: 'Confirmed',
    },
    in_progress: {
      back: '#E9D5FF',
      border: '#A855F7',
      bar: '#A855F7',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: '▶',
      label: 'In Progress',
    },
    completed: {
      back: '#D1FAE5',
      border: '#10B981',
      bar: '#10B981',
      badge: 'bg-green-100 text-green-800 border-green-300',
      icon: '✓',
      label: 'Completed',
    },
    cancelled: {
      back: '#FEE2E2',
      border: '#EF4444',
      bar: '#EF4444',
      badge: 'bg-red-100 text-red-800 border-red-300',
      icon: '✕',
      label: 'Cancelled',
    },
    no_show: {
      back: '#F3F4F6',
      border: '#6B7280',
      bar: '#6B7280',
      badge: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: '◯',
      label: 'No Show',
    },
  }
  return statusConfig[status] || statusConfig.pending
}

/**
 * Transform appointment calendar row to DayPilot event
 */
export function transformToCalendarEvent(
  appointment: AppointmentCalendar,
  technicianId?: string
): CalendarEvent | null {
  // Skip if missing required data
  if (!appointment.id || !appointment.appointment_date || !appointment.start_time || !appointment.end_time) {
    return null
  }

  const appointmentDate = appointment.appointment_date
  const startDateTime = `${appointmentDate}T${appointment.start_time}`
  const endDateTime = `${appointmentDate}T${appointment.end_time}`

  const serviceName = appointment.service_name || appointment.bundle_name || 'Unknown Service'
  const clientName = appointment.client_name || 'Walk-in Client'

  return {
    id: appointment.id,
    start: startDateTime,
    end: endDateTime,
    text: `${clientName} - ${serviceName}`,
    resource: technicianId, // For Resources view
    data: {
      appointmentNumber: appointment.appointment_number || '',
      clientName,
      clientPhone: appointment.client_phone || '',
      status: (appointment.status as AppointmentStatus) || 'pending',
      serviceName: appointment.service_name || undefined,
      bundleName: appointment.bundle_name || undefined,
      quotedPrice: appointment.quoted_price || undefined,
      finalPrice: appointment.final_price || undefined,
      technicianName: appointment.technician_name || undefined,
    },
  }
}

/**
 * Transform array of appointments to calendar events
 */
export function useAppointmentTransform(
  appointments: Ref<AppointmentCalendar[]>,
  technicianId?: Ref<string | undefined>
) {
  const events = computed<CalendarEvent[]>(() => {
    return appointments.value
      .map((appointment) => transformToCalendarEvent(appointment, technicianId?.value))
      .filter((event): event is CalendarEvent => event !== null)
  })

  return {
    events,
  }
}

/**
 * Format time for display (DayPilot.Date to readable format)
 */
export function formatTime(dateFn: () => DayPilot.Date): string {
  return dateFn().toString('h:mm tt')
}

/**
 * Format duration between two times
 */
export function formatDuration(start: () => DayPilot.Date, end: () => DayPilot.Date): string {
  const startDate = start()
  const endDate = end()
  const minutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)

  if (minutes < 60) {
    return `${minutes}min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
}
