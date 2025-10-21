<script setup lang="ts">
import { RSheet } from '@/components/ui/reponsive'
import { z } from 'zod'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useForm } from 'vee-validate'
import type { Client, ClientInsert, ClientUpdate } from '@/types'
import { toTypedSchema } from '@vee-validate/zod'
import { AlertCircle, CopyIcon } from 'lucide-vue-next'
import { useClientStore } from '@/stores/clients'
import { useMutation } from '@pinia/colada'
import { toast } from 'vue-sonner'
import { ref } from 'vue'
import Alert from '@/components/ui/alert/Alert.vue'
import AlertTitle from '@/components/ui/alert/AlertTitle.vue'
import AlertDescription from '@/components/ui/alert/AlertDescription.vue'
import { cn } from '@/lib/utils'
import { watch } from 'vue'
const { saveClientProfile } = useClientStore()
const props = defineProps<{
  client?: Client | null
}>()

const isOpen = defineModel<boolean>('open')

/**
 * Client type:
 * avatar_url: string | null
 * created_at: string | null
 * email: string
 * full_name: string | null
 * id: string
 * is_active: boolean | null
 * phone: string | null
 * preferred_language: 'en' | 'tr'
 * role: string | null
 * updated_at: string | null
 * whatsapp_number: string | null
 **/

const emit = defineEmits<{
  (e: 'submit', client: Client): void
}>()

const schema = z.object({
  id: z.string().optional(),
  full_name: z.string({ message: 'Please enter a full name' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  is_active: z.boolean().optional(),
  phone: z.string().optional(),
  preferred_language: z.string().optional(),
  role: z.string().optional(),
  updated_at: z.string().optional(),
  whatsapp_number: z.string().optional(),
  avatar_url: z.string().optional(),
})

const { handleSubmit, values, setFieldValue, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: props.client || {
    full_name: '',
    email: '',
    is_active: true,
    auth_id: '',
    phone: '',
    preferred_language: 'en',
    role: 'client',
    updated_at: '',
    whatsapp_number: '',
    avatar_url: '',
  },
})

const languages = [
  { value: 'en', label: 'English' },
  { value: 'tr', label: 'Turkish' },
]
const copyPhoneNumber = () => {
  setFieldValue('whatsapp_number', values.phone)
}

watch(
  () => props.client,
  (newClient) => {
    if (newClient) {
      setValues(newClient, false)
    } else {
      resetForm()
    }
  },
)

const { isLoading, mutate: saveClient } = useMutation({
  mutation: async (client: Client) => {
    return saveClientProfile({
      ...client,
      auth_id: client.auth_id || null,
      created_at: client.created_at || undefined,
      updated_at: client.updated_at || undefined,
      avatar_url: client.avatar_url || null,
    })
  },
  onSuccess: (client) => {
    emit('submit', client)
    isOpen.value = false
    toast.success('Client saved successfully')
  },
  onError(error: Error) {
    console.log(error)
    toast.error('Failed to save client')
  },
})
const saveError = ref<string>()
const onSubmit = handleSubmit((values) => {
  saveClient(values as Client)
})
</script>

<template>
  <RSheet
    v-model:open="isOpen"
    :side="'right'"
    :title="props.client ? 'Edit Client' : 'Add Client'"
    description="Manage client information"
  >
    <Alert v-if="saveError" variant="destructive">
      <AlertCircle class="size-5" />
      <AlertTitle>Failed to save client</AlertTitle>
      <AlertDescription>{{ saveError }}</AlertDescription>
    </Alert>

    <form
      @submit.prevent="onSubmit"
      :class="cn('space-y-6 px-2', isLoading && 'opacity-90 cursor-not-allowed')"
    >
      <!-- Full Name Field -->
      <FormField v-slot="{ componentField }" name="full_name">
        <FormItem>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <Input type="text" placeholder="Enter full name" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Email Field -->
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="Enter email address" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Phone Field -->
      <FormField v-slot="{ componentField }" name="phone">
        <FormItem>
          <FormLabel>Phone</FormLabel>
          <FormControl>
            <Input type="tel" placeholder="Enter phone number" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- WhatsApp Number Field -->
      <FormField v-slot="{ componentField }" name="whatsapp_number">
        <FormItem>
          <FormLabel>WhatsApp Number</FormLabel>
          <FormControl>
            <div class="flex flex-row gap-2">
              <Input
                type="tel"
                placeholder="Enter WhatsApp number"
                class="flex-1"
                v-bind="componentField"
              />
              <Button variant="outline" @click="copyPhoneNumber">
                <CopyIcon class="h-5 w-5 text-gray-500" aria-hidden="true" />
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Preferred Language Field -->
      <FormField v-slot="{ componentField }" name="preferred_language">
        <FormItem>
          <FormLabel>Preferred Language</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem
                v-for="language in languages"
                :key="language.value"
                :value="language.value"
              >
                {{ language.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Avatar URL Field -->
      <FormField v-slot="{ componentField }" name="avatar_url">
        <FormItem>
          <FormLabel>Avatar URL</FormLabel>
          <FormControl>
            <Input type="url" placeholder="Enter avatar URL" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Is Active Field -->
      <FormField v-slot="{ value, handleChange }" name="is_active">
        <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
          <div class="space-y-0.5">
            <FormLabel class="text-sm font-medium">Active Status</FormLabel>
            <FormDescription class="text-xs">
              Enable or disable this client account
            </FormDescription>
          </div>
          <FormControl>
            <Switch :modelValue="value" @update:modelValue="handleChange" />
          </FormControl>
        </FormItem>
      </FormField>

      <!-- Form Actions -->
      <div class="grid grid-cols-2 py-4 gap-2 sticky bottom-0 bg-background w-full">
        <Button type="button" variant="outline" @click="isOpen = false"> Cancel </Button>
        <Button type="submit" :disabled="isLoading">
          {{ props.client ? 'Update Client' : 'Create Client' }}
        </Button>
      </div>
    </form>
  </RSheet>
</template>
