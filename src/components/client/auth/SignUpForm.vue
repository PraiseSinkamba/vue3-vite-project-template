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
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Phone, Lock, Loader2 } from 'lucide-vue-next'
import GoogleAuthButton from './GoogleAuthButton.vue'

const emit = defineEmits<{
  success: []
  switchToSignIn: []
}>()

const { t, locale } = useI18n()
const authStore = useAuthStore()

const formSchema = toTypedSchema(
  z
    .object({
      fullName: z
        .string()
        .min(2, { message: t('booking.step2.signUp.validation.nameTooShort') })
        .nonempty({ message: t('booking.step2.signUp.validation.nameRequired') }),
      email: z
        .string()
        .email({ message: t('booking.step2.signUp.validation.emailInvalid') })
        .nonempty({ message: t('booking.step2.signUp.validation.emailRequired') }),
      phone: z
        .string()
        .regex(/^\+?[0-9]{10,15}$/, { message: t('booking.step2.signUp.validation.phoneInvalid') })
        .nonempty({ message: t('booking.step2.signUp.validation.phoneRequired') }),
      password: z
        .string()
        .min(8, { message: t('booking.step2.signUp.validation.passwordTooShort') })
        .nonempty({ message: t('booking.step2.signUp.validation.passwordRequired') }),
      confirmPassword: z
        .string()
        .nonempty({ message: t('booking.step2.signUp.validation.confirmPasswordRequired') }),
      agreeTerms: z.boolean().refine((val) => val === true, {
        message: t('booking.step2.signUp.validation.termsRequired'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('booking.step2.signUp.validation.passwordsMustMatch'),
      path: ['confirmPassword'],
    }),
)

const { handleSubmit, isFieldDirty } = useForm({
  validationSchema: formSchema,
  initialValues: {
    agreeTerms: false,
  },
})

const isSubmitting = ref(false)
const error = ref<string | null>(null)

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  error.value = null

  try {
    await authStore.clientSignUpWithPassword({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      phone: values.phone,
      preferredLanguage: locale.value as 'en' | 'tr',
    })
    emit('success')
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('already registered') || err.message.includes('duplicate')) {
        error.value = t('booking.step2.signUp.errors.emailInUse')
      } else if (err.message.includes('weak password')) {
        error.value = t('booking.step2.signUp.errors.weakPassword')
      } else if (err.message.includes('network')) {
        error.value = t('booking.step2.signUp.errors.networkError')
      } else {
        error.value = t('booking.step2.signUp.errors.unknownError')
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
        {{ t('booking.step2.signUp.title') }}
      </h3>
      <p class="text-sm text-muted-foreground">
        {{ t('booking.step2.signUp.subtitle') }}
      </p>
    </div>

    <!-- Google Auth Button -->
    <GoogleAuthButton
      :label="t('booking.step2.signUp.googleButton')"
      @success="handleGoogleSuccess"
      @error="handleGoogleError"
    />

    <!-- Divider -->
    <div class="relative">
      <Separator />
      <span
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground"
      >
        {{ t('booking.step2.signUp.orDivider') }}
      </span>
    </div>

    <!-- Sign Up Form -->
    <form @submit="onSubmit" class="space-y-4">
      <!-- Full Name -->
      <FormField v-slot="{ componentField }" name="fullName" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>{{ t('booking.step2.signUp.fullNameLabel') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                :placeholder="t('booking.step2.signUp.fullNamePlaceholder')"
                class="pl-10"
                v-bind="componentField"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Email -->
      <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>{{ t('booking.step2.signUp.emailLabel') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                :placeholder="t('booking.step2.signUp.emailPlaceholder')"
                class="pl-10"
                v-bind="componentField"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Phone Number -->
      <FormField v-slot="{ componentField }" name="phone" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>{{ t('booking.step2.signUp.phoneLabel') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                :placeholder="t('booking.step2.signUp.phonePlaceholder')"
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
          <FormLabel>{{ t('booking.step2.signUp.passwordLabel') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                :placeholder="t('booking.step2.signUp.passwordPlaceholder')"
                class="pl-10"
                v-bind="componentField"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Confirm Password -->
      <FormField
        v-slot="{ componentField }"
        name="confirmPassword"
        :validate-on-blur="!isFieldDirty"
      >
        <FormItem>
          <FormLabel>{{ t('booking.step2.signUp.confirmPasswordLabel') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                :placeholder="t('booking.step2.signUp.confirmPasswordPlaceholder')"
                class="pl-10"
                v-bind="componentField"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Terms Agreement -->
      <FormField v-slot="{ value, handleChange }" name="agreeTerms">
        <FormItem class="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox :checked="value" @update:checked="handleChange" />
          </FormControl>
          <div class="space-y-1 leading-none">
            <FormLabel class="text-sm font-normal cursor-pointer">
              {{ t('booking.step2.signUp.agreeTerms') }}
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      </FormField>

      <!-- Error Display -->
      <div v-if="error" class="p-3 rounded-md bg-destructive/10 border border-destructive/20">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>

      <!-- Submit Button -->
      <Button type="submit" class="w-full" :disabled="isSubmitting">
        <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
        {{
          isSubmitting
            ? t('booking.step2.signUp.creatingAccount')
            : t('booking.step2.signUp.signUpButton')
        }}
      </Button>
    </form>

    <!-- Sign In Link -->
    <div class="text-center text-sm text-muted-foreground">
      {{ t('booking.step2.signUp.haveAccount') }}
      <button
        type="button"
        class="text-primary hover:underline font-medium"
        @click="$emit('switchToSignIn')"
      >
        {{ t('booking.step2.signUp.signIn') }}
      </button>
    </div>
  </div>
</template>
