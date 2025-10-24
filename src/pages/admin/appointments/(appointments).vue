<script setup lang="ts">
import PageHeader from '@/components/ui/page/PageHeader.vue'
import { DayPilot, DayPilotCalendar } from '@daypilot/daypilot-lite-vue'
import { ref, computed, watch } from 'vue'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAppointmentsStore } from '@/stores/appointments'
import {
  getStatusInfo,
  formatTime,
  formatDuration,
  useAppointmentTransform,
} from '@/composables/useAppointmentCalendar'

type ViewType = DayPilot.CalendarConfig['viewType']

interface Column {
  name: string
  id: string
}

interface TimeRangeSelection {
  start: DayPilot.Date
  end: DayPilot.Date
  resource?: string
}

interface EventMoveArgs {
  e: any
  newStart: DayPilot.Date
  newEnd: DayPilot.Date
  newResource?: string
}

interface EventResizeArgs {
  e: any
  newStart: DayPilot.Date
  newEnd: DayPilot.Date
}

interface EventClickArgs {
  e: any
}

// Store setup
const appointmentsStore = useAppointmentsStore()

// UI state
const selectedViewType = ref<ViewType>('Day')
const startDate = ref<DayPilot.Date>(DayPilot.Date.today())
const calendarRef = ref<any>(null)

// Resource columns for "Resources" view (nail technicians)
const columns = ref<Column[]>([
  { name: 'Sophia (Main Tech)', id: 'tech-1' },
  // Add more technicians when needed:
  // { name: 'Maria (Assistant)', id: 'tech-2' }
])

// Calculate date range for fetching appointments
const dateRange = computed(() => {
  const start = startDate.value
  const viewType = selectedViewType.value

  let endDate: DayPilot.Date

  if (viewType === 'Day') {
    endDate = start.addDays(1)
  } else if (viewType === 'Week') {
    endDate = start.addDays(7)
  } else {
    endDate = start.addDays(7) // Default to week
  }

  return {
    start: start.toString('yyyy-MM-dd'),
    end: endDate.toString('yyyy-MM-dd'),
  }
})

// Fetch appointments using store
const appointmentsQuery = appointmentsStore.useAppointmentCalendar(
  dateRange.value.start,
  dateRange.value.end
)

// Transform appointments to calendar events
const { events } = useAppointmentTransform(
  computed(() => appointmentsQuery.data.value || []),
  computed(() => 'tech-1') // Default technician ID for resource view
)

// Refetch when date range changes
watch(dateRange, () => {
  // The query key includes the date range, so it will automatically refetch
  appointmentsQuery.refresh()
})

function handleTimeRangeSelection(args: TimeRangeSelection) {
  console.log('Time range selected:', {
    start: args.start.toString(),
    end: args.end.toString(),
    resource: args.resource,
    duration: args.end.getTime() - args.start.getTime(),
  })

  // Here you would open a dialog/drawer to create a new appointment
  // For now, just logging to console
}

async function handleEventMove(args: EventMoveArgs) {
  const appointmentId = args.e.data.id as string
  const newDate = args.newStart.toString('yyyy-MM-dd')
  const newStartTime = args.newStart.toString('HH:mm:ss')
  const newEndTime = args.newEnd.toString('HH:mm:ss')

  try {
    await appointmentsStore.rescheduleAppointment(appointmentId, newDate, newStartTime, newEndTime)
    console.log('Appointment rescheduled successfully')
  } catch (error) {
    console.error('Failed to reschedule appointment:', error)
    // TODO: Show error toast/notification
    // Revert the UI change by refreshing
    appointmentsQuery.refresh()
  }
}

async function handleEventResize(args: EventResizeArgs) {
  const appointmentId = args.e.data.id as string
  const appointmentDate = args.newStart.toString('yyyy-MM-dd')
  const newStartTime = args.newStart.toString('HH:mm:ss')
  const newEndTime = args.newEnd.toString('HH:mm:ss')

  try {
    await appointmentsStore.rescheduleAppointment(appointmentId, appointmentDate, newStartTime, newEndTime)
    console.log('Appointment duration updated successfully')
  } catch (error) {
    console.error('Failed to update appointment duration:', error)
    // TODO: Show error toast/notification
    // Revert the UI change by refreshing
    appointmentsQuery.refresh()
  }
}

function handleEventClick(args: EventClickArgs) {
  const appointmentId = args.e.data.id as string
  appointmentsStore.setSelectedAppointment(appointmentId)

  console.log('Appointment selected:', {
    id: appointmentId,
    data: args.e.data.data,
  })

  // TODO: Open a sheet/drawer to view/edit appointment details
}

// Custom event rendering with shadcn-style design
function onBeforeEventRender(args: DayPilot.CalendarBeforeEventRenderArgs) {
  const statusInfo = getStatusInfo(args.data.data.status || 'pending')
  // Set background color based on status
  args.data.backColor = statusInfo.back
  args.data.borderColor = statusInfo.border
  args.data.fontColor = '#1F2937'
}

function styleColumnHeader(args: DayPilot.CalendarBeforeHeaderRenderArgs) {
  // args.header.cssClass = 'text-xs font-medium text-gray-500'
  // args.header.backColor
  // args.header.html = `` html string

}
function previousPeriod() {
  const subtractDays = selectedViewType.value === 'Day' ? 1 : 7
  startDate.value = startDate.value.addDays(subtractDays * -1)
}
function nextPeriod() {
  const addDays = selectedViewType.value === 'Day' ? 1 : 7
  startDate.value = startDate.value.addDays(addDays)
}
function today() {
  startDate.value = DayPilot.Date.today()
}
function printEvent(event: DayPilot.Event) { }
// Calendar configuration

//TODO: create height reactive property that listens to height changes of the page content and updates the calendar height accordingly
//TODO: update layout to be 3 row column layout HEADER_SECTION<PageHeader,with navigation buttons,and view select>, Calendar (flex-1), FOOTER<Legend>, this is give the best UI/UX possible to the page are not both scrollable
const calendarConfig = computed<DayPilot.CalendarConfig>(
  () =>
    ({
      viewType: selectedViewType.value,
      startDate: startDate.value,
      events: events.value,
      // Business hours (9 AM - 5 PM)
      dayBeginsHour: 9,
      businessBeginsHour: 9,
      businessEndsHour: 17,
      // Time scale - 30-minute slots (matching slot_duration from business_settings)
      cellDuration: 15,
      cellHeight: 50,
      // Visual settings
      durationBarVisible: false,
      eventBorderRadius: 8,
      timeRangeSelectedHandling: 'Enabled',
      eventMoveHandling: 'Update',
      eventResizeHandling: 'Update',
      eventClickHandling: 'Enabled',
      // Height mode
      heightSpec: 'BusinessHours',
      headerHeightAutoFit: true,
      headerTextWrappingEnabled: true,
      // Show current time indicator
      showCurrentTime: true,
      currentTimeIndicatorColor: '#F59E0B',

      // Weekend handling
      weekStarts: 0, // Sunday

      // Header format
      headerDateFormat: 'dddd M/d',

      // Columns for Resources view
      columns: selectedViewType.value === 'Resources' ? columns.value : undefined,

      // Event appearance
      eventHeight: 'auto',
      eventMarginBottom: 2,
      onTimeRangeSelected: handleTimeRangeSelection,
      onEventMove: handleEventMove,
      onEventResize: handleEventResize,
      onEventClick: handleEventClick,
      onBeforeEventRender: onBeforeEventRender,
      onBeforeHeaderRender: styleColumnHeader
    }) as DayPilot.CalendarConfig,
)

function parseTime(cell: DayPilot.CalendarBeforeCellRenderArgs['cell']) {
  console.log(cell)
  return cell.start.toString('hh:mm tt')
}
</script>

<template>
  <PageHeader hide-back-button>
    <template #title>
      <span class="font-bold text-2xl">My Booking Diary</span>
    </template>
    <template #description>Manage your client appointments</template>
  </PageHeader>
  <div class="flex flex-col gap-4 h-full">
    <!-- View Toggle -->
    <div class="flex items-center flex-col md:flex-row md:justify-between pb-6">
      <ToggleGroup type="single" v-model:model-value="selectedViewType">
        <ToggleGroupItem value="Day" aria-label="View single day schedule"> Day </ToggleGroupItem>
        <ToggleGroupItem value="Week" aria-label="View week schedule"> Week </ToggleGroupItem>

      </ToggleGroup>

      <!-- Optional: Add navigation buttons -->
      <div class="flex gap-2">
        <button @click="previousPeriod" class="px-3 py-1 text-sm border rounded hover:bg-gray-50">
          ← Previous
        </button>
        <button @click="today" class="px-3 py-1 text-sm border rounded hover:bg-gray-50">
          Today
        </button>
        <button @click="nextPeriod" class="px-3 py-1 text-sm border rounded hover:bg-gray-50">
          Next →
        </button>
      </div>
    </div>

    <!-- Calendar -->
    <div class="flex-1 border rounded-lg max-h-full bg-white shadow-sm relative">
      <!-- Loading overlay -->
      <div v-if="appointmentsQuery.isLoading.value"
        class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm text-muted-foreground">Loading appointments...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="appointmentsQuery.status.value === 'error'"
        class="absolute inset-0 bg-white flex items-center justify-center z-50 rounded-lg">
        <div class="flex flex-col items-center gap-3 text-center p-6">
          <svg class="w-12 h-12 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 class="font-semibold text-lg mb-1">Failed to load appointments</h3>
            <p class="text-sm text-muted-foreground mb-4">{{ appointmentsQuery.error.value?.message }}</p>
            <button @click="appointmentsQuery.refresh()"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition">
              Try Again
            </button>
          </div>
        </div>
      </div>

      <DayPilotCalendar ref="calendarRef" :config="calendarConfig">
        <template #cell="args">
          <span class="text-muted-foreground/50 w-full h-full flex justify-center items-center font-mono text-3xl">{{
            parseTime(args.cell) }}</span>
        </template>

        <template #event="{ event }">
          <div class="p-2.5 h-full flex flex-col justify-between gap-1.5 overflow-hidden">
            <!-- Header with status badge -->
            <div class="flex items-start justify-between gap-2 min-h-0">
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-sm text-gray-900 truncate leading-tight">
                  {{ event.data.data?.clientName }}
                </div>
              </div>
              <div class="flex-shrink-0">
                <span :class="[
                  'inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium border',
                  getStatusInfo(event.data.data?.status || 'pending').badge,
                  printEvent(event),
                ]">
                  <span class="mr-1">{{
                    getStatusInfo(event.data.data?.status || 'pending').icon
                  }}</span>
                  <span class="hidden sm:inline">{{
                    getStatusInfo(event.data.data?.status || 'pending').label
                  }}</span>
                </span>
              </div>
            </div>

            <!-- Service name -->
            <div class="text-xs text-gray-700 font-medium truncate leading-tight">
              {{ event.data.data?.serviceName || event.data.data?.bundleName }}
            </div>

            <!-- Time and price -->
            <div class="flex items-center justify-between gap-2 text-xs mt-auto">
              <div class="flex items-center gap-1 text-gray-600">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-medium">{{ formatTime(event.start) }}</span>
                <span class="text-gray-400">·</span>
                <span class="text-gray-500">{{ formatDuration(event.start, event.end) }}</span>
              </div>
              <template v-if="event.data.data?.quotedPrice || event.data.data?.finalPrice">
                <div class="flex items-center gap-0.5 text-gray-700 font-semibold">
                  <span class="text-xs">$</span>
                  <span>{{
                    (event.data.data?.quotedPrice || event.data.data?.finalPrice).toFixed(0)
                  }}</span>
                </div>
              </template>
            </div>
            <!-- Special indicators -->
            <div class="flex gap-1 mt-0.5">
              <span v-if="event.data.data?.specialRequests"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
                <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z">
                  </path>
                </svg>
                <span class="hidden sm:inline">Note</span>
              </span>
              <span v-if="event.data.data?.internalNotes?.includes('Friend booking')"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-pink-50 text-pink-700 border border-pink-200">
                <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z">
                  </path>
                </svg>
                <span class="hidden sm:inline">Group</span>
              </span>
            </div>
          </div>
        </template>
      </DayPilotCalendar>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-3 text-sm p-3 bg-white border rounded-lg">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-100"></div>
        <span class="text-gray-700 font-medium">Pending</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-blue-400 ring-2 ring-blue-100"></div>
        <span class="text-gray-700 font-medium">Confirmed</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-purple-400 ring-2 ring-purple-100"></div>
        <span class="text-gray-700 font-medium">In Progress</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-green-400 ring-2 ring-green-100"></div>
        <span class="text-gray-700 font-medium">Completed</span>
      </div>
      <div class="text-gray-400 mx-2">|</div>
      <div class="flex items-center gap-1.5 text-amber-700">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z">
          </path>
        </svg>
        <span class="font-medium">Has special request</span>
      </div>
      <div class="flex items-center gap-1.5 text-pink-700">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z">
          </path>
        </svg>
        <span class="font-medium">Group booking</span>
      </div>
    </div>
  </div>
</template>

<style>
/* Custom DayPilot calendar styling */
.daypilot_calendar_main {
  font-family: inherit;
  border: none !important;
}

/* Time header styling */
.daypilot_calendar_header_col {
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  border-bottom: 2px solid #e5e7eb !important;
  font-weight: 600;
  color: #374151;
}

/* Hour cells */
.daypilot_calendar_rowheader_inner {
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Cell styling */
.daypilot_calendar_cell {
  border-color: #f3f4f6 !important;
}

/* Business hours cells */
.daypilot_calendar_cell_business {
  background-color: #ffffff !important;
}

/* Non-business hours */
.daypilot_calendar_cell:not(.daypilot_calendar_cell_business) {
  background-color: #f9fafb !important;
}

/* Event styling */
.daypilot_event {
  border-width: 2px !important;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  cursor: pointer;
}

.daypilot_event:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
  z-index: 100 !important;
}

/* Event inner content */
.daypilot_event_inner {
  padding: 0 !important;
  border-radius: 6px;
  overflow: hidden;
}

/* Current time indicator */
.daypilot_now {
  background-color: #f59e0b !important;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

/* Selection styling */
.daypilot_shadow {
  background-color: rgba(59, 130, 246, 0.2) !important;
  border: 2px dashed #3b82f6 !important;
  border-radius: 6px;
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .daypilot_event {
    font-size: 0.75rem;
  }

  .daypilot_calendar_cell {
    min-height: 30px;
  }
}

/* Scrollbar styling */
.daypilot_calendar_main::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.daypilot_calendar_main::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.daypilot_calendar_main::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.daypilot_calendar_main::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
