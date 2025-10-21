# Image Upload Composable - Quick Start

## 🚀 Most Common Use Case

```typescript
import { useImageManager } from '@/composables/useImageUpload'
import { toast } from 'vue-sonner'
import { useQueryCache } from '@pinia/colada'

const queryCache = useQueryCache()

const imageManager = useImageManager({
  bucket: 'service-gallery',
  onUploadSuccess: (results) => {
    toast.success(`${results.length} images uploaded`)
    queryCache.invalidateQueries({ key: ['your-query-key'] })
  },
  onDeleteSuccess: () => {
    toast.success('Image deleted')
    queryCache.invalidateQueries({ key: ['your-query-key'] })
  },
  onError: (error) => {
    toast.error(error.message)
  }
})

// Upload
await imageManager.uploadImages(files, (file, i) => `path/${Date.now()}_${file.name}`)

// Delete
await imageManager.deleteImage({ path: 'path/image.jpg', imageUrl: 'https://...' })
```

## 📝 Common Patterns

### Pattern 1: Service Images

```typescript
// Upload service images
const uploadResults = await imageManager.uploadImages(
  files,
  (file, index) => `services/${serviceId}/${Date.now()}_${index}_${file.name}`
)

// Create database records
for (const result of uploadResults) {
  await supabase.from('service_images').insert({
    service_id: serviceId,
    image_url: result.imageUrl,
    image_path: result.imagePath,
    // metadata is automatically in image_metadata table
  })
}
```

### Pattern 2: Delete with Database Cleanup

```typescript
// Get image info
const { data: image } = await supabase
  .from('service_images')
  .select('image_path, image_url')
  .eq('id', imageId)
  .single()

// Delete from storage + metadata
await imageManager.deleteImage({
  path: image.image_path,
  imageUrl: image.image_url
})

// Delete from your table
await supabase.from('service_images').delete().eq('id', imageId)
```

### Pattern 3: Category/Addon Images

```typescript
// Same pattern, different bucket/path
const imageManager = useImageManager({ bucket: 'addon-gallery', ... })

await imageManager.uploadImages(
  [file],
  (file) => `addons/${addonId}/${Date.now()}_${file.name}`
)
```

## 🎯 What You Get Automatically

- ✅ Image dimensions extracted (width, height)
- ✅ File size and MIME type captured
- ✅ Metadata stored in `image_metadata` table
- ✅ Metadata deleted when image is removed
- ✅ Loading states (`isUploading`, `isDeleting`, `isProcessing`)
- ✅ Error handling

## ⚡ Quick Tips

1. **Always invalidate queries** after upload/delete
2. **Use timestamps** in filenames to avoid collisions
3. **Store both path and URL** in your database tables
4. **Check loading states** before showing UI feedback

## 📚 Need More?

- Full guide: [README.md](./README.md)
- Examples: [useImageUpload.example.ts](./useImageUpload.example.ts)
- Technical details: [docs/project/Image-Upload-Composables.md](../../docs/project/Image-Upload-Composables.md)
