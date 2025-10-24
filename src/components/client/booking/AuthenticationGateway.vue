<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-vue-next'
import BenefitsCard from './BenefitsCard.vue'
import SignInForm from '@/components/client/auth/SignInForm.vue'
import SignUpForm from '@/components/client/auth/SignUpForm.vue'

const emit = defineEmits<{
  authenticated: []
  skip: []
}>()

const { t } = useI18n()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const activeTab = ref<'signin' | 'signup' | 'guest'>('signup')
const showAccountCreated = ref(false)

// Check if user is already authenticated
const isAuthenticated = computed(() => !!user.value)

const handleAuthSuccess = () => {
  showAccountCreated.value = true
  setTimeout(() => {
    emit('authenticated')
  }, 1500)
}

const handleSkip = () => {
  emit('skip')
}

const switchToSignIn = () => {
  activeTab.value = 'signin'
}

const switchToSignUp = () => {
  activeTab.value = 'signup'
}
</script>

<template>
  <div class="space-y-8">
    <!-- Already Authenticated Banner -->
    <div v-if="isAuthenticated" class="text-center space-y-4">
      <Card class="border-primary/50 bg-primary/5">
        <CardContent class="p-6">
          <div class="flex items-center justify-center gap-2 mb-2">
            <Sparkles class="w-5 h-5 text-primary" />
            <h3 class="font-semibold text-foreground">
              {{ t('booking.step2.authGateway.alreadyAuthenticated', { name: user?.profile?.full_name || 'User' }) }}
            </h3>
          </div>
          <p class="text-sm text-muted-foreground">
            {{ t('booking.step2.authGateway.earningPoints') }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Main Authentication Content -->
    <div v-else>
      <!-- Benefits Section -->
      <div class="mb-8 space-y-4">
        <!-- Header -->
        <div class="text-center space-y-2">
          <h2 class="font-serif text-2xl md:text-3xl font-bold text-foreground">
            {{ t('booking.step2.authGateway.headline') }}
          </h2>
          <p class="text-muted-foreground">
            {{ t('booking.step2.authGateway.subheadline') }}
          </p>
        </div>

        <!-- Benefits Cards -->
        <BenefitsCard :show-account-created="showAccountCreated" />
      </div>

      <!-- Auth Forms -->
      <Card>
        <CardContent class="p-6">
          <Tabs v-model="activeTab" class="w-full">
            <TabsList class="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="signup">
                {{ t('booking.step2.authGateway.signUpTab') }}
              </TabsTrigger>
              <TabsTrigger value="signin">
                {{ t('booking.step2.authGateway.signInTab') }}
              </TabsTrigger>
              <TabsTrigger value="guest">
                {{ t('booking.step2.authGateway.guestTab') }}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <SignUpForm
                @success="handleAuthSuccess"
                @switch-to-sign-in="switchToSignIn"
              />
            </TabsContent>

            <TabsContent value="signin">
              <SignInForm
                @success="handleAuthSuccess"
                @switch-to-sign-up="switchToSignUp"
              />
            </TabsContent>

            <TabsContent value="guest">
              <div class="space-y-6 py-8 text-center">
                <div class="space-y-2">
                  <h3 class="font-serif text-lg font-semibold text-foreground">
                    Continue as Guest
                  </h3>
                  <p class="text-sm text-muted-foreground max-w-md mx-auto">
                    You can book without an account, but you'll miss out on loyalty points, appointment history, and faster future bookings.
                  </p>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" @click="switchToSignUp">
                    Create Free Account
                  </Button>
                  <Button @click="handleSkip">
                    {{ t('booking.step2.authGateway.continueAsGuest') }}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
