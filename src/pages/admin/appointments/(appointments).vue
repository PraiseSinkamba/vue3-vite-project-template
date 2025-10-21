<script setup lang="ts">
import PageHeader from '@/components/ui/page/PageHeader.vue'
import { DayPilot, DayPilotCalendar } from '@daypilot/daypilot-lite-vue'
import { onMounted, ref, computed } from 'vue'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type ViewType = DayPilot.CalendarConfig['viewType']

// Appointment status type matching your schema
type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

interface CalendarEvent extends DayPilot.EventData {
  id: string | number
  start: string
  end: string
  text: string
  resource?: string // Required for Resources view
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

const selectedViewType = ref<ViewType>('Day')
const events = ref<CalendarEvent[]>([])
const startDate = ref<DayPilot.Date>(DayPilot.Date.today())
const calendarRef = ref<any>(null)

// Resource columns for "Resources" view (nail technicians)
const columns = ref<Column[]>([
  { name: 'Sophia (Main Tech)', id: 'tech-1' },
  // Add more technicians when needed:
  // { name: 'Maria (Assistant)', id: 'tech-2' }
])

// Helper function to get status color and info
const getStatusInfo = (status: AppointmentStatus) => {
  const statusConfig = {
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
type DateFn = () => DayPilot.Date
// Format time for display
const formatTime = (valueFn: DateFn) => {
  return valueFn().toString('h:mm tt')
}

// Format duration
const formatDuration = (start: DateFn, end: DateFn) => {
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

onMounted(() => {
  // Load dummy appointments based on your schema
  const today = DayPilot.Date.today()

  events.value = [
    {
      id: '1',
      start: today.addHours(10).toString(),
      end: today.addHours(11.5).toString(),
      text: 'Sarah Johnson - Gel Manicure',
      resource: 'tech-1',
      data: {
        appointmentNumber: 'APT-2025-001',
        clientName: 'Sarah Johnson',
        clientPhone: '+1 555-0101',
        status: 'confirmed',
        serviceName: 'Gel Manicure with Nail Art',
        quotedPrice: 45.0,
        technicianName: 'Sophia',
        specialRequests: 'French tips with glitter accent',
      },
    },
    {
      id: '2',
      start: today.addHours(12).toString(),
      end: today.addHours(13).toString(),
      text: 'Emma Davis - Pedicure',
      resource: 'tech-1',
      data: {
        appointmentNumber: 'APT-2025-002',
        clientName: 'Emma Davis',
        clientPhone: '+1 555-0102',
        status: 'in_progress',
        serviceName: 'Spa Pedicure',
        quotedPrice: 55.0,
        technicianName: 'Sophia',
        internalNotes: 'Regular customer, prefers warm water',
      },
    },
    {
      id: '3',
      start: today.addHours(14).toString(),
      end: today.addHours(15.5).toString(),
      text: 'Olivia Martinez - Full Set',
      resource: 'tech-1',
      data: {
        appointmentNumber: 'APT-2025-003',
        clientName: 'Olivia Martinez',
        clientPhone: '+1 555-0103',
        status: 'pending',
        bundleName: 'Full Set + Gel Polish',
        quotedPrice: 85.0,
        technicianName: 'Sophia',
        specialRequests: 'Almond shape, nude colors',
      },
    },
    {
      id: '4',
      start: today.addDays(1).addHours(10).toString(),
      end: today.addDays(1).addHours(11).toString(),
      text: 'Ava Wilson - Nail Repair',
      resource: 'tech-1',
      data: {
        appointmentNumber: 'APT-2025-004',
        clientName: 'Ava Wilson',
        clientPhone: '+1 555-0104',
        status: 'confirmed',
        serviceName: 'Nail Repair & Polish Change',
        quotedPrice: 30.0,
        technicianName: 'Sophia',
      },
    },
    {
      id: '5',
      start: today.addDays(2).addHours(15).toString(),
      end: today.addDays(2).addHours(17).toString(),
      text: 'Isabella Brown - Bridal Package',
      resource: 'tech-1',
      data: {
        appointmentNumber: 'APT-2025-005',
        clientName: 'Isabella Brown',
        clientPhone: '+1 555-0105',
        status: 'confirmed',
        bundleName: 'Bridal Manicure & Pedicure',
        quotedPrice: 120.0,
        technicianName: 'Sophia',
        specialRequests: 'Wedding on Saturday, elegant design',
        internalNotes: 'Friend booking - 2 bridesmaids coming later',
      },
    },
    {
      id: '6',
      start: today.addDays(-1).addHours(11).toString(),
      end: today.addDays(-1).addHours(12).toString(),
      text: 'Mia Anderson - Touch Up',
      resource: 'tech-1',
      data: {
        appointmentNumber: 'APT-2025-006',
        clientName: 'Mia Anderson',
        clientPhone: '+1 555-0106',
        status: 'completed',
        serviceName: 'Gel Polish Touch Up',
        quotedPrice: 25.0,
        finalPrice: 25.0,
        technicianName: 'Sophia',
      },
    },
  ]
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

function handleEventMove(args: EventMoveArgs) {
  console.log('Appointment rescheduled:', {
    appointmentId: args.e.data.id,
    oldStart: args.e.data.start,
    newStart: args.newStart.toString(),
    newEnd: args.newEnd.toString(),
    resource: args.newResource,
  })

  // Here you would update the appointment in your database
}

function handleEventResize(args: EventResizeArgs) {
  console.log('Appointment duration changed:', {
    appointmentId: args.e.data.id,
    oldDuration: args.e.data.end - args.e.data.start,
    newStart: args.newStart.toString(),
    newEnd: args.newEnd.toString(),
    newDuration: args.newEnd.getTime() - args.newStart.getTime(),
  })

  // Here you would update the appointment duration in your database
}

function handleEventClick(args: EventClickArgs) {
  const appointment = args.e.data
  console.log('Appointment clicked:', {
    id: appointment.id,
    appointmentNumber: appointment.data?.appointmentNumber,
    clientName: appointment.data?.clientName,
    clientPhone: appointment.data?.clientPhone,
    status: appointment.data?.status,
    service: appointment.data?.serviceName || appointment.data?.bundleName,
    price: appointment.data?.quotedPrice || appointment.data?.finalPrice,
    start: appointment.start,
    end: appointment.end,
    specialRequests: appointment.data?.specialRequests,
    internalNotes: appointment.data?.internalNotes,
  })

  // Here you would open a dialog/drawer to view/edit appointment details
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
    <div class="flex-1 border rounded-lg max-h-full bg-white shadow-sm">
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
