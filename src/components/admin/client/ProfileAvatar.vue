<script lang="ts" setup>
import { ref } from 'vue'
import { useClientStore } from '@/stores/clients'
import { FileItem, FileUpload } from '@/components/ui/file-upload'
import { ImageUp } from 'lucide-vue-next'
const { uploadProfilePicture } = useClientStore()

const props = defineProps<{
  name?: string
  id?: string
}>()
const avatarUrl = defineModel<string>('avatarUrl')
</script>
<template>
  <FileUpload :max-files="1" display-mode="single" shape="circle">
    <template #item="{ item }">
      <FileItem :key="item.id" :file="item" :display-mode="'list'" />
    </template>
    <template #empty-state="{ onClick }">
      <div
        @click="onClick"
        class="flex items-center justify-center rounded-full border-2 border-dashed border-muted-300 cursor-pointer size-20"
      >
        <ImageUp class="size-12 text-muted-foreground" />
      </div>
    </template>
  </FileUpload>
</template>
