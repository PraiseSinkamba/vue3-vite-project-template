<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Heart, Gift, Users, Zap, Star, CheckCircle2 } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  showAccountCreated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAccountCreated: false,
})

const { t } = useI18n()

const benefits = [
  {
    icon: Heart,
    titleKey: 'booking.step2.benefits.trackStyle.title',
    descriptionKey: 'booking.step2.benefits.trackStyle.description',
  },
  {
    icon: Gift,
    titleKey: 'booking.step2.benefits.earnRewards.title',
    descriptionKey: 'booking.step2.benefits.earnRewards.description',
  },
  {
    icon: Users,
    titleKey: 'booking.step2.benefits.referFriends.title',
    descriptionKey: 'booking.step2.benefits.referFriends.description',
  },
  {
    icon: Zap,
    titleKey: 'booking.step2.benefits.bookFaster.title',
    descriptionKey: 'booking.step2.benefits.bookFaster.description',
  },
  {
    icon: Star,
    titleKey: 'booking.step2.benefits.vipAccess.title',
    descriptionKey: 'booking.step2.benefits.vipAccess.description',
  },
]
</script>

<template>
  <div class="space-y-4">
    <!-- Account Created Success -->
    <Card v-if="showAccountCreated" class="border-green-500 bg-green-50 dark:bg-green-950">
      <CardContent class="p-4">
        <div class="flex items-start gap-3">
          <CheckCircle2 class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 class="font-semibold text-green-900 dark:text-green-100">
              {{ t('booking.step2.benefits.accountCreated.title') }}
            </h3>
            <p class="text-sm text-green-700 dark:text-green-300 mt-1">
              {{ t('booking.step2.benefits.accountCreated.description') }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Benefits Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card
        v-for="(benefit, index) in benefits"
        :key="index"
        class="border-border hover:border-primary/50 transition-colors"
      >
        <CardContent class="p-4">
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
            >
              <component :is="benefit.icon" class="w-5 h-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-foreground text-sm mb-1">
                {{ t(benefit.titleKey) }}
              </h3>
              <p class="text-xs text-muted-foreground leading-relaxed">
                {{ t(benefit.descriptionKey) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
