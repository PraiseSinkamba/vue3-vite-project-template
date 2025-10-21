# Image Upload & Metadata Management System

## Overview

A comprehensive, reusable composable system for handling image uploads and deletions with automatic metadata management in the Perfect Finish application.

## 📦 What's Included

### Core Utilities (`src/composables/useImageUpload.ts`)

#### 1. **Upload Functions**
- `extractImageMetadata(file: File)` - Extract dimensions from image files
- `uploadImageWithMetadata(options)` - Upload single image with metadata
- `uploadMultipleImagesWithMetadata(options)` - Upload multiple images with metadata

#### 2. **Delete Functions**
- `deleteImageWithMetadata(options)` - Delete single image with metadata cleanup
- `deleteMultipleImagesWithMetadata(options)` - Delete multiple images with metadata cleanup

#### 3. **Composables**
- `useImageUpload(options)` - Upload-only composable with reactive state
- `useImageDeletion(options)` - Delete-only composable with reactive state
- `useImageManager(options)` - Complete image management (upload + delete)

## ✨ Key Features

### Automatic Metadata Management
- ✅ Automatically extracts image dimensions (width, height)
- ✅ Captures file size and MIME type
- ✅ Stores metadata in `image_metadata` table
- ✅ Automatically deletes metadata when images are removed
- ✅ Supports lookup by URL or path+bucket

### Developer Experience
- ✅ TypeScript support with full type safety
- ✅ Reactive loading states (`isUploading`, `isDeleting`, `isProcessing`)
- ✅ Built-in error handling
- ✅ Success/error callbacks
- ✅ Support for single and bulk operations
- ✅ Path generator functions for flexible naming

### Integration
- ✅ Works seamlessly with Supabase Storage
- ✅ Compatible with Pinia Colada mutations
- ✅ Easy to integrate with existing components
- ✅ Supports all storage buckets

## 🚀 Quick Start

### Basic Usage

```typescript
import { useImageManager } from '@/composables/useImageUpload'

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

// Upload
await imageManager.uploadImages(files, (file, i) => `path/${file.name}`)

// Delete
await imageManager.deleteImage({ path: 'path/image.jpg', imageUrl: 'https://...' })
```

## 📋 Implementation Details

### Metadata Storage

The system automatically manages records in the `image_metadata` table:

```sql
CREATE TABLE image_metadata (
  id UUID PRIMARY KEY,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  storage_bucket TEXT,
  original_filename TEXT,
  mime_type TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  is_optimized BOOLEAN,
  thumbnail_url TEXT,
  created_at TIMESTAMP
);
```

### Upload Flow

1. **Extract metadata** - Dimensions, file size, MIME type
2. **Upload to storage** - Supabase Storage bucket
3. **Get public URL** - Generate accessible URL
4. **Store metadata** - Save to `image_metadata` table
5. **Return result** - Complete upload information

### Delete Flow

1. **Delete from storage** - Remove file from bucket
2. **Delete metadata** - Clean up `image_metadata` record (by URL or path+bucket)
3. **Handle errors** - Graceful error handling

## 🔧 API Reference

### useImageManager

The recommended composable for complete image management.

```typescript
const imageManager = useImageManager({
  bucket: string                                    // Required: Storage bucket name
  onUploadSuccess?: (results: ImageUploadResult[]) => void
  onDeleteSuccess?: () => void
  onError?: (error: Error) => void
})

// Returns:
{
  uploadImages: (files: File[], pathGenerator: (file: File, index: number) => string) => Promise<ImageUploadResult[]>
  deleteImage: (options: { path: string; imageUrl?: string; deleteMetadata?: boolean }) => Promise<void>
  deleteImages: (images: Array<{ path: string; imageUrl?: string }>, deleteMetadata?: boolean) => Promise<void>
  isUploading: Ref<boolean>
  isDeleting: Ref<boolean>
  isProcessing: Ref<boolean>
  uploadError: Ref<Error | null>
  deleteError: Ref<Error | null>
}
```

### ImageUploadResult

```typescript
interface ImageUploadResult {
  imageUrl: string              // Public URL of uploaded image
  imagePath: string             // Storage path
  metadata: {
    width: number
    height: number
    fileSize: number
    mimeType: string
    originalFilename: string
  }
  metadataId?: string           // ID of metadata record
}
```

### DeleteImageOptions

```typescript
interface DeleteImageOptions {
  bucket: string                // Storage bucket name
  path: string                  // Storage path
  imageUrl?: string             // Optional: Image URL (for metadata lookup)
  deleteMetadata?: boolean      // Default: true
}
```

## 📝 Usage Examples

### Example 1: Service Images (Current Implementation)

See [ServiceForm.vue](../../src/components/admin/services/forms/ServiceForm.vue) for complete implementation:

```typescript
const imageManager = useImageManager({
  bucket: 'service-gallery',
  onUploadSuccess: (results) => {
    toast.success(`${results.length} images uploaded`)
    queryCache.invalidateQueries({ key: ['service-images'] })
  },
  onDeleteSuccess: () => {
    toast.success('Image deleted')
    queryCache.invalidateQueries({ key: ['service-images'] })
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

// Upload handler
const uploadResults = await imageManager.uploadImages(
  files,
  (file, index) => `services/${serviceId}/${Date.now()}_${index}_${file.name}`
)

// Create service_images records
for (const result of uploadResults) {
  await supabase.from('service_images').insert({
    service_id: serviceId,
    image_url: result.imageUrl,
    image_path: result.imagePath,
    // Metadata is automatically in image_metadata table
  })
}

// Delete handler
const deleteServiceImage = async (imageId: string) => {
  const { data: image } = await supabase
    .from('service_images')
    .select('image_path, image_url')
    .eq('id', imageId)
    .single()

  // Delete from storage and metadata
  await imageManager.deleteImage({
    path: image.image_path,
    imageUrl: image.image_url,
  })

  // Delete from service_images table
  await supabase.from('service_images').delete().eq('id', imageId)
}
```

### Example 2: Upload Only

```typescript
const { uploadImages, isUploading } = useImageUpload({
  bucket: 'past-work-gallery',
  onSuccess: (results) => console.log('Uploaded:', results),
  onError: (error) => console.error(error),
})

await uploadImages(files, (file, i) => `gallery/${Date.now()}_${file.name}`)
```

### Example 3: Delete Only

```typescript
const { deleteImage, isDeleting } = useImageDeletion({
  bucket: 'service-gallery',
  onSuccess: () => console.log('Deleted'),
  onError: (error) => console.error(error),
})

await deleteImage({ path: 'services/123/img.jpg', imageUrl: 'https://...' })
```

## 🛡️ Error Handling

The composables handle errors gracefully:

1. **Upload errors**: Invalid files, storage errors, metadata creation failures
2. **Delete errors**: Storage deletion failures, metadata cleanup failures
3. **Network errors**: Connection issues, timeouts

All errors are:
- Caught and converted to `Error` instances
- Passed to the `onError` callback
- Set in reactive error refs (`uploadError`, `deleteError`)
- Re-thrown for caller handling if needed

## 🔄 Migration Guide

### Before (Manual Management)

```typescript
// ❌ Manual storage and metadata
const { error } = await supabase.storage.from('bucket').upload(path, file)
const url = supabase.storage.from('bucket').getPublicUrl(path).data.publicUrl
await supabase.from('image_metadata').insert({ image_url: url, ... })

// Manual deletion
await supabase.storage.from('bucket').remove([path])
await supabase.from('image_metadata').delete().eq('image_url', url)
```

### After (Composable)

```typescript
// ✅ Automatic metadata management
const imageManager = useImageManager({ bucket: 'bucket', ... })

await imageManager.uploadImages(files, (file, i) => `path/${file.name}`)
await imageManager.deleteImage({ path, imageUrl })
```

## 📚 Documentation

- **Usage Guide**: [src/composables/README.md](../../src/composables/README.md)
- **Examples**: [src/composables/useImageUpload.example.ts](../../src/composables/useImageUpload.example.ts)
- **Implementation**: [src/composables/useImageUpload.ts](../../src/composables/useImageUpload.ts)

## ✅ Best Practices

1. **Always use the composables** instead of direct Supabase Storage calls
2. **Enable metadata** by setting `createMetadata: true` (default)
3. **Use `useImageManager`** when you need both upload and delete
4. **Generate unique paths** using timestamps or UUIDs
5. **Invalidate queries** after operations to refresh UI
6. **Handle errors** with `onError` callback
7. **Check loading states** before showing UI feedback

## 🔮 Future Enhancements

Potential additions:
- Image optimization (resize, compress)
- Thumbnail generation
- Image validation (dimensions, file size limits)
- Progress tracking for large uploads
- Retry logic for failed operations
- Batch operations with concurrency control

## 📊 Benefits

- **Consistency**: Same pattern across all image operations
- **Maintainability**: Centralized logic, easy to update
- **Type Safety**: Full TypeScript support
- **DX**: Simple API, clear documentation
- **Reliability**: Automatic metadata management prevents orphaned records
- **Performance**: Optimized with parallel operations where possible
