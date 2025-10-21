import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { TablesInsert } from '@/types/database.types'

/**
 * Extract image dimensions from a File object
 */
export function extractImageMetadata(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

export interface ImageUploadOptions {
  /**
   * Supabase storage bucket name
   */
  bucket: string
  /**
   * Storage path for the file (e.g., 'services/service-id/filename.jpg')
   */
  path: string
  /**
   * The file to upload
   */
  file: File
  /**
   * Whether to create image metadata entry (default: true)
   */
  createMetadata?: boolean
}

export interface ImageUploadResult {
  /**
   * Public URL of the uploaded image
   */
  imageUrl: string
  /**
   * Storage path of the uploaded image
   */
  imagePath: string
  /**
   * Image metadata (width, height, size, etc.)
   */
  metadata: {
    width: number
    height: number
    fileSize: number
    mimeType: string
    originalFilename: string
  }
  /**
   * Image metadata record ID (if createMetadata was true)
   */
  metadataId?: string
}

/**
 * Upload an image to Supabase storage and optionally create metadata entry
 *
 * @example
 * ```ts
 * const result = await uploadImageWithMetadata({
 *   bucket: 'service-gallery',
 *   path: `services/${serviceId}/${Date.now()}_${file.name}`,
 *   file: file,
 *   createMetadata: true
 * })
 * ```
 */
export async function uploadImageWithMetadata(
  options: ImageUploadOptions,
): Promise<ImageUploadResult> {
  const { bucket, path, file, createMetadata = true } = options

  // Extract image dimensions
  const { width, height } = await extractImageMetadata(file)

  // Upload to storage
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file)

  if (uploadError) throw uploadError

  // Get public URL
  const imageUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl

  const metadata = {
    width,
    height,
    fileSize: file.size,
    mimeType: file.type,
    originalFilename: file.name,
  }

  let metadataId: string | undefined

  // Create image metadata entry if requested
  if (createMetadata) {
    const metadataInsert: TablesInsert<'image_metadata'> = {
      image_url: imageUrl,
      storage_path: path,
      storage_bucket: bucket,
      original_filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      width,
      height,
    }

    const { data: metadataData, error: metadataError } = await supabase
      .from('image_metadata')
      .insert(metadataInsert)
      .select('id')
      .single()

    if (metadataError) throw metadataError

    metadataId = metadataData.id
  }

  return {
    imageUrl,
    imagePath: path,
    metadata,
    metadataId,
  }
}

/**
 * Upload multiple images to Supabase storage with metadata
 *
 * @example
 * ```ts
 * const results = await uploadMultipleImagesWithMetadata({
 *   bucket: 'service-gallery',
 *   files: selectedFiles,
 *   pathGenerator: (file, index) => `services/${serviceId}/${Date.now()}_${index}_${file.name}`,
 *   createMetadata: true
 * })
 * ```
 */
export async function uploadMultipleImagesWithMetadata(options: {
  bucket: string
  files: File[]
  pathGenerator: (file: File, index: number) => string
  createMetadata?: boolean
}): Promise<ImageUploadResult[]> {
  const { bucket, files, pathGenerator, createMetadata = true } = options

  const uploadPromises = files.map((file, index) =>
    uploadImageWithMetadata({
      bucket,
      path: pathGenerator(file, index),
      file,
      createMetadata,
    }),
  )

  return await Promise.all(uploadPromises)
}

export interface DeleteImageOptions {
  /**
   * Storage bucket name
   */
  bucket: string
  /**
   * Storage path of the image
   */
  path: string
  /**
   * Image URL to delete metadata for (optional - will be looked up from path if not provided)
   */
  imageUrl?: string
  /**
   * Whether to delete image metadata entry (default: true)
   */
  deleteMetadata?: boolean
}

/**
 * Delete an image from storage and optionally its metadata
 *
 * @example
 * ```ts
 * await deleteImageWithMetadata({
 *   bucket: 'service-gallery',
 *   path: 'services/123/image.jpg',
 *   imageUrl: 'https://...',
 *   deleteMetadata: true
 * })
 * ```
 */
export async function deleteImageWithMetadata(options: DeleteImageOptions): Promise<void> {
  const { bucket, path, imageUrl, deleteMetadata = true } = options

  // Delete from storage first
  const { error: storageError } = await supabase.storage.from(bucket).remove([path])
  if (storageError) throw storageError

  // Delete metadata entry if requested
  if (deleteMetadata) {
    // If imageUrl is provided, use it to delete metadata
    if (imageUrl) {
      const { error: metadataError } = await supabase
        .from('image_metadata')
        .delete()
        .eq('image_url', imageUrl)

      if (metadataError) throw metadataError
    } else {
      // Otherwise, use storage_path and bucket to find and delete metadata
      const { error: metadataError } = await supabase
        .from('image_metadata')
        .delete()
        .eq('storage_path', path)
        .eq('storage_bucket', bucket)

      if (metadataError) throw metadataError
    }
  }
}

/**
 * Delete multiple images from storage with their metadata
 *
 * @example
 * ```ts
 * await deleteMultipleImagesWithMetadata({
 *   bucket: 'service-gallery',
 *   images: [
 *     { path: 'services/123/img1.jpg', imageUrl: 'https://...' },
 *     { path: 'services/123/img2.jpg', imageUrl: 'https://...' }
 *   ],
 *   deleteMetadata: true
 * })
 * ```
 */
export async function deleteMultipleImagesWithMetadata(options: {
  bucket: string
  images: Array<{ path: string; imageUrl?: string }>
  deleteMetadata?: boolean
}): Promise<void> {
  const { bucket, images, deleteMetadata = true } = options

  const deletePromises = images.map((image) =>
    deleteImageWithMetadata({
      bucket,
      path: image.path,
      imageUrl: image.imageUrl,
      deleteMetadata,
    }),
  )

  await Promise.all(deletePromises)
}

/**
 * Composable for image uploads with reactive state
 *
 * @example
 * ```ts
 * const { uploadImages, isUploading, uploadError } = useImageUpload({
 *   bucket: 'service-gallery',
 *   onSuccess: (results) => {
 *     toast.success(`${results.length} images uploaded`)
 *   },
 *   onError: (error) => {
 *     toast.error('Failed to upload images')
 *   }
 * })
 *
 * await uploadImages(files, (file, index) => `path/${file.name}`)
 * ```
 */
export function useImageUpload(options: {
  bucket: string
  onSuccess?: (results: ImageUploadResult[]) => void
  onError?: (error: Error) => void
}) {
  const { bucket, onSuccess, onError } = options

  const isUploading = ref(false)
  const uploadError = ref<Error | null>(null)

  async function uploadImages(
    files: File[],
    pathGenerator: (file: File, index: number) => string,
  ): Promise<ImageUploadResult[]> {
    isUploading.value = true
    uploadError.value = null

    try {
      const results = await uploadMultipleImagesWithMetadata({
        bucket,
        files,
        pathGenerator,
        createMetadata: true,
      })

      onSuccess?.(results)
      return results
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed')
      uploadError.value = err
      onError?.(err)
      throw err
    } finally {
      isUploading.value = false
    }
  }

  return {
    uploadImages,
    isUploading,
    uploadError,
  }
}

/**
 * Composable for image deletion with reactive state
 *
 * @example
 * ```ts
 * const { deleteImage, deleteImages, isDeleting, deleteError } = useImageDeletion({
 *   bucket: 'service-gallery',
 *   onSuccess: () => {
 *     toast.success('Image deleted')
 *   },
 *   onError: (error) => {
 *     toast.error('Failed to delete image')
 *   }
 * })
 *
 * await deleteImage({ path: 'services/123/img.jpg', imageUrl: 'https://...' })
 * ```
 */
export function useImageDeletion(options: {
  bucket: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}) {
  const { bucket, onSuccess, onError } = options

  const isDeleting = ref(false)
  const deleteError = ref<Error | null>(null)

  async function deleteImage(image: {
    path: string
    imageUrl?: string
    deleteMetadata?: boolean
  }): Promise<void> {
    isDeleting.value = true
    deleteError.value = null

    try {
      await deleteImageWithMetadata({
        bucket,
        path: image.path,
        imageUrl: image.imageUrl,
        deleteMetadata: image.deleteMetadata ?? true,
      })

      onSuccess?.()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Delete failed')
      deleteError.value = err
      onError?.(err)
      throw err
    } finally {
      isDeleting.value = false
    }
  }

  async function deleteImages(
    images: Array<{ path: string; imageUrl?: string }>,
    deleteMetadata = true,
  ): Promise<void> {
    isDeleting.value = true
    deleteError.value = null

    try {
      await deleteMultipleImagesWithMetadata({
        bucket,
        images,
        deleteMetadata,
      })

      onSuccess?.()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Bulk delete failed')
      deleteError.value = err
      onError?.(err)
      throw err
    } finally {
      isDeleting.value = false
    }
  }

  return {
    deleteImage,
    deleteImages,
    isDeleting,
    deleteError,
  }
}

/**
 * Complete image management composable with upload and delete functionality
 *
 * @example
 * ```ts
 * const imageManager = useImageManager({
 *   bucket: 'service-gallery',
 *   onUploadSuccess: (results) => toast.success(`${results.length} uploaded`),
 *   onDeleteSuccess: () => toast.success('Deleted'),
 *   onError: (error) => toast.error(error.message)
 * })
 *
 * // Upload images
 * await imageManager.uploadImages(files, (file, i) => `services/${id}/${i}_${file.name}`)
 *
 * // Delete an image
 * await imageManager.deleteImage({ path: 'services/123/img.jpg', imageUrl: 'https://...' })
 * ```
 */
export function useImageManager(options: {
  bucket: string
  onUploadSuccess?: (results: ImageUploadResult[]) => void
  onDeleteSuccess?: () => void
  onError?: (error: Error) => void
}) {
  const { bucket, onUploadSuccess, onDeleteSuccess, onError } = options

  const upload = useImageUpload({
    bucket,
    onSuccess: onUploadSuccess,
    onError,
  })

  const deletion = useImageDeletion({
    bucket,
    onSuccess: onDeleteSuccess,
    onError,
  })

  const isProcessing = ref(false)

  // Wrap functions to set unified processing state
  async function uploadImages(
    files: File[],
    pathGenerator: (file: File, index: number) => string,
  ): Promise<ImageUploadResult[]> {
    isProcessing.value = true
    try {
      return await upload.uploadImages(files, pathGenerator)
    } finally {
      isProcessing.value = false
    }
  }

  async function deleteImage(image: {
    path: string
    imageUrl?: string
    deleteMetadata?: boolean
  }): Promise<void> {
    isProcessing.value = true
    try {
      await deletion.deleteImage(image)
    } finally {
      isProcessing.value = false
    }
  }

  async function deleteImages(
    images: Array<{ path: string; imageUrl?: string }>,
    deleteMetadata = true,
  ): Promise<void> {
    isProcessing.value = true
    try {
      await deletion.deleteImages(images, deleteMetadata)
    } finally {
      isProcessing.value = false
    }
  }

  return {
    // Upload
    uploadImages,
    isUploading: upload.isUploading,
    uploadError: upload.uploadError,

    // Delete
    deleteImage,
    deleteImages,
    isDeleting: deletion.isDeleting,
    deleteError: deletion.deleteError,

    // Combined state
    isProcessing,
  }
}
