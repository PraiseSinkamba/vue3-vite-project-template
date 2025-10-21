# Image Upload Composables

Reusable composables for handling image uploads and deletions with automatic metadata management.

## Features

- ✅ Automatic image metadata extraction (dimensions, file size, MIME type)
- ✅ Automatic metadata storage in `image_metadata` table
- ✅ Automatic metadata deletion when images are removed
- ✅ Support for single and bulk operations
- ✅ Built-in loading states and error handling
- ✅ TypeScript support

## Quick Start

### Basic Usage - Upload & Delete

```typescript
import { useImageManager } from '@/composables/useImageUpload'
import { toast } from 'vue-sonner'

const imageManager = useImageManager({
  bucket: 'service-gallery',
  onUploadSuccess: (results) => {
    toast.success(`${results.length} images uploaded`)
  },
  onDeleteSuccess: () => {
    toast.success('Image deleted')
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

// Upload images
const files: File[] = [/* selected files */]
await imageManager.uploadImages(
  files,
  (file, index) => `services/${serviceId}/${Date.now()}_${index}_${file.name}`
)

// Delete an image
await imageManager.deleteImage({
  path: 'services/123/image.jpg',
  imageUrl: 'https://...',
  deleteMetadata: true // default: true
})

// Delete multiple images
await imageManager.deleteImages([
  { path: 'services/123/img1.jpg', imageUrl: 'https://...' },
  { path: 'services/123/img2.jpg' }
])
```

### Upload Only

```typescript
import { useImageUpload } from '@/composables/useImageUpload'

const { uploadImages, isUploading, uploadError } = useImageUpload({
  bucket: 'service-gallery',
  onSuccess: (results) => {
    console.log('Uploaded:', results)
  },
  onError: (error) => {
    console.error('Upload failed:', error)
  }
})

await uploadImages(files, (file, index) => `path/${file.name}`)
```

### Delete Only

```typescript
import { useImageDeletion } from '@/composables/useImageUpload'

const { deleteImage, deleteImages, isDeleting, deleteError } = useImageDeletion({
  bucket: 'service-gallery',
  onSuccess: () => {
    console.log('Deleted successfully')
  },
  onError: (error) => {
    console.error('Delete failed:', error)
  }
})

await deleteImage({
  path: 'services/123/img.jpg',
  imageUrl: 'https://...'
})
```

## Standalone Functions

### Upload Images

```typescript
import { uploadImageWithMetadata, uploadMultipleImagesWithMetadata } from '@/composables/useImageUpload'

// Single image
const result = await uploadImageWithMetadata({
  bucket: 'service-gallery',
  path: `services/${serviceId}/${file.name}`,
  file: file,
  createMetadata: true // default: true
})

// Multiple images
const results = await uploadMultipleImagesWithMetadata({
  bucket: 'service-gallery',
  files: selectedFiles,
  pathGenerator: (file, index) => `services/${serviceId}/${Date.now()}_${index}_${file.name}`,
  createMetadata: true
})
```

### Delete Images

```typescript
import { deleteImageWithMetadata, deleteMultipleImagesWithMetadata } from '@/composables/useImageUpload'

// Single image
await deleteImageWithMetadata({
  bucket: 'service-gallery',
  path: 'services/123/image.jpg',
  imageUrl: 'https://...', // optional - will lookup from path/bucket if not provided
  deleteMetadata: true // default: true
})

// Multiple images
await deleteMultipleImagesWithMetadata({
  bucket: 'service-gallery',
  images: [
    { path: 'services/123/img1.jpg', imageUrl: 'https://...' },
    { path: 'services/123/img2.jpg' }
  ],
  deleteMetadata: true
})
```

## Complete Example - Service Images

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useImageManager } from '@/composables/useImageUpload'
import { useQueryCache } from '@pinia/colada'
import { toast } from 'vue-sonner'

const props = defineProps<{
  serviceId: string
}>()

const queryCache = useQueryCache()

// Image manager with automatic metadata handling
const imageManager = useImageManager({
  bucket: 'service-gallery',
  onUploadSuccess: (results) => {
    toast.success(`${results.length} images uploaded`)
    queryCache.invalidateQueries({ key: ['service-images', props.serviceId] })
  },
  onDeleteSuccess: () => {
    toast.success('Image deleted')
    queryCache.invalidateQueries({ key: ['service-images', props.serviceId] })
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

// Upload handler
const handleUpload = async (files: File[]) => {
  const results = await imageManager.uploadImages(
    files,
    (file, index) => `services/${props.serviceId}/${Date.now()}_${index}_${file.name}`
  )

  // Create service_images records
  for (const result of results) {
    await supabase.from('service_images').insert({
      service_id: props.serviceId,
      image_url: result.imageUrl,
      image_path: result.imagePath,
      // Metadata is automatically stored in image_metadata table
    })
  }
}

// Delete handler
const handleDelete = async (imageId: string, imagePath: string, imageUrl: string) => {
  // Delete from storage and metadata
  await imageManager.deleteImage({
    path: imagePath,
    imageUrl: imageUrl,
  })

  // Delete from service_images table
  await supabase.from('service_images').delete().eq('id', imageId)
}
</script>
```

## Return Types

### ImageUploadResult

```typescript
interface ImageUploadResult {
  imageUrl: string           // Public URL of uploaded image
  imagePath: string          // Storage path
  metadata: {
    width: number
    height: number
    fileSize: number
    mimeType: string
    originalFilename: string
  }
  metadataId?: string        // ID of created metadata record
}
```

## Best Practices

1. **Always use the composables** instead of calling Supabase storage directly
2. **Let metadata be managed automatically** - set `createMetadata: true` (default)
3. **Use `useImageManager`** when you need both upload and delete functionality
4. **Invalidate queries** after successful operations to refresh UI
5. **Use unique path generators** to avoid filename conflicts
6. **Handle errors gracefully** with `onError` callback

## Migration Guide

### Before (Manual)

```typescript
// ❌ Old way - manual storage + metadata management
const { error: uploadError } = await supabase.storage
  .from('service-gallery')
  .upload(path, file)

if (uploadError) throw uploadError

const imageUrl = supabase.storage.from('service-gallery').getPublicUrl(path).data.publicUrl

// Manually create metadata
await supabase.from('image_metadata').insert({
  image_url: imageUrl,
  storage_path: path,
  // ... manual metadata
})

// Manual deletion
await supabase.storage.from('service-gallery').remove([path])
await supabase.from('image_metadata').delete().eq('image_url', imageUrl)
```

### After (Composable)

```typescript
// ✅ New way - automatic metadata management
const imageManager = useImageManager({
  bucket: 'service-gallery',
  onUploadSuccess: (results) => {
    // Metadata automatically created
  },
  onDeleteSuccess: () => {
    // Metadata automatically deleted
  },
  onError: (error) => {
    // Handle errors
  },
})

// Upload with automatic metadata
await imageManager.uploadImages(files, (file, i) => `path/${file.name}`)

// Delete with automatic metadata cleanup
await imageManager.deleteImage({ path: 'path/image.jpg', imageUrl: 'https://...' })
```
