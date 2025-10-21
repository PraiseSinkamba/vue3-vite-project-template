<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { CheckCircle, Calendar, Clock, DollarSign, MessageSquare, Home } from 'lucide-vue-next'
import { format } from 'date-fns'

interface Props {
  appointmentNumber: string
  date: Date
  time: string
  serviceName: string
  addonCount: number
  totalPrice: number
  whatsappNumber: string
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const router = useRouter()

// Format date for display
const formattedDate = computed(() => {
  return format(props.date, 'EEEE, MMMM d, yyyy')
})

// Format time for display
const formattedTime = computed(() => {
  const [hours, minutes] = props.time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes)

  return new Intl.DateTimeFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale.value !== 'tr',
  }).format(date)
})

// Format price
const formattedPrice = computed(() => {
  return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: 'TRY',
  }).format(props.totalPrice)
})

// WhatsApp deep link
const whatsappLink = computed(() => {
  const message = encodeURIComponent(
    t('booking.confirmation.whatsappMessage', {
      number: props.appointmentNumber,
    }),
  )
  return `https://wa.me/${props.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`
})

const goHome = () => {
  router.push('/')
}

const viewMyAppointments = () => {
  router.push('/my-appointments')
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Success Icon -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
        <CheckCircle class="w-12 h-12 text-green-600 dark:text-green-400" />
      </div>

      <h1 class="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
        {{ t('booking.confirmation.success') }}
      </h1>

      <p class="text-lg text-muted-foreground">
        {{ t('booking.confirmation.successMessage') }}
      </p>
    </div>

    <!-- Appointment Reference -->
    <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
      <div class="text-center">
        <div class="text-sm font-medium text-muted-foreground mb-2">
          {{ t('booking.confirmation.reference') }}
        </div>
        <div class="font-mono text-2xl font-bold text-primary">
          {{ appointmentNumber }}
        </div>
      </div>
    </div>

    <!-- Appointment Details Card -->
    <div class="bg-card border rounded-lg p-6 mb-6 space-y-4">
      <div class="flex items-center gap-3">
        <Calendar class="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div>
          <div class="text-sm text-muted-foreground">{{ t('booking.date') }}</div>
          <div class="font-medium text-foreground">{{ formattedDate }}</div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <Clock class="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div>
          <div class="text-sm text-muted-foreground">{{ t('booking.time') }}</div>
          <div class="font-medium text-foreground">{{ formattedTime }}</div>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div class="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <div class="w-2 h-2 rounded-full bg-primary" />
        </div>
        <div>
          <div class="text-sm text-muted-foreground">{{ t('booking.service') }}</div>
          <div class="font-medium text-foreground">
            {{ serviceName }}
            <span v-if="addonCount > 0" class="text-muted-foreground">
              + {{ addonCount }} {{ addonCount === 1 ? t('booking.addon') : t('booking.addons') }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <DollarSign class="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div>
          <div class="text-sm text-muted-foreground">{{ t('booking.estimatedPrice') }}</div>
          <div class="font-medium text-foreground">{{ formattedPrice }}</div>
        </div>
      </div>
    </div>

    <!-- What's Next Section -->
    <div class="bg-accent/50 border rounded-lg p-6 mb-6">
      <h3 class="font-serif text-lg font-semibold text-foreground mb-4">
        {{ t('booking.step3.whatsNext') }}
      </h3>

      <ol class="space-y-3 text-sm">
        <li class="flex gap-3">
          <span class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            1
          </span>
          <span class="text-muted-foreground">{{ t('booking.confirmation.step1') }}</span>
        </li>
        <li class="flex gap-3">
          <span class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            2
          </span>
          <span class="text-muted-foreground">{{ t('booking.confirmation.step2') }}</span>
        </li>
        <li class="flex gap-3">
          <span class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            3
          </span>
          <span class="text-muted-foreground">{{ t('booking.confirmation.step3') }}</span>
        </li>
      </ol>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Button size="lg" class="flex-1" as-child>
        <a :href="whatsappLink" target="_blank" rel="noopener noreferrer">
          <MessageSquare class="w-5 h-5 mr-2" />
          {{ t('booking.confirmation.contactWhatsApp') }}
        </a>
      </Button>

      <Button variant="outline" size="lg" @click="goHome">
        <Home class="w-5 h-5 mr-2" />
        {{ t('booking.confirmation.backHome') }}
      </Button>
    </div>

    <!-- Additional Info -->
    <p class="text-center text-sm text-muted-foreground mt-6">
      {{ t('booking.confirmation.saveReference') }}
    </p>
  </div>
</template>
