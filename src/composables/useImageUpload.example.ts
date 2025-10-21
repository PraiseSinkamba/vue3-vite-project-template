/**
 * Example usage of image upload composables
 * This file demonstrates how to use the image management utilities
 */

import { useImageManager, useImageUpload, useImageDeletion } from './useImageUpload'
import { toast } from 'vue-sonner'
import { useQueryCache } from '@pinia/colada'
import { supabase } from '@/lib/supabase'

// Example 1: Complete image management (upload + delete)
export function exampleImageManager(serviceId: string) {
  const queryCache = useQueryCache()

  const imageManager = useImageManager({
    bucket: 'service-gallery',
    onUploadSuccess: (results) => {
      toast.success(`${results.length} images uploaded successfully`)
      queryCache.invalidateQueries({ key: ['service-images', serviceId] })
    },
    onDeleteSuccess: () => {
      toast.success('Image deleted successfully')
      queryCache.invalidateQueries({ key: ['service-images', serviceId] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Upload images with automatic metadata
  const uploadServiceImages = async (files: File[]) => {
    const uploadResults = await imageManager.uploadImages(
      files,
      (file, index) => `services/${serviceId}/${Date.now()}_${index}_${file.name}`,
    )

    // Create service_images records
    const serviceImagePromises = uploadResults.map(async (result, index) => {
      const { data, error } = await supabase
        .from('service_images')
        .insert({
          service_id: serviceId,
          image_url: result.imageUrl,
          image_path: result.imagePath,
          title: result.metadata.originalFilename.replace(/\.[^/.]+$/, ''),
          image_type: 'gallery',
          display_order: index + 1,
        })
        .select()
        .single()

      if (error) throw error
      return data
    })

    return await Promise.all(serviceImagePromises)
  }

  // Delete image with automatic metadata cleanup
  const deleteServiceImage = async (imageId: string) => {
    // Get image details
    const { data: image } = await supabase
      .from('service_images')
      .select('image_path, image_url')
      .eq('id', imageId)
      .single()

    if (!image?.image_path) {
      throw new Error('Image not found')
    }

    // Delete from storage and metadata automatically
    await imageManager.deleteImage({
      path: image.image_path,
      imageUrl: image.image_url,
      deleteMetadata: true,
    })

    // Delete from service_images table
    await supabase.from('service_images').delete().eq('id', imageId)
  }

  return {
    uploadServiceImages,
    deleteServiceImage,
    isUploading: imageManager.isUploading,
    isDeleting: imageManager.isDeleting,
    isProcessing: imageManager.isProcessing,
  }
}

// Example 2: Upload only
export function exampleUploadOnly() {
  const { uploadImages, isUploading, uploadError } = useImageUpload({
    bucket: 'past-work-gallery',
    onSuccess: (results) => {
      toast.success(`${results.length} images uploaded`)
      console.log('Upload results:', results)
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`)
    },
  })

  const handleUpload = async (files: File[], clientId: string) => {
    return await uploadImages(files, (file, index) => `clients/${clientId}/${Date.now()}_${file.name}`)
  }

  return {
    handleUpload,
    isUploading,
    uploadError,
  }
}

// Example 3: Delete only
export function exampleDeleteOnly() {
  const { deleteImage, deleteImages, isDeleting, deleteError } = useImageDeletion({
    bucket: 'service-gallery',
    onSuccess: () => {
      toast.success('Image deleted successfully')
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`)
    },
  })

  // Delete single image
  const removeSingleImage = async (path: string, imageUrl: string) => {
    await deleteImage({
      path,
      imageUrl,
      deleteMetadata: true,
    })
  }

  // Delete multiple images
  const removeBulkImages = async (images: Array<{ path: string; imageUrl: string }>) => {
    await deleteImages(images, true)
  }

  return {
    removeSingleImage,
    removeBulkImages,
    isDeleting,
    deleteError,
  }
}

// Example 4: Using standalone functions
export async function exampleStandaloneFunctions() {
  const { uploadImageWithMetadata, deleteImageWithMetadata } = await import('./useImageUpload')

  // Upload single image
  const file = new File([''], 'image.jpg', { type: 'image/jpeg' })
  const uploadResult = await uploadImageWithMetadata({
    bucket: 'service-gallery',
    path: `services/123/image.jpg`,
    file: file,
    createMetadata: true,
  })

  console.log('Uploaded:', uploadResult.imageUrl)
  console.log('Metadata ID:', uploadResult.metadataId)

  // Delete image with metadata
  await deleteImageWithMetadata({
    bucket: 'service-gallery',
    path: 'services/123/image.jpg',
    imageUrl: uploadResult.imageUrl,
    deleteMetadata: true,
  })
}
