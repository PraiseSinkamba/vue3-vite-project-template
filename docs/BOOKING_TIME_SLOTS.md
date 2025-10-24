# Booking Time Slots Implementation

This document describes the time slot availability system for the booking flow.

## Overview

The booking system allows clients to select available time slots based on:
1. **Technician availability schedule** - Working hours for each day of the week
2. **Existing appointments** - Booked time slots that are unavailable
3. **Unavailable periods** - Scheduled breaks, vacations, exam periods, etc.
4. **Current time** - Past time slots are not available for today

## Architecture

### Database Function: `get_time_slots_for_day()`

**Location**: [supabase/migrations/20250121000001_create_get_time_slots_for_day_function.sql](../supabase/migrations/20250121000001_create_get_time_slots_for_day_function.sql)

#### Parameters

```sql
get_time_slots_for_day(
  p_date DATE,                          -- The date to check (e.g., '2025-01-21')
  p_technician_id UUID,                 -- The technician's ID
  p_service_duration_minutes INTEGER,   -- Service duration in minutes (default: 60)
  p_slot_interval_minutes INTEGER       -- Time slot interval (default: 30)
)
```

#### Returns

```sql
TABLE (
  time_slot TIME,           -- The start time of the slot (e.g., '09:00:00')
  is_available BOOLEAN,     -- Whether the slot is available
  reason TEXT               -- Reason if unavailable (e.g., 'Past time', 'Overlaps with existing appointment')
)
```

#### Logic Flow

1. **Extract day of week** from the provided date (0=Sunday, 6=Saturday)
2. **Fetch availability schedule** for the technician on that day
   - If no schedule exists, return empty (technician not working)
3. **Generate time slots** based on schedule start/end times and interval
4. **For each slot, check availability**:
   - ❌ **Past time check**: If today, is the slot in the past?
   - ❌ **Closing time check**: Would the service finish after closing time?
   - ❌ **Appointment overlap**: Does it conflict with existing appointments?
   - ❌ **Unavailable period overlap**: Does it conflict with vacation/break periods?
   - ✅ **Available**: If all checks pass

#### Example Query

```sql
-- Get available time slots for January 21, 2025
-- For a 90-minute service, with 30-minute intervals
SELECT *
FROM get_time_slots_for_day(
  '2025-01-21',
  'technician-uuid-here',
  90,  -- 90 minutes service
  30   -- 30 minute intervals
);
```

**Result**:
```
time_slot   | is_available | reason
------------|--------------|------------------------------------------
09:00:00    | true         | null
09:30:00    | true         | null
10:00:00    | false        | Overlaps with existing appointment
10:30:00    | false        | Overlaps with existing appointment
11:00:00    | true         | null
...
```

### TypeScript Types

**Location**: [src/types/index.ts:89-103](../src/types/index.ts#L89-L103)

```typescript
// RPC Function Types
export interface TimeSlot {
  time_slot: string
  is_available: boolean
  reason: string | null
}

export interface GetTimeSlotsForDayArgs {
  p_date: string
  p_technician_id: string
  p_service_duration_minutes?: number
  p_slot_interval_minutes?: number
}

export type GetTimeSlotsForDayReturn = TimeSlot[]
```

### Store Implementation

**Location**: [src/stores/booking.ts:147-193](../src/stores/booking.ts#L147-L193)

The `useBookingStore` provides a `useAvailableSlots()` action that:
1. Accepts reactive date and service duration
2. Calls the RPC function
3. Filters to only available slots
4. Formats time strings from `HH:MM:SS` to `HH:MM`
5. Returns array of available time strings

```typescript
// Usage in component
const bookingStore = useBookingStore()
const availableSlotsQuery = bookingStore.useAvailableSlots(localDate, totalDuration)

// Access data
const slots = availableSlotsQuery.data.value // ['09:00', '09:30', '11:00', ...]
const isLoading = availableSlotsQuery.isLoading.value
const error = availableSlotsQuery.error.value
```

### UI Component

**Location**: [src/components/client/booking/DateTimeSelector.vue](../src/components/client/booking/DateTimeSelector.vue)

The `DateTimeSelector` component:
1. Fetches available slots using the store action
2. Groups slots by time of day (morning/afternoon/evening)
3. Displays slots as clickable buttons
4. Shows loading/error/empty states using `ConditionalContent`
5. Formats times based on locale (24h for Turkish, 12h for English)

## Database Schema

### Tables Used

#### `availability_schedules`
- **Purpose**: Define technician working hours for each day of week
- **Key fields**: `technician_id`, `day_of_week`, `start_time`, `end_time`, `is_active`

#### `appointments`
- **Purpose**: Store booked appointments
- **Key fields**: `technician_id`, `appointment_date`, `start_time`, `end_time`, `status`

#### `unavailable_periods`
- **Purpose**: Store time periods when technician is unavailable
- **Key fields**: `technician_id`, `start_datetime`, `end_datetime`, `period_type`

## Time Slot Generation

### Default Settings
- **Slot interval**: 30 minutes
- **Business setting**: Configurable via `business_settings.slot_duration`

### Example Schedule

**Technician availability**: Monday 9:00 AM - 5:00 PM
**Service duration**: 90 minutes (1.5 hours)

**Generated slots**:
```
09:00 - ✅ Available (ends at 10:30, before closing)
09:30 - ✅ Available (ends at 11:00, before closing)
10:00 - ❌ Overlaps with appointment (10:00-11:30)
10:30 - ❌ Overlaps with appointment (10:00-11:30)
11:00 - ❌ Overlaps with appointment (10:00-11:30)
11:30 - ✅ Available (ends at 13:00, before closing)
...
15:30 - ✅ Available (ends at 17:00, exactly at closing)
16:00 - ❌ Service would extend past closing (would end at 17:30)
16:30 - ❌ Service would extend past closing (would end at 18:00)
```

## Performance Considerations

### Advantages of Database-Side Logic

1. **Reduced network traffic**: Only available slots returned
2. **Consistent logic**: Single source of truth for availability
3. **Optimized queries**: Database can efficiently check overlaps
4. **Scalability**: Handles complex schedules without client-side processing

### Caching Strategy

- **Stale time**: 60 seconds (1 minute)
- **Cache key**: Includes date and service duration
- **Invalidation**: When new appointment is created

## Future Enhancements

### Potential Improvements

1. **Buffer time between appointments**: Add configurable gap between bookings
2. **Concurrent bookings**: Support multiple technicians
3. **Peak pricing**: Different pricing for high-demand time slots
4. **Smart scheduling**: AI-powered slot recommendations
5. **Waitlist**: Allow clients to join waitlist for fully booked days
6. **Recurring unavailability**: Support recurring breaks (lunch, etc.)

### Migration Path

If additional business logic is needed:
1. Update the SQL function in a new migration
2. TypeScript types automatically reflect changes via Supabase type generation
3. Frontend code continues to work (backward compatible)

## Testing

### Manual Testing Checklist

- [ ] View available slots for a working day
- [ ] Verify past time slots are unavailable (for today)
- [ ] Book an appointment and verify slot becomes unavailable
- [ ] Create unavailable period and verify affected slots show as unavailable
- [ ] Test with different service durations
- [ ] Verify slots near closing time respect service duration
- [ ] Test day with no availability schedule (should show no slots)

### Test Data Setup

```sql
-- Insert test availability schedule (Monday 9 AM - 5 PM)
INSERT INTO availability_schedules (technician_id, day_of_week, start_time, end_time)
VALUES ('your-technician-id', 1, '09:00', '17:00');

-- Insert test appointment (10:00 - 11:30)
INSERT INTO appointments (
  technician_id, appointment_date, start_time, end_time,
  duration_minutes, status
)
VALUES (
  'your-technician-id', '2025-01-21', '10:00', '11:30',
  90, 'confirmed'
);

-- Insert unavailable period (lunch break 12:00 - 13:00)
INSERT INTO unavailable_periods (
  technician_id, title, start_datetime, end_datetime
)
VALUES (
  'your-technician-id', 'Lunch Break',
  '2025-01-21 12:00:00', '2025-01-21 13:00:00'
);
```

## Troubleshooting

### No slots showing

1. **Check availability schedule**: Ensure technician has schedule for that day of week
2. **Verify schedule is active**: Check `is_active = true`
3. **Check date**: Ensure date is not in the past
4. **Service duration**: Verify service duration doesn't exceed working hours

### Slots showing but can't book

1. **Check appointment status**: Ensure no conflicting appointments
2. **Verify unavailable periods**: Check for overlapping unavailable periods
3. **Time validation**: Ensure slot hasn't passed (for today)

### Type errors

1. **Regenerate types**: Run `npm run supabase:types`
2. **Check migration**: Ensure migration has been applied
3. **Restart dev server**: TypeScript may need to reload types

## Related Files

- Migration: [supabase/migrations/20250121000001_create_get_time_slots_for_day_function.sql](../supabase/migrations/20250121000001_create_get_time_slots_for_day_function.sql)
- Types: [src/types/index.ts](../src/types/index.ts)
- Store: [src/stores/booking.ts](../src/stores/booking.ts)
- Component: [src/components/client/booking/DateTimeSelector.vue](../src/components/client/booking/DateTimeSelector.vue)
- Page: [src/pages/(client)/booking.vue](../src/pages/(client)/booking.vue)
