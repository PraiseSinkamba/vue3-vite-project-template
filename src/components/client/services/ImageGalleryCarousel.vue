<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { ServiceImage } from '@/types'

interface Props {
  images: ServiceImage[]
  initialIndex?: number
  open: boolean
  serviceName: string
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
})

const emit = defineEmits<{
  close: []
  'update:open': [value: boolean]
}>()

const currentIndex = ref(props.initialIndex)

// Reset index when images change or initialIndex changes
watch(() => props.initialIndex, (newIndex) => {
  currentIndex.value = newIndex
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    currentIndex.value = props.initialIndex
    // Prevent body scroll when carousel is open
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const currentImage = computed(() => props.images[currentIndex.value])

const canGoPrevious = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value < props.images.length - 1)

const goToPrevious = () => {
  if (canGoPrevious.value) {
    currentIndex.value--
  }
}

const goToNext = () => {
  if (canGoNext.value) {
    currentIndex.value++
  }
}

const goToImage = (index: number) => {
  currentIndex.value = index
}

const handleClose = () => {
  emit('close')
  emit('update:open', false)
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.open) return

  switch (event.key) {
    case 'Escape':
      handleClose()
      break
    case 'ArrowLeft':
      goToPrevious()
      break
    case 'ArrowRight':
      goToNext()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <!-- Header -->
        <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/50 to-transparent">
          <div class="flex-1">
            <p class="text-white/80 text-sm md:text-base">
              {{ currentIndex + 1 }} / {{ images.length }}
            </p>
            <h3 v-if="currentImage?.title" class="text-white font-medium text-lg md:text-xl mt-1">
              {{ currentImage.title }}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="text-white hover:bg-white/10 rounded-full"
            @click="handleClose"
          >
            <X class="w-6 h-6" />
          </Button>
        </div>

        <!-- Main Image -->
        <div class="absolute inset-0 flex items-center justify-center p-4 md:p-20">
          <Transition
            mode="out-in"
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-300"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <img
              :key="currentIndex"
              :src="currentImage?.image_url"
              :alt="currentImage?.alt_text || serviceName"
              class="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />
          </Transition>
        </div>

        <!-- Navigation Buttons -->
        <button
          v-if="canGoPrevious"
          class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          @click="goToPrevious"
        >
          <ChevronLeft class="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <button
          v-if="canGoNext"
          class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          @click="goToNext"
        >
          <ChevronRight class="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <!-- Thumbnails -->
        <div class="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/50 to-transparent">
          <div class="flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-hide">
            <button
              v-for="(image, index) in images"
              :key="image.id"
              class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
              :class="{
                'border-white scale-105': index === currentIndex,
                'border-white/30 hover:border-white/60': index !== currentIndex,
              }"
              @click="goToImage(index)"
            >
              <img
                :src="image.image_url"
                :alt="image.alt_text || `${serviceName} ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Image Description -->
        <div
          v-if="currentImage?.description"
          class="absolute bottom-24 md:bottom-32 left-0 right-0 px-4 md:px-6"
        >
          <div class="max-w-2xl mx-auto bg-black/50 backdrop-blur-sm rounded-lg p-4">
            <p class="text-white/90 text-sm md:text-base text-center">
              {{ currentImage.description }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
