<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Mail, Lock, Loader2 } from 'lucide-vue-next'
import GoogleAuthButton from './GoogleAuthButton.vue'

const emit = defineEmits<{
  success: []
  switchToSignUp: []
}>()

const { t } = useI18n()
const authStore = useAuthStore()

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email({ message: t('booking.step2.signUp.validation.emailInvalid') }),
    password: z
      .string()
      .min(8, { message: t('booking.step2.signUp.validation.passwordTooShort') }),
  }),
)

const { handleSubmit, isFieldDirty } = useForm({
  validationSchema: formSchema,
})

const isSubmitting = ref(false)
const error = ref<string | null>(null)

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  error.value = null

  try {
    await authStore.clientSignInWithPassword({
      email: values.email,
      password: values.password,
    })
    emit('success')
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('Invalid login credentials')) {
        error.value = t('booking.step2.signIn.errors.invalidCredentials')
      } else if (err.message.includes('network')) {
        error.value = t('booking.step2.signIn.errors.networkError')
      } else {
        error.value = t('booking.step2.signIn.errors.unknownError')
      }
    }
  } finally {
    isSubmitting.value = false
  }
})

const handleGoogleSuccess = () => {
  emit('success')
}

const handleGoogleError = (err: Error) => {
  error.value = err.message
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h3 class="font-serif text-xl font-semibold text-foreground">
        {{ t('booking.step2.signIn.title') }}
      </h3>
      <p class="text-sm text-muted-foreground">
        {{ t('booking.step2.signIn.subtitle') }}
      </p>
    </div>

    <!-- Google Auth Button -->
    <GoogleAuthButton
      :label="t('booking.step2.signIn.googleButton')"
      @success="handleGoogleSuccess"
      @error="handleGoogleError"
    />

    <!-- Divider -->
    <div class="relative">
      <Separator />
      <span
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground"
      >
        {{ t('booking.step2.signIn.orDivider') }}
      </span>
    </div>

    <!-- Email/Password Form -->
    <form @submit="onSubmit" class="space-y-4">
      <!-- Email -->
      <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>{{ t('booking.step2.signIn.emailLabel') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                :placeholder="t('booking.step2.signIn.emailPlaceholder')"
                class="pl-10"
                v-bind="componentField"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Password -->
      <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <div class="flex items-center justify-between">
            <FormLabel>{{ t('booking.step2.signIn.passwordLabel') }}</FormLabel>
            <button
              type="button"
              class="text-xs text-primary hover:underline"
              @click="$emit('switchToSignUp')"
            >
              {{ t('booking.step2.signIn.forgotPassword') }}
            </button>
          </div>
          <FormControl>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                :placeholder="t('booking.step2.signIn.passwordPlaceholder')"
                class="pl-10"
                v-bind="componentField"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Error Display -->
      <div v-if="error" class="p-3 rounded-md bg-destructive/10 border border-destructive/20">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>

      <!-- Submit Button -->
      <Button type="submit" class="w-full" :disabled="isSubmitting">
        <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
        {{ isSubmitting ? t('booking.step2.signIn.signingIn') : t('booking.step2.signIn.signInButton') }}
      </Button>
    </form>

    <!-- Sign Up Link -->
    <div class="text-center text-sm text-muted-foreground">
      {{ t('booking.step2.signIn.noAccount') }}
      <button
        type="button"
        class="text-primary hover:underline font-medium"
        @click="$emit('switchToSignUp')"
      >
        {{ t('booking.step2.signIn.createAccount') }}
      </button>
    </div>
  </div>
</template>
