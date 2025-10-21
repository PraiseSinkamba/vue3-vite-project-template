<script setup lang="ts">
import { ref, reactive } from 'vue'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FileUpload } from '@/components/ui/file-upload'
import { Image as ImageIcon, FileText, Loader2 } from 'lucide-vue-next'
import { z } from 'zod'
import type { ValidationRule, FileRecord } from '@/components/ui/file-upload'

// Form schema with Zod
const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    profilePicture: z.array(z.any()).min(1, 'Profile picture is required'),
    documents: z.array(z.any()).min(1, 'At least one document is required'),
  })
)

// Setup form with initial values
const { handleSubmit, resetForm: resetVeeForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    email: '',
    profilePicture: [],
    documents: [],
  },
})

// Reactive state
const basicFiles = ref<FileRecord[]>([])
const imageFiles = ref<FileRecord[]>([])
const documentFiles = ref<FileRecord[]>([])
const avatarFile = ref<FileRecord[]>([])
const resumeFile = ref<FileRecord[]>([])
const statusDemoFiles = ref<FileRecord[]>([])
const isSubmitting = ref(false)

// Form data
const formData = reactive({
  profilePicture: [] as FileRecord[],
  documents: [] as FileRecord[],
})

// Readonly/disabled demo files
const readonlyFiles = ref<FileRecord[]>([
  {
    id: '1',
    name: 'existing-document.pdf',
    size: 1024000,
    type: 'application/pdf',
    status: 'completed',
    url: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    name: 'another-file.jpg',
    size: 2048000,
    type: 'image/jpeg',
    status: 'completed',
    url: 'https://via.placeholder.com/150',
  },
])

const disabledFiles = ref<FileRecord[]>([])

// Validation rules
const documentValidationRules: ValidationRule[] = [
  (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ]
    return allowedTypes.includes(file.type)
      ? null
      : 'Only PDF, DOC, DOCX, XLS, XLSX, and TXT files are allowed'
  },
]

// Upload simulation functions
async function simulateUpload(file: File): Promise<{ url?: string }> {
  return new Promise((resolve, reject) => {
    const uploadTime = Math.random() * 2000 + 1000
    const shouldFail = Math.random() < 0.1

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Network error occurred'))
      } else {
        resolve({ url: URL.createObjectURL(file) })
      }
    }, uploadTime)
  })
}

async function simulateImageUpload(file: File): Promise<{ url?: string }> {
  return new Promise((resolve, reject) => {
    const uploadTime = Math.random() * 3000 + 2000
    const shouldFail = Math.random() < 0.05

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Image processing failed'))
      } else {
        resolve({ url: URL.createObjectURL(file) })
      }
    }, uploadTime)
  })
}

async function simulateDocumentUpload(file: File): Promise<{ url?: string }> {
  return new Promise((resolve, reject) => {
    const uploadTime = Math.random() * 4000 + 1000
    const shouldFail = Math.random() < 0.08

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Document upload failed'))
      } else {
        resolve({ url: URL.createObjectURL(file) })
      }
    }, uploadTime)
  })
}

async function simulateSlowUpload(file: File): Promise<{ url?: string }> {
  return new Promise((resolve, reject) => {
    const uploadTime = 5000
    const shouldFail = Math.random() < 0.2

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Simulated upload failure'))
      } else {
        resolve({ url: URL.createObjectURL(file) })
      }
    }, uploadTime)
  })
}

// Event handlers
function onFilesAdded(files: FileRecord[]) {
  toast.success('Files Added', {
    description: `${files.length} file(s) added and upload started`,
  })
}

function onFileUploaded(file: FileRecord) {
  toast.success('Upload Successful', {
    description: `${file.name} uploaded successfully`,
  })
}

function onFileFailed(file: FileRecord, error: string) {
  toast.error('Upload Failed', {
    description: `${file.name}: ${error}`,
  })
}

function onValidationFailed(file: File, errors: string[]) {
  toast.error('Validation Failed', {
    description: `${file.name}: ${errors.join(', ')}`,
  })
}

// Form handlers
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast.success('Application Submitted', {
      description: 'Your application has been submitted successfully!',
    })

    console.log('Form submitted:', values)
  } catch (error) {
    toast.error('Submission Failed', {
      description: 'There was an error submitting your application.',
    })
  } finally {
    isSubmitting.value = false
  }
})

function resetForm() {
  formData.profilePicture = []
  formData.documents = []
  resetVeeForm()

  toast.info('Form Reset', {
    description: 'All form data has been cleared',
  })
}

// Demo functions
function addMockFile(status: 'pending' | 'uploading' | 'completed' | 'failed') {
  const mockFile: FileRecord = {
    id: `mock-${Date.now()}-${Math.random()}`,
    name: `demo-file-${status}.${status === 'completed' ? 'jpg' : 'pdf'}`,
    size: Math.floor(Math.random() * 5000000) + 100000,
    type: status === 'completed' ? 'image/jpeg' : 'application/pdf',
    status,
    uploadPercentage:
      status === 'uploading'
        ? Math.floor(Math.random() * 80) + 10
        : status === 'completed'
          ? 100
          : 0,
  }

  statusDemoFiles.value.push(mockFile)

  if (status === 'uploading') {
    const interval = setInterval(() => {
      if (mockFile.uploadPercentage && mockFile.uploadPercentage < 100) {
        mockFile.uploadPercentage = Math.min(100, mockFile.uploadPercentage + Math.random() * 15)
      } else {
        mockFile.status = 'completed'
        clearInterval(interval)
      }
    }, 500)
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-8 px-4 py-8">
    <div class="mb-8">
      <h1 class="mb-2 text-4xl font-bold text-foreground">File Upload Component Demo</h1>
      <p class="text-lg text-muted-foreground">
        Comprehensive examples of the file upload component with various configurations and use cases.
      </p>
    </div>

    <div class="space-y-12">
      <!-- Basic File Upload -->
      <section class="space-y-4">
        <div>
          <h2 class="text-2xl font-semibold text-foreground">Basic File Upload</h2>
          <p class="text-muted-foreground">Simple file upload with drag and drop support</p>
        </div>
        <Card class="p-6">
          <FileUpload
            v-model="basicFiles"
            :upload-fn="simulateUpload"
            multiple
            :max-files="5"
            file-type="file"
            auto-upload
            @files-added="onFilesAdded"
            @file-uploaded="onFileUploaded"
            @file-failed="onFileFailed"
          />
        </Card>
      </section>

      <!-- Image Gallery Upload -->
      <section class="space-y-4">
        <div>
          <h2 class="text-2xl font-semibold text-foreground">Image Gallery Upload</h2>
          <p class="text-muted-foreground">
            Image-focused upload with square thumbnails and responsive grid
          </p>
        </div>
        <Card class="p-6">
          <FileUpload
            v-model="imageFiles"
            :upload-fn="simulateImageUpload"
            accept="image/*"
            multiple
            :max-files="8"
            file-type="image"
            display-mode="grid"
            shape="square"
            size="md"
            :max-size="5 * 1024 * 1024"
            auto-upload
            @validation-failed="onValidationFailed"
          />
        </Card>
      </section>

      <!-- Document Upload - List View -->
      <section class="space-y-4">
        <div>
          <h2 class="text-2xl font-semibold text-foreground">Document Upload - List View</h2>
          <p class="text-muted-foreground">
            Document upload with list display mode and file type restrictions
          </p>
        </div>
        <Card class="p-6">
          <FileUpload
            v-model="documentFiles"
            :upload-fn="simulateDocumentUpload"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            multiple
            :max-files="10"
            file-type="document"
            display-mode="list"
            :max-size="10 * 1024 * 1024"
            :validation-rules="documentValidationRules"
            auto-upload
          >
            <template #empty-icon>
              <FileText class="size-12 text-muted-foreground/50" />
            </template>
          </FileUpload>
        </Card>
      </section>

      <!-- Single File Upload -->
      <section class="space-y-4">
        <div>
          <h2 class="text-2xl font-semibold text-foreground">Single File Upload</h2>
          <p class="text-muted-foreground">Single file upload with different shapes</p>
        </div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card class="p-6">
            <h3 class="mb-4 text-lg font-medium">Profile Picture Upload</h3>
            <FileUpload
              v-model="avatarFile"
              :upload-fn="simulateUpload"
              accept="image/*"
              file-type="image"
              display-mode="single"
              shape="circle"
              size="lg"
              height="auto"
              :max-size="2 * 1024 * 1024"
              auto-upload
            />
          </Card>

          <Card class="p-6">
            <h3 class="mb-4 text-lg font-medium">Resume Upload</h3>
            <FileUpload
              v-model="resumeFile"
              :upload-fn="simulateUpload"
              accept=".pdf,.doc,.docx"
              file-type="document"
              display-mode="single"
              shape="rounded"
              height="md"
              :max-size="5 * 1024 * 1024"
              auto-upload
            />
          </Card>
        </div>
      </section>

      <!-- Form Integration with Validation -->
      <section class="space-y-4">
        <div>
          <h2 class="text-2xl font-semibold text-foreground">Form Integration</h2>
          <p class="text-muted-foreground">
            File upload integrated with shadcn form components and validation
          </p>
        </div>
        <Card class="p-6">
          <form class="space-y-6" @submit="onSubmit">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField v-slot="{ componentField }" name="name">
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" placeholder="Enter your full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="email">
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="email" placeholder="Enter your email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <FormField v-slot="{ componentField }" name="profilePicture">
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <FormControl>
                  <FileUpload
                    v-model="formData.profilePicture"
                    :upload-fn="simulateUpload"
                    accept="image/*"
                    file-type="image"
                    shape="square"
                    size="sm"
                    height="xs"
                    :max-size="2 * 1024 * 1024"
                    auto-upload
                    @files-added="() => componentField.onChange(formData.profilePicture)"
                  />
                </FormControl>
                <FormDescription> Upload a profile picture (JPG, PNG up to 2MB) </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="documents">
              <FormItem>
                <FormLabel>Supporting Documents</FormLabel>
                <FormControl>
                  <FileUpload
                    v-model="formData.documents"
                    :upload-fn="simulateUpload"
                    accept=".pdf,.doc,.docx"
                    multiple
                    :max-files="3"
                    file-type="document"
                    display-mode="list"
                    :max-size="5 * 1024 * 1024"
                    auto-upload
                    @files-added="() => componentField.onChange(formData.documents)"
                  />
                </FormControl>
                <FormDescription>
                  Upload up to 3 documents (PDF, DOC, DOCX up to 5MB each)
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="flex justify-end space-x-4">
              <Button type="button" variant="outline" @click="resetForm"> Reset </Button>
              <Button type="submit" :disabled="isSubmitting">
                <Loader2 v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
                Submit Application
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <!-- Readonly/Disabled States -->
      <section class="space-y-4">
        <div>
          <h2 class="text-2xl font-semibold text-foreground">Readonly & Disabled States</h2>
          <p class="text-muted-foreground">
            Examples of readonly and disabled file upload components
          </p>
        </div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card class="p-6">
            <h3 class="mb-4 text-lg font-medium">Readonly with Files</h3>
            <FileUpload v-model="readonlyFiles" readonly display-mode="grid" size="sm" />
          </Card>

          <Card class="p-6">
            <h3 class="mb-4 text-lg font-medium">Disabled State</h3>
            <FileUpload
              v-model="disabledFiles"
              disabled
              file-type="image"
              height="xs"
            />
          </Card>
        </div>
      </section>

      <!-- Upload Status Demo -->
      <section class="space-y-4">
        <div>
          <h2 class="text-2xl font-semibold text-foreground">Upload Status Demo</h2>
          <p class="text-muted-foreground">Demonstrate different upload states and progress</p>
        </div>
        <Card class="p-6">
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" @click="addMockFile('pending')">
                Add Pending File
              </Button>
              <Button size="sm" variant="outline" @click="addMockFile('uploading')">
                Add Uploading File
              </Button>
              <Button size="sm" variant="outline" @click="addMockFile('completed')">
                Add Completed File
              </Button>
              <Button size="sm" variant="outline" @click="addMockFile('failed')">
                Add Failed File
              </Button>
              <Button size="sm" variant="destructive" @click="statusDemoFiles = []">
                Clear All
              </Button>
            </div>

            <FileUpload
              v-model="statusDemoFiles"
              :upload-fn="simulateSlowUpload"
              multiple
              display-mode="grid"
              size="sm"
            />
          </div>
        </Card>
      </section>
    </div>
  </div>
</template>
