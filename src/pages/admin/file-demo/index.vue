<template>
  <div class="space-y-8 mx-auto py-8 px-4 max-w-7xl">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">File Upload Component Demo</h1>
      <p class="text-lg text-gray-600">
        Comprehensive examples showcasing basic usage, advanced customizations, and creative
        implementations.
      </p>
    </div>

    <div class="space-y-16">
      <!-- BASIC EXAMPLES SECTION -->
      <section class="space-y-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Basic Examples</h2>
          <p class="text-gray-600">Essential file upload patterns for common use cases</p>
        </div>

        <!-- Basic Multi-File Upload -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Multi-File Upload</h3>
            <p class="text-gray-600">Standard file upload with drag and drop support</p>
          </div>
          <Card class="p-6">
            <FileUpload
              v-model="basicFiles"
              :upload-fn="simulateUpload"
              :multiple="true"
              :max-files="5"
              file-type="file"
              @files-added="onFilesAdded"
              @file-uploaded="onFileUploaded"
              @file-failed="onFileFailed"
            />
          </Card>
        </div>

        <!-- Image Gallery Upload -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Image Gallery Upload</h3>
            <p class="text-gray-600">
              Image-focused upload with featured first image and square thumbnails
            </p>
          </div>
          <Card class="p-6">
            <FileUpload
              v-model="imageFiles"
              :upload-fn="simulateImageUpload"
              accept="image/*"
              :multiple="true"
              :max-files="8"
              file-type="image"
              display-mode="grid"
              shape="square"
              size="md"
              :featured-first="true"
              :max-size="5 * 1024 * 1024"
              @validation-failed="onValidationFailed"
            >
              <template #empty-state="{ onClick, dropZoneActive }">
                <div
                  :class="[
                    'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200',
                    {
                      'border-purple-400 bg-purple-50 scale-102': dropZoneActive,
                      'border-gray-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100':
                        !dropZoneActive,
                    },
                  ]"
                  @click="onClick"
                >
                  <div class="flex flex-col items-center justify-center p-8 text-center">
                    <ImageIcon class="mx-auto h-16 w-16 text-purple-300 mb-4" />
                    <div class="space-y-2">
                      <p v-if="dropZoneActive" class="text-lg text-purple-600 font-medium">
                        Drop your images here ✨
                      </p>
                      <template v-else>
                        <p class="text-lg font-semibold text-gray-700">Upload your images</p>
                        <p class="text-sm text-gray-500">Drag and drop or click to browse</p>
                        <p class="text-xs text-gray-400">JPG, PNG, GIF up to 5MB each</p>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
            </FileUpload>
          </Card>
        </div>

        <!-- Document List Upload -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Document List Upload</h3>
            <p class="text-gray-600">
              Document upload with list display mode and file type restrictions
            </p>
          </div>
          <Card class="p-6">
            <FileUpload
              v-model="documentFiles"
              :upload-fn="simulateDocumentUpload"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              :multiple="true"
              :max-files="10"
              file-type="document"
              display-mode="list"
              :max-size="10 * 1024 * 1024"
              :validation-rules="documentValidationRules"
            />
          </Card>
        </div>

        <!-- Single File Uploads -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Single File Uploads</h3>
            <p class="text-gray-600">
              Avatar and document single file uploads with different shapes
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card class="p-6">
              <h4 class="text-lg font-medium mb-4">Profile Picture Upload</h4>
              <FileUpload
                v-model="avatarFile"
                :upload-fn="simulateUpload"
                accept="image/*"
                :multiple="false"
                file-type="image"
                display-mode="single"
                shape="circle"
                size="lg"
                :max-size="2 * 1024 * 1024"
                empty-state-height="h-48"
              />
            </Card>

            <Card class="p-6">
              <h4 class="text-lg font-medium mb-4">Resume Upload</h4>
              <FileUpload
                v-model="resumeFile"
                :upload-fn="simulateUpload"
                accept=".pdf,.doc,.docx"
                :multiple="false"
                file-type="document"
                display-mode="single"
                :max-size="5 * 1024 * 1024"
                empty-state-height="h-48"
              />
            </Card>
          </div>
        </div>
      </section>

      <!-- ADVANCED EXAMPLES SECTION -->
      <section class="space-y-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Advanced Examples</h2>
          <p class="text-gray-600">
            Sophisticated implementations with custom designs and advanced features
          </p>
        </div>

        <!-- Custom Media Library Upload -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Media Library Upload</h3>
            <p class="text-gray-600">
              Pinterest-style media upload with masonry layout and advanced preview
            </p>
          </div>
          <Card class="p-6 bg-gradient-to-br from-slate-50 to-blue-50">
            <FileUpload
              v-model="mediaLibraryFiles"
              :upload-fn="simulateImageUpload"
              accept="image/*,video/*"
              :multiple="true"
              :max-files="20"
              file-type="image"
              display-mode="grid"
              size="sm"
              :max-size="50 * 1024 * 1024"
              container-class="bg-white/50 backdrop-blur-sm rounded-xl border border-white/20"
            >
              <template #empty-state="{ onClick, dropZoneActive }">
                <div
                  :class="[
                    'relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden',
                    {
                      'border-blue-400 bg-blue-100/50 scale-[1.02]': dropZoneActive,
                      'border-slate-300 bg-gradient-to-br from-white/80 to-slate-100/80 hover:from-white/90 hover:to-slate-100/90 hover:scale-[1.01]':
                        !dropZoneActive,
                    },
                  ]"
                  @click="onClick"
                >
                  <!-- Animated background pattern -->
                  <div class="absolute inset-0 opacity-5">
                    <div
                      class="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600"
                    ></div>
                    <div
                      class="absolute inset-0"
                      style="
                        background-image: radial-gradient(
                          circle at 50% 50%,
                          rgba(255, 255, 255, 0.8) 1px,
                          transparent 1px
                        );
                        background-size: 20px 20px;
                      "
                    ></div>
                  </div>

                  <div class="relative flex flex-col items-center justify-center p-8 text-center">
                    <div class="relative mb-6">
                      <div
                        class="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-20"
                      ></div>
                      <CloudUploadIcon class="relative h-16 w-16 text-slate-400" />
                    </div>
                    <div class="space-y-3">
                      <p v-if="dropZoneActive" class="text-xl font-semibold text-blue-600">
                        📸 Drop your media here!
                      </p>
                      <template v-else>
                        <h4 class="text-xl font-bold text-slate-700">Create Media Library</h4>
                        <p class="text-sm text-slate-500 max-w-sm">
                          Upload images and videos to build your media collection
                        </p>
                        <div
                          class="flex items-center justify-center space-x-4 text-xs text-slate-400"
                        >
                          <span class="flex items-center"
                            ><ImageIcon class="w-4 h-4 mr-1" /> Images</span
                          >
                          <span class="flex items-center"
                            ><VideoIcon class="w-4 h-4 mr-1" /> Videos</span
                          >
                          <span>Up to 50MB</span>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
            </FileUpload>
          </Card>
        </div>

        <!-- Batch Upload with Queue Management -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Batch Upload with Queue Management</h3>
            <p class="text-gray-600">
              Advanced batch processing with upload queue, retry mechanism, and batch operations
            </p>
          </div>
          <Card class="p-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <Badge variant="secondary" class="px-3 py-1">
                    Queue: {{ batchFiles.filter((f) => f.status === 'pending').length }} pending
                  </Badge>
                  <Badge variant="default" class="px-3 py-1">
                    {{ batchFiles.filter((f) => f.status === 'uploading').length }} uploading
                  </Badge>
                  <Badge variant="destructive" class="px-3 py-1">
                    {{ batchFiles.filter((f) => f.status === 'failed').length }} failed
                  </Badge>
                </div>
                <div class="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="retryAllFailed"
                    :disabled="!hasFailedFiles"
                  >
                    <RefreshCwIcon class="w-4 h-4 mr-1" />
                    Retry All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="clearCompleted"
                    :disabled="!hasCompletedFiles"
                  >
                    <CheckIcon class="w-4 h-4 mr-1" />
                    Clear Completed
                  </Button>
                </div>
              </div>

              <FileUpload
                v-model="batchFiles"
                :upload-fn="simulateBatchUpload"
                :multiple="true"
                :max-files="50"
                display-mode="list"
                :auto-upload="false"
                container-class="border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30"
              >
                <template #empty-state="{ onClick }">
                  <div class="flex flex-col items-center justify-center p-12 text-center">
                    <div class="relative mb-4">
                      <FolderUpIcon class="h-12 w-12 text-blue-400" />
                      <div
                        class="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                      >
                        <PlusIcon class="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-700 mb-2">Batch File Upload</h4>
                    <p class="text-sm text-gray-500 mb-4">
                      Upload multiple files for batch processing
                    </p>
                    <Button @click="onClick" class="px-6"> Select Files for Batch Upload </Button>
                  </div>
                </template>
              </FileUpload>

              <div v-if="batchFiles.length > 0" class="flex justify-center">
                <Button @click="startBatchUpload" :disabled="!hasPendingFiles" class="px-8">
                  <PlayIcon class="w-4 h-4 mr-2" />
                  Start Batch Upload ({{ batchFiles.filter((f) => f.status === 'pending').length }}
                  files)
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <!-- Custom Card-Based Upload Design -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Premium Card-Based Upload</h3>
            <p class="text-gray-600">
              Elegant card design with glassmorphism effects and premium styling
            </p>
          </div>
          <div class="relative">
            <!-- Background decoration -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-violet-200 to-pink-200 rounded-3xl blur-3xl opacity-30 -m-4"
            ></div>

            <Card
              class="relative p-8 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-xl"
            >
              <div class="text-center mb-6">
                <h4
                  class="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent"
                >
                  Premium Upload Experience
                </h4>
                <p class="text-gray-600 mt-2">Drag & drop with style</p>
              </div>

              <FileUpload
                v-model="premiumFiles"
                :upload-fn="simulateUpload"
                accept="image/*"
                :multiple="true"
                :max-files="6"
                file-type="image"
                display-mode="grid"
                shape="square"
                size="md"
                container-class="rounded-xl"
              >
                <template #empty-state="{ onClick, dropZoneActive }">
                  <div
                    :class="[
                      'relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-500 overflow-hidden',
                      {
                        'border-violet-400 bg-violet-50 scale-105': dropZoneActive,
                        'border-gray-300 hover:border-violet-300 hover:bg-gradient-to-br hover:from-violet-50 hover:to-pink-50':
                          !dropZoneActive,
                      },
                    ]"
                    @click="onClick"
                  >
                    <!-- Animated orbs -->
                    <div
                      class="absolute top-4 left-4 w-8 h-8 bg-violet-300 rounded-full blur-sm opacity-60 animate-pulse"
                    ></div>
                    <div
                      class="absolute bottom-4 right-4 w-6 h-6 bg-pink-300 rounded-full blur-sm opacity-60 animate-pulse"
                      style="animation-delay: 1s"
                    ></div>

                    <div class="relative flex flex-col items-center justify-center p-8 text-center">
                      <div class="relative mb-6">
                        <div
                          class="absolute inset-0 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full blur-md opacity-30"
                        ></div>
                        <div
                          class="relative w-16 h-16 bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center"
                        >
                          <CloudUploadIcon class="w-8 h-8 text-white" />
                        </div>
                      </div>

                      <div class="space-y-2">
                        <h5 class="text-lg font-semibold text-gray-800">Upload Premium Content</h5>
                        <p class="text-sm text-gray-500">High-quality images for your portfolio</p>
                        <div
                          class="flex items-center justify-center space-x-2 text-xs text-gray-400 mt-3"
                        >
                          <SparklesIcon class="w-4 h-4" />
                          <span>Premium Quality • Instant Processing</span>
                          <SparklesIcon class="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </FileUpload>
            </Card>
          </div>
        </div>

        <!-- Inline Chat-Style Upload -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Inline Chat-Style Upload</h3>
            <p class="text-gray-600">
              Compact upload interface for messaging and chat applications
            </p>
          </div>
          <Card class="p-6 bg-slate-50">
            <div class="space-y-4">
              <!-- Mock chat messages -->
              <div class="space-y-3">
                <div class="flex items-start space-x-3">
                  <Avatar class="w-8 h-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div class="bg-white rounded-2xl rounded-tl-md px-4 py-2 shadow-sm">
                    <p class="text-sm text-gray-700">Hey! Can you share those design files?</p>
                  </div>
                </div>

                <div class="flex items-start space-x-3 justify-end">
                  <div class="bg-blue-500 rounded-2xl rounded-tr-md px-4 py-2 text-white shadow-sm">
                    <p class="text-sm">Sure! Let me upload them now</p>
                  </div>
                  <Avatar class="w-8 h-8">
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <!-- Inline file upload -->
              <div class="border-t pt-4">
                <FileUpload
                  v-model="chatFiles"
                  :upload-fn="simulateUpload"
                  :multiple="true"
                  :max-files="5"
                  display-mode="list"
                  :max-size="25 * 1024 * 1024"
                  empty-state-height="h-24"
                  container-class="bg-white rounded-lg border border-gray-200"
                >
                  <template #empty-state="{ onClick }">
                    <div
                      class="flex items-center justify-center h-24 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                      @click="onClick"
                    >
                      <div class="flex items-center space-x-3 text-gray-500">
                        <PaperclipIcon class="w-5 h-5" />
                        <span class="text-sm">Attach files to share</span>
                        <ArrowUpIcon class="w-4 h-4" />
                      </div>
                    </div>
                  </template>
                </FileUpload>

                <div class="flex items-center justify-between mt-3">
                  <div class="text-xs text-gray-400">
                    Files will be shared instantly after upload
                  </div>
                  <Button size="sm" :disabled="chatFiles.length === 0">
                    <SendIcon class="w-4 h-4 mr-1" />
                    Send {{ chatFiles.length }} file{{ chatFiles.length !== 1 ? 's' : '' }}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Multi-Zone Drop Upload -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Multi-Zone Drop Upload</h3>
            <p class="text-gray-600">
              Different drop zones for different file types with smart routing
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Images Zone -->
            <Card class="p-4">
              <div class="text-center mb-4">
                <ImageIcon class="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <h4 class="font-semibold text-blue-700">Images</h4>
              </div>
              <FileUpload
                v-model="imageZoneFiles"
                :upload-fn="simulateUpload"
                accept="image/*"
                :multiple="true"
                :max-files="10"
                file-type="image"
                size="xs"
                empty-state-height="h-32"
                container-class="border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30"
              >
                <template #empty-state="{ onClick, dropZoneActive }">
                  <div
                    :class="[
                      'flex flex-col items-center justify-center h-32 cursor-pointer rounded-lg transition-all',
                      dropZoneActive ? 'bg-blue-100 border-blue-400' : 'hover:bg-blue-75',
                    ]"
                    @click="onClick"
                  >
                    <ImageIcon class="w-6 h-6 text-blue-400 mb-1" />
                    <span class="text-xs text-blue-600">Drop images here</span>
                  </div>
                </template>
              </FileUpload>
            </Card>

            <!-- Documents Zone -->
            <Card class="p-4">
              <div class="text-center mb-4">
                <FileTextIcon class="w-8 h-8 mx-auto text-green-500 mb-2" />
                <h4 class="font-semibold text-green-700">Documents</h4>
              </div>
              <FileUpload
                v-model="documentZoneFiles"
                :upload-fn="simulateUpload"
                accept=".pdf,.doc,.docx,.txt"
                :multiple="true"
                :max-files="10"
                file-type="document"
                size="xs"
                empty-state-height="h-32"
                container-class="border-2 border-dashed border-green-200 rounded-lg bg-green-50/30"
              >
                <template #empty-state="{ onClick, dropZoneActive }">
                  <div
                    :class="[
                      'flex flex-col items-center justify-center h-32 cursor-pointer rounded-lg transition-all',
                      dropZoneActive ? 'bg-green-100 border-green-400' : 'hover:bg-green-75',
                    ]"
                    @click="onClick"
                  >
                    <FileTextIcon class="w-6 h-6 text-green-400 mb-1" />
                    <span class="text-xs text-green-600">Drop documents here</span>
                  </div>
                </template>
              </FileUpload>
            </Card>

            <!-- Videos Zone -->
            <Card class="p-4">
              <div class="text-center mb-4">
                <VideoIcon class="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <h4 class="font-semibold text-purple-700">Videos</h4>
              </div>
              <FileUpload
                v-model="videoZoneFiles"
                :upload-fn="simulateUpload"
                accept="video/*"
                :multiple="true"
                :max-files="5"
                file-type="file"
                size="xs"
                empty-state-height="h-32"
                container-class="border-2 border-dashed border-purple-200 rounded-lg bg-purple-50/30"
              >
                <template #empty-state="{ onClick, dropZoneActive }">
                  <div
                    :class="[
                      'flex flex-col items-center justify-center h-32 cursor-pointer rounded-lg transition-all',
                      dropZoneActive ? 'bg-purple-100 border-purple-400' : 'hover:bg-purple-75',
                    ]"
                    @click="onClick"
                  >
                    <VideoIcon class="w-6 h-6 text-purple-400 mb-1" />
                    <span class="text-xs text-purple-600">Drop videos here</span>
                  </div>
                </template>
              </FileUpload>
            </Card>
          </div>
        </div>

        <!-- Dark Theme Upload -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Dark Theme Upload</h3>
            <p class="text-gray-600">Sleek dark mode design with neon accents</p>
          </div>
          <Card class="p-6 bg-gray-900 border-gray-800">
            <FileUpload
              v-model="darkThemeFiles"
              :upload-fn="simulateUpload"
              :multiple="true"
              :max-files="8"
              file-type="image"
              display-mode="grid"
              size="md"
              container-class="bg-gray-800/50 rounded-xl border border-gray-700"
            >
              <template #empty-state="{ onClick, dropZoneActive }">
                <div
                  :class="[
                    'relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden',
                    {
                      'border-cyan-400 bg-cyan-950/50 shadow-2xl shadow-cyan-500/20':
                        dropZoneActive,
                      'border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50':
                        !dropZoneActive,
                    },
                  ]"
                  @click="onClick"
                >
                  <!-- Neon grid background -->
                  <div class="absolute inset-0 opacity-10">
                    <div
                      class="absolute inset-0"
                      style="
                        background-image:
                          linear-gradient(cyan 1px, transparent 1px),
                          linear-gradient(90deg, cyan 1px, transparent 1px);
                        background-size: 20px 20px;
                      "
                    ></div>
                  </div>

                  <div class="relative flex flex-col items-center justify-center p-8 text-center">
                    <div class="relative mb-6">
                      <div
                        class="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-20"
                      ></div>
                      <div
                        class="relative w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center"
                      >
                        <CloudUploadIcon class="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div class="space-y-2">
                      <h5 class="text-xl font-bold text-white">
                        Upload to the <span class="text-cyan-400">Matrix</span>
                      </h5>
                      <p class="text-gray-400 text-sm">
                        Drag and drop files into the digital realm
                      </p>
                      <div
                        class="flex items-center justify-center space-x-2 text-xs text-gray-500 mt-3"
                      >
                        <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <span>SECURE UPLOAD PROTOCOL</span>
                        <div
                          class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                          style="animation-delay: 0.5s"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </FileUpload>
          </Card>
        </div>
      </section>

      <!-- FORM INTEGRATION SECTION -->
      <section class="space-y-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Form Integration</h2>
          <p class="text-gray-600">
            File uploads integrated with forms, validation, and state management
          </p>
        </div>

        <!-- Complete Form with Validation -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">
              Complete Form with File Upload Validation
            </h3>
            <p class="text-gray-600">
              Full form integration with shadcn-vue, vee-validate, and zod validation
            </p>
          </div>
          <Card class="p-6">
            <form class="space-y-6" @submit="onSubmit">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField v-slot="{ componentField }" name="name">
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="email">
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" v-bind="componentField" />
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
                      :multiple="false"
                      file-type="image"
                      shape="square"
                      size="sm"
                      :max-size="2 * 1024 * 1024"
                      empty-state-height="h-32"
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
                      :multiple="true"
                      :max-files="3"
                      file-type="document"
                      display-mode="list"
                      :max-size="5 * 1024 * 1024"
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
                  <LoaderIcon v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
                  Submit Application
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>

      <!-- SPECIAL STATES SECTION -->
      <section class="space-y-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Special States & Testing</h2>
          <p class="text-gray-600">Interactive demos for testing different states and edge cases</p>
        </div>

        <!-- Upload Status Demo -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Upload Status Testing</h3>
            <p class="text-gray-600">
              Interactive demo to test different upload states and progress indicators
            </p>
          </div>
          <Card class="p-6">
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                <Button @click="addMockFile('pending')" size="sm" variant="outline">
                  Add Pending File
                </Button>
                <Button @click="addMockFile('uploading')" size="sm" variant="outline">
                  Add Uploading File
                </Button>
                <Button @click="addMockFile('completed')" size="sm" variant="outline">
                  Add Completed File
                </Button>
                <Button @click="addMockFile('failed')" size="sm" variant="outline">
                  Add Failed File
                </Button>
                <Button @click="statusDemoFiles = []" size="sm" variant="destructive">
                  Clear All
                </Button>
              </div>

              <FileUpload
                v-model="statusDemoFiles"
                :upload-fn="simulateSlowUpload"
                :multiple="true"
                display-mode="grid"
                size="sm"
                :auto-upload="false"
              />
            </div>
          </Card>
        </div>

        <!-- Readonly/Disabled States -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Readonly & Disabled States</h3>
            <p class="text-gray-600">Examples of readonly and disabled file upload components</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card class="p-6">
              <h4 class="text-lg font-medium mb-4">Readonly with Files</h4>
              <FileUpload v-model="readonlyFiles" readonly display-mode="grid" size="sm" />
            </Card>

            <Card class="p-6">
              <h4 class="text-lg font-medium mb-4">Disabled State</h4>
              <FileUpload
                v-model="disabledFiles"
                disabled
                file-type="image"
                empty-state-height="h-32"
              />
            </Card>
          </div>
        </div>
      </section>
    </div>

    <!-- Toast notifications -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FileUpload } from '@/components/ui/file-upload'
import {
  ImageIcon,
  FileTextIcon,
  LoaderIcon,
  RefreshCwIcon,
  CheckIcon,
  PlusIcon,
  PlayIcon,
  CloudUploadIcon,
  VideoIcon,
  SparklesIcon,
  PaperclipIcon,
  ArrowUpIcon,
  SendIcon,
  FolderUpIcon,
} from 'lucide-vue-next'
import { z } from 'zod'
import type { ValidationRule } from '@/components/ui/file-upload'

// Define types
interface FileItem {
  id: string
  file?: File
  url?: string
  name: string
  size?: number
  type?: string
  status?: 'pending' | 'uploading' | 'completed' | 'failed'
  uploadPercentage?: number
  [key: string]: any
}

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

// Reactive state - Basic Examples
const basicFiles = ref<FileItem[]>([])
const imageFiles = ref<FileItem[]>([])
const documentFiles = ref<FileItem[]>([])
const avatarFile = ref<FileItem[]>([])
const resumeFile = ref<FileItem[]>([])

// Advanced Examples
const mediaLibraryFiles = ref<FileItem[]>([])
const batchFiles = ref<FileItem[]>([])
const premiumFiles = ref<FileItem[]>([])
const chatFiles = ref<FileItem[]>([])
const imageZoneFiles = ref<FileItem[]>([])
const documentZoneFiles = ref<FileItem[]>([])
const videoZoneFiles = ref<FileItem[]>([])
const darkThemeFiles = ref<FileItem[]>([])

// Testing & States
const statusDemoFiles = ref<FileItem[]>([])
const isSubmitting = ref(false)

// Form data
const formData = reactive({
  profilePicture: [] as FileItem[],
  documents: [] as FileItem[],
})

// Readonly/disabled demo files
const readonlyFiles = ref<FileItem[]>([
  {
    id: '1',
    name: 'existing-document.pdf',
    size: 1024000,
    type: 'application/pdf',
    status: 'completed',
    url: '/placeholder-document.pdf',
  },
  {
    id: '2',
    name: 'another-file.jpg',
    size: 2048000,
    type: 'image/jpeg',
    status: 'completed',
    url: '/placeholder-image.jpg',
  },
])

const disabledFiles = ref<FileItem[]>([])

// Computed properties for batch upload
const hasFailedFiles = computed(() => batchFiles.value.some((f) => f.status === 'failed'))
const hasCompletedFiles = computed(() => batchFiles.value.some((f) => f.status === 'completed'))
const hasPendingFiles = computed(() => batchFiles.value.some((f) => f.status === 'pending'))

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
async function simulateUpload(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const uploadTime = Math.random() * 2000 + 1000
    const shouldFail = Math.random() < 0.1

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Network error occurred'))
      } else {
        resolve()
      }
    }, uploadTime)
  })
}

async function simulateImageUpload(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const uploadTime = Math.random() * 3000 + 2000
    const shouldFail = Math.random() < 0.05

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Image processing failed'))
      } else {
        resolve()
      }
    }, uploadTime)
  })
}

async function simulateDocumentUpload(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const uploadTime = Math.random() * 4000 + 1000
    const shouldFail = Math.random() < 0.08

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Document upload failed'))
      } else {
        resolve()
      }
    }, uploadTime)
  })
}

async function simulateSlowUpload(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const uploadTime = 5000
    const shouldFail = Math.random() < 0.2

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Simulated upload failure'))
      } else {
        resolve()
      }
    }, uploadTime)
  })
}

async function simulateBatchUpload(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const uploadTime = Math.random() * 3000 + 1000
    const shouldFail = Math.random() < 0.15

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Batch upload failed'))
      } else {
        resolve()
      }
    }, uploadTime)
  })
}

// Event handlers
function onFilesAdded(files: FileItem[]) {
  toast({
    title: 'Files Added',
    description: `${files.length} file(s) added and upload started`,
  })
}

function onFileUploaded(file: FileItem) {
  toast({
    title: 'Upload Successful',
    description: `${file.name} uploaded successfully`,
    variant: 'default',
  })
}

function onFileFailed(file: FileItem, error: string) {
  toast({
    title: 'Upload Failed',
    description: `${file.name}: ${error}`,
    variant: 'destructive',
  })
}

function onValidationFailed(file: File, errors: string[]) {
  toast({
    title: 'Validation Failed',
    description: `${file.name}: ${errors.join(', ')}`,
    variant: 'destructive',
  })
}

// Batch upload functions
function startBatchUpload() {
  const pendingFiles = batchFiles.value.filter((f) => f.status === 'pending')
  pendingFiles.forEach((file) => {
    file.status = 'uploading'
    file.uploadPercentage = 0
    simulateBatchUpload(file.file!)
      .then(() => {
        file.status = 'completed'
        file.uploadPercentage = 100
      })
      .catch(() => {
        file.status = 'failed'
      })
  })

  toast({
    title: 'Batch Upload Started',
    description: `Started uploading ${pendingFiles.length} files`,
  })
}

function retryAllFailed() {
  const failedFiles = batchFiles.value.filter((f) => f.status === 'failed')
  failedFiles.forEach((file) => {
    file.status = 'pending'
    file.uploadPercentage = 0
  })

  toast({
    title: 'Retry Queued',
    description: `${failedFiles.length} files queued for retry`,
  })
}

function clearCompleted() {
  const initialLength = batchFiles.value.length
  batchFiles.value = batchFiles.value.filter((f) => f.status !== 'completed')
  const clearedCount = initialLength - batchFiles.value.length

  toast({
    title: 'Completed Files Cleared',
    description: `Removed ${clearedCount} completed files`,
  })
}

// Form handlers
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: 'Application Submitted',
      description: 'Your application has been submitted successfully!',
    })

    console.log('Form submitted:', values)
  } catch (error) {
    toast({
      title: 'Submission Failed',
      description: 'There was an error submitting your application.',
      variant: 'destructive',
    })
  } finally {
    isSubmitting.value = false
  }
})

function resetForm() {
  formData.profilePicture = []
  formData.documents = []
  resetVeeForm()

  toast({
    title: 'Form Reset',
    description: 'All form data has been cleared',
  })
}

// Demo functions
function addMockFile(status: 'pending' | 'uploading' | 'completed' | 'failed') {
  const mockFile: FileItem = {
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

<style scoped>
/* Custom scrollbar */
:deep(.file-container) {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

:deep(.file-container::-webkit-scrollbar) {
  width: 6px;
}

:deep(.file-container::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.file-container::-webkit-scrollbar-thumb) {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

:deep(.file-container::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Custom animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Glassmorphism effect */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* Custom gradient text */
.gradient-text {
  background: linear-gradient(45deg, #6366f1, #8b5cf6, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
