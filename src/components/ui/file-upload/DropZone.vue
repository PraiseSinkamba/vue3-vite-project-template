<script setup lang="ts">
import { useDropZone } from '@vueuse/core'
import { ref } from 'vue'

const emit = defineEmits<{
  'files-dropped': [files: File[]]
}>()

const props = withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false,
  }
)

const dropZoneRef = ref<HTMLDivElement>()

function onDrop(files: File[] | null) {
  if (!files || files.length === 0 || props.disabled) return
  emit('files-dropped', files)
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
  dataTypes: ['Files'],
})
</script>

<template>
  <div ref="dropZoneRef">
    <slot :drop-zone-active="isOverDropZone && !disabled" />
  </div>
</template>
