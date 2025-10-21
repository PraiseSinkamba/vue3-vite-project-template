<script setup lang="ts">
import {
  CalendarDate,
  type DateValue,
  isEqualMonth,
  getLocalTimeZone,
  today,
} from '@internationalized/date'

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import { type DateRange, RangeCalendarRoot, useDateFormatter } from 'reka-ui'

import { createMonth, type Grid, toDate } from 'reka-ui/date'
import { type Ref, ref, watch, computed } from 'vue'
import { cn } from '@/lib/utils.ts'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
} from '@/components/ui/range-calendar'

// Props and emits for v-model support
interface Props {
  modelValue?: DateRange
  placeholder?: string
  disabled?: boolean
  className?: string
  applyButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pick a date range',
  disabled: false,
  className: 'w-[280px]',
  applyButton: false
})

const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
}>()

// Internal value that syncs with modelValue
const internalValue = ref<DateRange>(
  props.modelValue || {
    start: new CalendarDate(2022, 1, 20),
    end: new CalendarDate(2022, 1, 20).add({ days: 20 }),
  }
)

// Temporary value for apply button mode
const tempValue = ref<DateRange>(internalValue.value)

// Popover open state
const isOpen = ref(false)

// Sync internal value with modelValue prop
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    internalValue.value = newValue
    tempValue.value = newValue
  }
}, { immediate: true })

// Emit changes to parent (only when not using apply button)
watch(internalValue, (newValue) => {
  if (!props.applyButton) {
    emit('update:modelValue', newValue)
  }
}, { deep: true })

// Update temp value when internal value changes (for apply button mode)
watch(internalValue, (newValue) => {
  if (props.applyButton) {
    tempValue.value = newValue
  }
}, { deep: true })

const locale = ref('en-US')
const formatter = useDateFormatter(locale.value)

const calendarPlaceholder = ref(internalValue.value.start) as Ref<DateValue>
const secondMonthPlaceholder = ref(internalValue.value.end) as Ref<DateValue>

const firstMonth = ref(
  createMonth({
    dateObj: calendarPlaceholder.value,
    locale: locale.value,
    fixedWeeks: true,
    weekStartsOn: 0,
  }),
) as Ref<Grid<DateValue>>

const secondMonth = ref(
  createMonth({
    dateObj: secondMonthPlaceholder.value,
    locale: locale.value,
    fixedWeeks: true,
    weekStartsOn: 0,
  }),
) as Ref<Grid<DateValue>>

function updateMonth(reference: 'first' | 'second', months: number) {
  if (reference === 'first') {
    calendarPlaceholder.value = calendarPlaceholder.value.add({ months })
  }
  else {
    secondMonthPlaceholder.value = secondMonthPlaceholder.value.add({
      months,
    })
  }
}

watch(calendarPlaceholder, (_placeholder) => {
  firstMonth.value = createMonth({
    dateObj: _placeholder,
    weekStartsOn: 0,
    fixedWeeks: false,
    locale: locale.value,
  })
  if (isEqualMonth(secondMonthPlaceholder.value, _placeholder)) {
    secondMonthPlaceholder.value = secondMonthPlaceholder.value.add({
      months: 1,
    })
  }
})

watch(secondMonthPlaceholder, (_secondMonthPlaceholder) => {
  secondMonth.value = createMonth({
    dateObj: _secondMonthPlaceholder,
    weekStartsOn: 0,
    fixedWeeks: false,
    locale: locale.value,
  })
  if (isEqualMonth(_secondMonthPlaceholder, calendarPlaceholder.value))
    calendarPlaceholder.value = calendarPlaceholder.value.subtract({ months: 1 })
})

// Date preset functions
const todayDate = today(getLocalTimeZone())

const presets = [
  {
    label: 'Today',
    range: computed(() => ({
      start: todayDate,
      end: todayDate.add({days:1}),
    }))
  },
  {
    label: 'Yesterday',
    range: computed(() => ({
      start: todayDate.subtract({ days: 1 }),
      end: todayDate.subtract({ days: 1 }),
    }))
  },
  {
    label: 'Last 7 days',
    range: computed(() => ({
      start: todayDate.subtract({ days: 6 }),
      end: todayDate,
    }))
  },
  {
    label: 'Last 30 days',
    range: computed(() => ({
      start: todayDate.subtract({ days: 29 }),
      end: todayDate,
    }))
  },
  {
    label: 'Month to date',
    range: computed(() => ({
      start: todayDate.subtract({ days: todayDate.day - 1 }),
      end: todayDate,
    }))
  },
  {
    label: 'Last month',
    range: computed(() => {
      const lastMonth = todayDate.subtract({ months: 1 })
      const startOfLastMonth = lastMonth.subtract({ days: lastMonth.day - 1 })
      const endOfLastMonth = startOfLastMonth.add({ days: lastMonth.calendar.getDaysInMonth(lastMonth) - 1 })
      return {
        start: startOfLastMonth,
        end: endOfLastMonth,
      }
    })
  },
  {
    label: 'Year to date',
    range: computed(() => ({
      start: new CalendarDate(todayDate.year, 1, 1),
      end: todayDate,
    }))
  },
  {
    label: 'Last year',
    range: computed(() => ({
      start: new CalendarDate(todayDate.year - 1, 1, 1),
      end: new CalendarDate(todayDate.year - 1, 12, 31),
    }))
  }
]

function selectPreset(preset: typeof presets[0]) {
  if (props.applyButton) {
    tempValue.value = preset.range.value
    internalValue.value = preset.range.value
  } else {
    internalValue.value = preset.range.value
  }
  calendarPlaceholder.value = preset.range.value.start
  secondMonthPlaceholder.value = preset.range.value.end
}

// Apply button functionality
function applyDateRange() {
  emit('update:modelValue', tempValue.value)
  isOpen.value = false
}

function cancelDateRange() {
  // Reset temp value to current model value
  tempValue.value = props.modelValue || internalValue.value
  internalValue.value = props.modelValue || internalValue.value
  isOpen.value = false
}

// Display value for the button
const displayValue = computed(() => {
  const valueToShow = props.applyButton ? (props.modelValue || internalValue.value) : internalValue.value

  if (valueToShow?.start) {
    if (valueToShow.end) {
      return `${formatter.custom(toDate(valueToShow.start), {
        dateStyle: "medium",
      })} - ${formatter.custom(toDate(valueToShow.end), {
        dateStyle: "medium",
      })}`
    } else {
      return formatter.custom(toDate(valueToShow.start), {
        dateStyle: "medium",
      })
    }
  }
  return props.placeholder
})
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :disabled="disabled"
        :class="
          cn(
            'justify-start text-left font-normal',
            className,
            !internalValue && 'text-muted-foreground',
          )
        "
      >
        <Calendar class="mr-2 h-4 w-4" />
        {{ displayValue }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <div class="flex">
        <!-- Presets sidebar -->
        <div class="flex flex-col gap-1 border-r p-3 pr-4">
          <div class="text-sm font-medium text-muted-foreground mb-2">Presets</div>
          <Button
            v-for="preset in presets"
            :key="preset.label"
            variant="ghost"
            size="sm"
            class="justify-start text-left font-normal h-auto p-2 text-sm"
            @click="selectPreset(preset)"
          >
            {{ preset.label }}
          </Button>
        </div>

        <!-- Calendar section -->
        <div class="p-3">
          <RangeCalendarRoot
            v-slot="{ weekDays }"
            v-model="internalValue"
            v-model:placeholder="calendarPlaceholder"
          >
            <div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <button
                    :class="
                      cn(
                        buttonVariants({ variant: 'outline' }),
                        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                      )
                    "
                    @click="updateMonth('first', -1)"
                  >
                    <ChevronLeft class="h-4 w-4" />
                  </button>
                  <div :class="cn('text-sm font-medium')">
                    {{
                      formatter.fullMonthAndYear(
                        toDate(firstMonth.value),
                      )
                    }}
                  </div>
                  <button
                    :class="
                      cn(
                        buttonVariants({ variant: 'outline' }),
                        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                      )
                    "
                    @click="updateMonth('first', 1)"
                  >
                    <ChevronRight class="h-4 w-4" />
                  </button>
                </div>
                <RangeCalendarGrid>
                  <RangeCalendarGridHead>
                    <RangeCalendarGridRow>
                      <RangeCalendarHeadCell
                        v-for="day in weekDays"
                        :key="day"
                        class="w-full"
                      >
                        {{ day }}
                      </RangeCalendarHeadCell>
                    </RangeCalendarGridRow>
                  </RangeCalendarGridHead>
                  <RangeCalendarGridBody>
                    <RangeCalendarGridRow
                      v-for="(
                        weekDates, index
                      ) in firstMonth.rows"
                      :key="`weekDate-${index}`"
                      class="mt-2 w-full"
                    >
                      <RangeCalendarCell
                        v-for="weekDate in weekDates"
                        :key="weekDate.toString()"
                        :date="weekDate"
                      >
                        <RangeCalendarCellTrigger
                          :day="weekDate"
                          :month="firstMonth.value"
                        />
                      </RangeCalendarCell>
                    </RangeCalendarGridRow>
                  </RangeCalendarGridBody>
                </RangeCalendarGrid>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <button
                    :class="
                      cn(
                        buttonVariants({ variant: 'outline' }),
                        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                      )
                    "
                    @click="updateMonth('second', -1)"
                  >
                    <ChevronLeft class="h-4 w-4" />
                  </button>
                  <div :class="cn('text-sm font-medium')">
                    {{
                      formatter.fullMonthAndYear(
                        toDate(secondMonth.value),
                      )
                    }}
                  </div>

                  <button
                    :class="
                      cn(
                        buttonVariants({ variant: 'outline' }),
                        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                      )
                    "
                    @click="updateMonth('second', 1)"
                  >
                    <ChevronRight class="h-4 w-4" />
                  </button>
                </div>
                <RangeCalendarGrid>
                  <RangeCalendarGridHead>
                    <RangeCalendarGridRow>
                      <RangeCalendarHeadCell
                        v-for="day in weekDays"
                        :key="day"
                        class="w-full"
                      >
                        {{ day }}
                      </RangeCalendarHeadCell>
                    </RangeCalendarGridRow>
                  </RangeCalendarGridHead>
                  <RangeCalendarGridBody>
                    <RangeCalendarGridRow
                      v-for="(
                        weekDates, index
                      ) in secondMonth.rows"
                      :key="`weekDate-${index}`"
                      class="mt-2 w-full"
                    >
                      <RangeCalendarCell
                        v-for="weekDate in weekDates"
                        :key="weekDate.toString()"
                        :date="weekDate"
                      >
                        <RangeCalendarCellTrigger
                          :day="weekDate"
                          :month="secondMonth.value"
                        />
                      </RangeCalendarCell>
                    </RangeCalendarGridRow>
                  </RangeCalendarGridBody>
                </RangeCalendarGrid>
              </div>
            </div>

            <!-- Apply/Cancel buttons -->
            <div v-if="applyButton" class="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" @click="cancelDateRange">
                Cancel
              </Button>
              <Button size="sm" @click="applyDateRange">
                Apply
              </Button>
            </div>
          </RangeCalendarRoot>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
