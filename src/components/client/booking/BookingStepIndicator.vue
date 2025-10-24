<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check } from 'lucide-vue-next'

interface Props {
  currentStep: number
}

const props = defineProps<Props>()

const { t } = useI18n()

const steps = computed(() => [
  {
    number: 1,
    title: t('booking.step1.title'),
    description: t('booking.step1.description'),
  },
  {
    number: 2,
    title: t('booking.step2.title'),
    description: t('booking.step2.description'),
  },
  {
    number: 3,
    title: t('booking.step3.title'),
    description: t('booking.step3.description'),
  },
  {
    number: 4,
    title: t('booking.step4.title'),
    description: t('booking.step4.description'),
  },
])

const isStepCompleted = (stepNumber: number) => stepNumber < props.currentStep
const isStepCurrent = (stepNumber: number) => stepNumber === props.currentStep
</script>

<template>
  <div class="mb-8">
    <!-- Mobile: Simple Progress Bar -->
    <div class="block md:hidden">
      <div class="flex items-center gap-2 mb-2">
        <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            class="h-full bg-primary transition-all duration-300"
            :style="{ width: `${((currentStep - 1) / 3) * 100}%` }"
          />
        </div>
        <span class="text-sm font-medium text-muted-foreground">
          {{ currentStep }}/4
        </span>
      </div>
      <p class="text-sm font-medium text-foreground">
        {{ steps[currentStep - 1]?.title }}
      </p>
    </div>

    <!-- Desktop: Full Step Indicator -->
    <div class="hidden md:block">
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in steps"
          :key="step.number"
          class="flex items-center flex-1"
        >
          <!-- Step Circle -->
          <div class="flex items-center gap-4">
            <div
              class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all"
              :class="{
                'bg-primary border-primary text-primary-foreground':
                  isStepCompleted(step.number) || isStepCurrent(step.number),
                'border-muted text-muted-foreground': !isStepCompleted(step.number) && !isStepCurrent(step.number),
              }"
            >
              <Check v-if="isStepCompleted(step.number)" class="w-5 h-5" />
              <span v-else class="font-bold">{{ step.number }}</span>
            </div>

            <!-- Step Info -->
            <div>
              <div
                class="font-semibold transition-colors"
                :class="{
                  'text-foreground': isStepCurrent(step.number),
                  'text-muted-foreground': !isStepCurrent(step.number),
                }"
              >
                {{ step.title }}
              </div>
              <div class="text-sm text-muted-foreground">
                {{ step.description }}
              </div>
            </div>
          </div>

          <!-- Connector Line -->
          <div
            v-if="index < steps.length - 1"
            class="flex-1 h-0.5 mx-4 transition-colors"
            :class="{
              'bg-primary': isStepCompleted(step.number),
              'bg-muted': !isStepCompleted(step.number),
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
