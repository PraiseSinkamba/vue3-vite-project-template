// DatePicker.vue
<template>
  <div class="date-picker">
    <!-- Desktop: Popover -->
    <Popover v-model:open="isOpen" v-if="!isMobile">
      <PopoverTrigger as-child>
        <Button variant="outline" :class="cn(
          'w-full justify-start text-left font-normal',
          !modelValue && 'text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500'
        )" :disabled="disabled" @click="handleTriggerClick">
          <CalendarIcon class="mr-2 h-4 w-4" />
          {{ displayValue }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <div class="p-3">
          <!-- Year/Month selector -->
          <div class="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" @click="navigateMonth(-1)" :disabled="isMinDateReached">
              <ChevronLeft class="h-4 w-4" />
            </Button>

            <div class="flex items-center space-x-2">
              <Select v-model="selectedMonth">
                <SelectTrigger class="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="(month, index) in months" :key="index" :value="index.toString()">
                    {{ month }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select v-model="selectedYear">
                <SelectTrigger class="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="year in availableYears" :key="year" :value="year.toString()">
                    {{ year }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="ghost" size="sm" @click="navigateMonth(1)" :disabled="isMaxDateReached">
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>

          <!-- Calendar grid -->
          <div class="grid grid-cols-7 gap-1 mb-4">
            <!-- Day headers -->
            <div v-for="day in orderedDayHeaders" :key="day"
              class="text-center text-sm font-medium text-muted-foreground p-2">
              {{ day }}
            </div>

            <!-- Calendar days -->
            <Button v-for="day in calendarDays" :key="`${day.date}-${day.isCurrentMonth}`" variant="ghost" size="sm"
              :class="getDayButtonClass(day)" :disabled="isDayDisabled(day)" @click="selectDate(day)">
              {{ day.day }}
            </Button>
          </div>

          <!-- Action buttons -->
          <div class="flex justify-between items-center pt-2 border-t">
            <Button variant="ghost" size="sm" @click="selectToday" :disabled="isTodayDisabled">
              {{ getTodayButtonText() }}
            </Button>

            <div class="flex space-x-2">
              <Button variant="ghost" size="sm" @click="clear" v-if="clearable && modelValue">
                {{ getClearButtonText() }}
              </Button>
              <Button variant="ghost" size="sm" @click="isOpen = false">
                {{ getCancelButtonText() }}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <!-- Mobile: Drawer -->
    <Drawer v-model:open="isOpen" v-else>
      <DrawerTrigger as-child>
        <Button variant="outline" :class="cn(
          'w-full justify-start text-left font-normal',
          !modelValue && 'text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500'
        )" :disabled="disabled" @click="handleTriggerClick">
          <CalendarIcon class="mr-2 h-4 w-4" />
          {{ displayValue }}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader class="text-left">
          <DrawerTitle>{{ placeholder }}</DrawerTitle>
        </DrawerHeader>
        <div class="p-4 pb-8">
          <!-- Year/Month selector -->
          <div class="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" @click="navigateMonth(-1)" :disabled="isMinDateReached">
              <ChevronLeft class="h-4 w-4" />
            </Button>

            <div class="flex items-center space-x-2">
              <Select v-model="selectedMonth">
                <SelectTrigger class="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="(month, index) in months" :key="index" :value="index.toString()">
                    {{ month }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select v-model="selectedYear">
                <SelectTrigger class="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="year in availableYears" :key="year" :value="year.toString()">
                    {{ year }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="ghost" size="sm" @click="navigateMonth(1)" :disabled="isMaxDateReached">
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>

          <!-- Calendar grid -->
          <div class="grid grid-cols-7 gap-1 mb-4">
            <!-- Day headers -->
            <div v-for="day in orderedDayHeaders" :key="day"
              class="text-center text-sm font-medium text-muted-foreground p-2">
              {{ day }}
            </div>

            <!-- Calendar days -->
            <Button v-for="day in calendarDays" :key="`${day.date}-${day.isCurrentMonth}`" variant="ghost" size="sm"
              :class="getDayButtonClass(day)" :disabled="isDayDisabled(day)" @click="selectDate(day)">
              {{ day.day }}
            </Button>
          </div>

          <!-- Action buttons -->
          <div class="flex justify-between items-center pt-2 border-t">
            <Button variant="ghost" size="sm" @click="selectToday" :disabled="isTodayDisabled">
              {{ getTodayButtonText() }}
            </Button>

            <div class="flex space-x-2">
              <Button variant="ghost" size="sm" @click="clear" v-if="clearable && modelValue">
                {{ getClearButtonText() }}
              </Button>
              <Button variant="ghost" size="sm" @click="isOpen = false">
                {{ getCancelButtonText() }}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>

    <!-- Error message -->
    <div v-if="error" class="text-sm text-red-500 mt-1">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useMobile } from '@/composables/useMobile'

interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
}

interface DatePickerProps {
  modelValue?: Date | null
  placeholder?: string
  format?: string
  disabled?: boolean
  clearable?: boolean
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  disabledDays?: number[] // 0 = Sunday, 1 = Monday, etc.
  error?: boolean
  errorMessage?: string
  yearRange?: number
  locale?: string
  timeZone?: string
}

interface DatePickerEmits {
  'update:modelValue': [value: Date | null]
  'change': [value: Date | null]
  'blur': []
  'focus': []
}

const props = withDefaults(defineProps<DatePickerProps>(), {
  placeholder: 'Select a date',
  format: 'medium',
  disabled: false,
  clearable: true,
  error: false,
  errorMessage: '',
  yearRange: 10,
  locale: 'en-US',
  timeZone: undefined // Use local timezone by default
})

const emit = defineEmits<DatePickerEmits>()

// Reactive state
const isOpen = ref(false)
const currentDate = ref(new Date())
const selectedMonth = ref(currentDate.value.getMonth().toString())
const selectedYear = ref(currentDate.value.getFullYear().toString())

// Use mobile detection composable
const { isMobile } = useMobile()

// Locale-aware utilities
const getLocaleInfo = () => {
  try {
    return {
      localLocale: props.locale || navigator.language || 'en-US'
    }
  } catch {
    return {
      localLocale: 'en-US'
    }
  }
}

const { localLocale } = getLocaleInfo()

// Get localized month names
const getMonthNames = () => {
  const months: string[] = []
  for (let i = 0; i < 12; i++) {
    const date = new Date(2000, i, 1)
    months.push(new Intl.DateTimeFormat(localLocale, {
      month: 'long'
    }).format(date))
  }
  return months
}

// Get localized day names
const getDayNames = () => {
  const days: string[] = []
  const baseDate = new Date(2000, 0, 2) // Sunday

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + i)
    days.push(new Intl.DateTimeFormat(localLocale, {
      weekday: 'narrow'
    }).format(date))
  }
  return days
}

// Get first day of week for locale
const getFirstDayOfWeek = () => {
  // Use Intl.Locale if available, otherwise fallback to common defaults
  try {
    // const weekInfo = new Intl.Locale(localLocale).weekInfo
    return 0 // Default to Monday if not available
  } catch {
    // Fallback: US and some other locales start on Sunday, most others on Monday
    const sundayLocales = ['en-US', 'en-CA', 'ja-JP']
    return sundayLocales.includes(localLocale as string) ? 0 : 1
  }
}

// Constants
const months = getMonthNames()
const dayHeaders = getDayNames()
const firstDayOfWeek = getFirstDayOfWeek()

// Reorder day headers based on locale's first day of week
const orderedDayHeaders = computed(() => {
  const headers = [...dayHeaders]
  if (firstDayOfWeek === 1) {
    // Move Sunday to the end for Monday-first locales
    headers.push(headers.shift()!)
  }
  return headers
})

// Computed properties
const displayValue = computed<string>(() => {
  if (!props.modelValue) return props.placeholder
  return formatDate(typeof props.modelValue === 'string'?new Date():props.modelValue, props.format)
})

const currentMonth = computed<number>(() => parseInt(selectedMonth.value))
const currentYear = computed<number>(() => parseInt(selectedYear.value))

const availableYears = computed<number[]>(() => {
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - props.yearRange
  const endYear = currentYear + props.yearRange

  const years: number[] = []
  for (let year = startYear; year <= endYear; year++) {
    years.push(year)
  }
  return years
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDate = new Date(firstDay)

  // Adjust start date based on locale's first day of week
  const dayOffset = (firstDay.getDay() - firstDayOfWeek + 7) % 7
  startDate.setDate(startDate.getDate() - dayOffset)

  const days: CalendarDay[] = []
  const today = new Date()

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const day: CalendarDay = {
      date,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === currentMonth.value,
      isToday: isSameDay(date, today),
      isSelected: props.modelValue ? isSameDay(date, props.modelValue) : false,
      isDisabled: isDayDisabled({ date, day: date.getDate(), isCurrentMonth: date.getMonth() === currentMonth.value } as CalendarDay)
    }

    days.push(day)
  }

  return days
})

const isMinDateReached = computed(() => {
  if (!props.minDate) return false
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1)
  return firstDayOfMonth <= props.minDate
})

const isMaxDateReached = computed(() => {
  if (!props.maxDate) return false
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0)
  return lastDayOfMonth >= props.maxDate
})

const isTodayDisabled = computed(() => {
  const today = new Date()
  return isDayDisabled({
    date: today,
    day: today.getDate(),
    isCurrentMonth: true
  } as CalendarDay)
})

// Methods
const formatDate = (date: Date, format: string): string => {
  try {
    // Handle predefined format names
    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
      'short': { dateStyle: 'short' },
      'medium': { dateStyle: 'medium' },
      'long': { dateStyle: 'long' },
      'full': { dateStyle: 'full' }
    }

    if (formatOptions[format]) {
      // Don't specify timezone - use local date formatting
      return new Intl.DateTimeFormat(localLocale, formatOptions[format]).format(date)
    }

    // Handle custom format patterns
    const customFormats: Record<string, Intl.DateTimeFormatOptions> = {
      'yyyy': { year: 'numeric' },
      'yy': { year: '2-digit' },
      'MMMM': { month: 'long' },
      'MMM': { month: 'short' },
      'MM': { month: '2-digit' },
      'M': { month: 'numeric' },
      'dd': { day: '2-digit' },
      'd': { day: 'numeric' },
      'EEEE': { weekday: 'long' },
      'EEE': { weekday: 'short' },
      'EE': { weekday: 'narrow' }
    }

    // For complex custom formats, build the formatter
    if (format.includes('yyyy') || format.includes('MMM') || format.includes('dd')) {
      const parts = new Intl.DateTimeFormat(localLocale, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      }).formatToParts(date)

      const partMap = parts.reduce((acc, part) => {
        acc[part.type] = part.value
        return acc
      }, {} as Record<string, string>)

      return format
        .replace(/yyyy/g, partMap.year || '')
        .replace(/yy/g, partMap.year?.slice(-2) || '')
        .replace(/MMMM/g, months[date.getMonth()])
        .replace(/MMM/g, partMap.month || '')
        .replace(/MM/g, (date.getMonth() + 1).toString().padStart(2, '0'))
        .replace(/M/g, (date.getMonth() + 1).toString())
        .replace(/dd/g, partMap.day || '')
        .replace(/d/g, date.getDate().toString())
    }

    // Fallback to medium format
    return new Intl.DateTimeFormat(localLocale, {
      dateStyle: 'medium'
    }).format(date)

  } catch (error) {
    // Fallback to basic format if Intl fails
    console.debug(date)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
}

const isDayDisabled = (day: CalendarDay): boolean => {
  const { date } = day

  // Check min/max dates
  if (props.minDate && date < props.minDate) return true
  if (props.maxDate && date > props.maxDate) return true

  // Check disabled dates
  if (props.disabledDates?.some(disabledDate => isSameDay(date, disabledDate))) return true

  // Check disabled days of week
  return !!props.disabledDays?.includes(date.getDay());
}

const getDayButtonClass = (day: CalendarDay): string => {
  const classes = ['h-8 w-8 p-0 font-normal']

  if (!day.isCurrentMonth) {
    classes.push('text-muted-foreground opacity-50')
  }

  if (day.isToday) {
    classes.push('bg-accent text-accent-foreground')
  }

  if (day.isSelected) {
    classes.push('bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground')
  }

  if (day.isDisabled) {
    classes.push('opacity-50 cursor-not-allowed')
  }

  return cn(classes)
}

const navigateMonth = (direction: number): void => {
  const newDate = new Date(currentYear.value, currentMonth.value + direction, 1)
  selectedMonth.value = newDate.getMonth().toString()
  selectedYear.value = newDate.getFullYear().toString()
}

const selectDate = (day: CalendarDay): void => {
  if (isDayDisabled(day)) return

  // Create date at noon to avoid timezone boundary issues
  const selectedDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), 12, 0, 0, 0)

  emit('update:modelValue', selectedDate)
  emit('change', selectedDate)
  isOpen.value = false
}

const selectToday = (): void => {
  const now = new Date()
  // Create date at noon to avoid timezone boundary issues
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)
  if (!isTodayDisabled.value) {
    emit('update:modelValue', today)
    emit('change', today)
    isOpen.value = false
  }
}

const clear = (): void => {
  emit('update:modelValue', null)
  emit('change', null)
  isOpen.value = false
}

const handleTriggerClick = (): void => {
  if (!props.disabled) {
    emit('focus')
  }
}

// Localized button text
const getTodayButtonText = (): string => {
  try {
    const today = new Date()
    const rtf = new Intl.RelativeTimeFormat(localLocale, { numeric: 'auto' })
    return rtf.format(0, 'day') // "today" in the current locale
  } catch {
    return 'Today'
  }
}

const getClearButtonText = (): string => {
  // Simple localization for common button text
  const clearText: Record<string, string> = {
    'en': 'Clear',
    'tr': 'Temizle',
    'es': 'Limpiar',
    'fr': 'Effacer',
    'de': 'Löschen',
    'it': 'Cancella',
    'pt': 'Limpar',
    'ru': 'Очистить',
    'ja': 'クリア',
    'ko': '지우기',
    'zh': '清除'
  }

  const langCode = localLocale.split('-')[0]
  return clearText[langCode] || 'Clear'
}

const getCancelButtonText = (): string => {
  // Simple localization for common button text
  const cancelText: Record<string, string> = {
    'en': 'Cancel',
    'tr': 'Iptal',
    'es': 'Cancelar',
    'fr': 'Annuler',
    'de': 'Abbrechen',
    'it': 'Annulla',
    'pt': 'Cancelar',
    'ru': 'Отмена',
    'ja': 'キャンセル',
    'ko': '취소',
    'zh': '取消'
  }

  const langCode = localLocale.split('-')[0]
  return cancelText[langCode] || 'Cancel'
}

// Watch for changes
watch(selectedMonth, (newMonth) => {
  currentDate.value = new Date(currentYear.value, parseInt(newMonth), 1)
})

watch(selectedYear, (newYear) => {
  currentDate.value = new Date(parseInt(newYear), currentMonth.value, 1)
})

watch(isOpen, (newValue) => {
  if (!newValue) {
    emit('blur')
  }
})

// Initialize
onMounted(() => {
  // Initialize date from modelValue
  if (props.modelValue) {
    selectedMonth.value = props.modelValue.getMonth().toString()
    selectedYear.value = props.modelValue.getFullYear().toString()
  }
})
</script>

<style scoped>
.date-picker {
  @apply relative;
}
</style>
