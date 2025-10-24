# Appointment Calendar Composables

## Overview

This composable provides utilities for transforming appointment data from Supabase into DayPilot calendar events, along with helper functions for status management and time formatting.

## Usage

### Basic Setup

```typescript
import { useAppointmentsStore } from '@/stores/appointments'
import { useAppointmentTransform, getStatusInfo, formatTime, formatDuration } from '@/composables/useAppointmentCalendar'
import { computed } from 'vue'

const appointmentsStore = useAppointmentsStore()

// Fetch appointments for a date range
const appointmentsQuery = appointmentsStore.useAppointmentCalendar('2025-01-01', '2025-01-31')

// Transform to calendar events
const { events } = useAppointmentTransform(
  computed(() => appointmentsQuery.data.value || []),
  computed(() => 'tech-1') // Optional: technician ID for resource view
)

// Use events in your calendar
// events.value will be an array of CalendarEvent objects
```

### Status Management

```typescript
import { getStatusInfo } from '@/composables/useAppointmentCalendar'

const statusInfo = getStatusInfo('confirmed')
// Returns:
// {
//   back: '#DBEAFE',      // Background color
//   border: '#3B82F6',    // Border color
//   bar: '#3B82F6',       // Bar color
//   badge: 'bg-blue-100 text-blue-800 border-blue-300', // Tailwind classes
//   icon: '✓',            // Status icon
//   label: 'Confirmed'    // Display label
// }
```

### Time Formatting

```typescript
import { formatTime, formatDuration } from '@/composables/useAppointmentCalendar'
import { DayPilot } from '@daypilot/daypilot-lite-vue'

// Format a single time
const timeStr = formatTime(() => DayPilot.Date.today().addHours(10))
// Returns: "10:00 AM"

// Format duration between two times
const durationStr = formatDuration(
  () => DayPilot.Date.today().addHours(10),
  () => DayPilot.Date.today().addHours(11.5)
)
// Returns: "1h 30min"
```

## Data Flow

1. **Supabase** → `appointment_calendar` view provides joined appointment data
2. **Store** → `useAppointmentsStore.useAppointmentCalendar()` fetches data
3. **Transform** → `useAppointmentTransform()` converts to DayPilot events
4. **Render** → DayPilot calendar displays events

## Types

### CalendarEvent

```typescript
interface CalendarEvent extends DayPilot.EventData {
  id: string | number
  start: string              // ISO datetime
  end: string                // ISO datetime
  text: string               // Display text
  resource?: string          // For resource view (technician ID)
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
```

### AppointmentStatus

```typescript
type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
```

## Store Actions

### Fetching Appointments

```typescript
// All appointments in date range
const query = appointmentsStore.useAppointmentCalendar('2025-01-01', '2025-01-31')

// By specific technician
const query = appointmentsStore.useAppointmentsByTechnician(techId, '2025-01-01', '2025-01-31')

// Single appointment
const query = appointmentsStore.useAppointmentById(appointmentId)
```

### Updating Appointments

```typescript
// Reschedule appointment
await appointmentsStore.rescheduleAppointment(
  appointmentId,
  '2025-01-15',      // New date
  '10:00:00',        // New start time
  '11:30:00'         // New end time
)

// Update status
await appointmentsStore.updateAppointmentStatus(appointmentId, 'confirmed')

// General update
await appointmentsStore.updateAppointment(appointmentId, {
  client_name: 'New Name',
  quoted_price: 50.00
})

// Delete
await appointmentsStore.deleteAppointment(appointmentId)
```

## Best Practices

1. **Query Keys**: The store automatically manages query keys based on date ranges and parameters
2. **Cache Invalidation**: Mutations automatically invalidate related queries
3. **Loading States**: Use `query.isLoading` for loading indicators
4. **Error Handling**: Use `query.status.value === 'error'` and `query.error.value` for errors
5. **Refetching**: Use `query.refresh()` to refetch data

## Example: Full Implementation

See [`src/pages/admin/appointments/(appointments).vue`](../../pages/admin/appointments/(appointments).vue) for a complete implementation example.
