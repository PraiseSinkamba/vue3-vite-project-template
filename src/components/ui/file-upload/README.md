# FileUpload Component

A highly configurable, theme-aware file upload component built with VueUse and Tailwind CSS. Supports multiple display modes, shapes, and sizes with sensible defaults for quick development.

## Features

- ✅ **VueUse Integration**: Uses `useDropZone` and `useFileDialog` for modern file handling
- 🎨 **Theme-Aware**: All styling uses Tailwind theme tokens (no hardcoded colors)
- 📐 **Multiple Shapes**: Rectangle, square, circle, and rounded variants
- 📏 **Responsive Sizes**: XS to 2XL with automatic responsive grid layouts
- 📋 **Display Modes**: Grid, list, and single file modes
- 🔄 **Upload Management**: Built-in upload with progress tracking and retry
- ✨ **Clean & Minimal Design**: Light borders, smooth transitions, backdrop blur effects
- 🎯 **Easy Configuration**: Sensible defaults with extensive customization via props
- 🔧 **Flexible Styling**: Full Tailwind class support for custom layouts

## Basic Usage

### Simple Image Upload (Default)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FileUpload } from '@/components/ui/file-upload'
import type { FileRecord } from '@/components/ui/file-upload'

const files = ref<FileRecord[]>([])
</script>

<template>
  <FileUpload
    v-model="files"
    accept="image/*"
    multiple
    :max-files="5"
    :max-size="10 * 1024 * 1024"
    file-type="image"
  />
</template>
```

### Avatar Upload (Circle Shape)

```vue
<template>
  <FileUpload
    v-model="avatar"
    accept="image/*"
    shape="circle"
    size="lg"
    display-mode="single"
    height="auto"
    :max-size="2 * 1024 * 1024"
    file-type="image"
  />
</template>
```

### Document Upload (List Mode)

```vue
<template>
  <FileUpload
    v-model="documents"
    accept=".pdf,.doc,.docx"
    multiple
    display-mode="list"
    file-type="document"
    :max-files="10"
  />
</template>
```

### Gallery Upload (Square Grid)

```vue
<template>
  <FileUpload
    v-model="gallery"
    accept="image/*"
    multiple
    shape="square"
    size="sm"
    gap="sm"
    file-type="image"
    :max-files="20"
  />
</template>
```

## Props

### Upload Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `uploadUrl` | `string` | `undefined` | URL endpoint for file upload |
| `uploadFn` | `(file: File) => Promise<{url?: string; path?: string}>` | `undefined` | Custom upload function |
| `uploadConfig` | `UploadConfig` | `undefined` | Additional upload configuration (method, headers, etc.) |

### File Constraints

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | `'*/*'` | File types to accept (MIME types or extensions) |
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `maxFiles` | `number` | `0` | Maximum number of files (0 = unlimited) |
| `maxSize` | `number` | `10485760` | Maximum file size in bytes (default 10MB) |
| `minSize` | `number` | `0` | Minimum file size in bytes |

### Validation

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `validationRules` | `ValidationRule[]` | `[]` | Custom validation rules |

### Display Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `displayMode` | `'grid' \| 'list' \| 'single'` | `'grid'` | File display layout |
| `fileType` | `'image' \| 'document' \| 'video' \| 'file'` | `'file'` | File type label for UI |
| `shape` | `'rectangle' \| 'square' \| 'circle' \| 'rounded'` | `'rounded'` | Upload area shape |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Item size (affects grid columns) |
| `height` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' \| 'auto'` | `'md'` | Empty state height |
| `gap` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Grid gap size |
| `gridCols` | `number \| 'auto'` | `'auto'` | Override responsive grid columns |

### Behavior

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `readonly` | `boolean` | `false` | Disable all interactions |
| `disabled` | `boolean` | `false` | Disable upload (shows disabled state) |
| `autoUpload` | `boolean` | `false` | Automatically upload files on selection |
| `showProgress` | `boolean` | `true` | Show upload progress indicator |
| `showPreview` | `boolean` | `true` | Show preview button for images |
| `disableDragDrop` | `boolean` | `false` | Disable drag & drop functionality |

### Visual Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `containerClass` | `string` | `''` | Additional classes for container |
| `itemClass` | `string` | `''` | Additional classes for file items |
| `emptyStateClass` | `string` | `''` | Additional classes for empty state |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `files-added` | `FileRecord[]` | Emitted when files are added |
| `file-deleted` | `FileRecord` | Emitted when a file is deleted |
| `file-uploaded` | `FileRecord` | Emitted when upload completes |
| `file-failed` | `FileRecord, string` | Emitted when upload fails |
| `validation-failed` | `File, string[]` | Emitted when validation fails |
| `preview` | `FileRecord` | Emitted when preview is clicked |

## Slots

### `empty-state`

Customize the empty upload area.

```vue
<template>
  <FileUpload v-model="files">
    <template #empty-state="{ onClick, dropZoneActive }">
      <div @click="onClick">
        <!-- Custom empty state -->
      </div>
    </template>
  </FileUpload>
</template>
```

### `empty-icon`

Customize just the icon in the empty state.

```vue
<template>
  <FileUpload v-model="files">
    <template #empty-icon>
      <ImageIcon class="size-12 text-primary" />
    </template>
  </FileUpload>
</template>
```

## Advanced Examples

### With Custom Upload Function

```vue
<script setup lang="ts">
import { supabase } from '@/lib/supabase'

async function uploadToSupabase(file: File) {
  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(fileName)

  return { url: publicUrl }
}
</script>

<template>
  <FileUpload
    v-model="files"
    :upload-fn="uploadToSupabase"
    auto-upload
    accept="image/*"
    multiple
  />
</template>
```

### With Custom Validation

```vue
<script setup lang="ts">
import type { ValidationRule } from '@/components/ui/file-upload'

const validationRules: ValidationRule[] = [
  (file) => {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      return 'Only JPEG and PNG images are allowed'
    }
    return null
  },
  (file) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    return new Promise((resolve) => {
      img.onload = () => {
        if (img.width < 800 || img.height < 600) {
          resolve('Image must be at least 800x600 pixels')
        }
        resolve(null)
      }
    })
  },
]
</script>

<template>
  <FileUpload
    v-model="files"
    :validation-rules="validationRules"
    accept="image/*"
  />
</template>
```

### Profile Picture with Preview

```vue
<script setup lang="ts">
const profilePicture = ref<FileRecord[]>([])

function handlePreview(file: FileRecord) {
  // Open preview modal or dialog
  console.log('Preview:', file)
}
</script>

<template>
  <div class="space-y-4">
    <FileUpload
      v-model="profilePicture"
      shape="circle"
      size="xl"
      display-mode="single"
      accept="image/*"
      :max-size="5 * 1024 * 1024"
      file-type="image"
      container-class="max-w-sm mx-auto"
      @preview="handlePreview"
    />

    <p v-if="profilePicture[0]" class="text-center text-sm text-muted-foreground">
      {{ profilePicture[0].name }}
    </p>
  </div>
</template>
```

### Compact Gallery Grid

```vue
<template>
  <FileUpload
    v-model="gallery"
    accept="image/*"
    multiple
    shape="square"
    size="xs"
    gap="sm"
    :max-files="50"
    file-type="image"
    container-class="max-w-4xl"
  />
</template>
```

### Custom Styled Upload Area

```vue
<template>
  <FileUpload
    v-model="files"
    accept="image/*"
    multiple
    shape="rounded"
    height="lg"
    container-class="border-2 border-dashed border-primary/50 rounded-2xl p-4"
    empty-state-class="bg-gradient-to-br from-primary/5 to-primary/10"
  />
</template>
```

## Styling with Tailwind

The component is designed to be styled primarily with Tailwind CSS:

```vue
<!-- Avatar upload with custom styling -->
<FileUpload
  v-model="avatar"
  shape="circle"
  size="lg"
  display-mode="single"
  container-class="w-32 h-32"
  item-class="border-4 border-primary"
/>

<!-- Square grid with custom gap and responsive columns -->
<FileUpload
  v-model="images"
  shape="square"
  gap="lg"
  :grid-cols="3"
  container-class="max-w-2xl mx-auto"
/>

<!-- List mode with custom styling -->
<FileUpload
  v-model="documents"
  display-mode="list"
  container-class="max-w-md"
  item-class="hover:bg-primary/5"
/>
```

## Shape Variants

### Circle
Perfect for avatars and profile pictures:
```vue
<FileUpload shape="circle" size="xl" display-mode="single" />
```

### Square
Ideal for Instagram-style galleries:
```vue
<FileUpload shape="square" size="sm" multiple />
```

### Rounded
Modern, friendly appearance (default):
```vue
<FileUpload shape="rounded" />
```

### Rectangle
Traditional upload area:
```vue
<FileUpload shape="rectangle" height="lg" />
```

## Size Variants

Sizes automatically adjust grid columns for responsive layouts:

- **xs**: 8 columns on large screens (tiny thumbnails)
- **sm**: 6 columns on large screens (small thumbnails)
- **md**: 4 columns on large screens (medium tiles) - **default**
- **lg**: 3 columns on large screens (large tiles)
- **xl**: 2 columns on large screens (extra large tiles)
- **2xl**: 1 column (full width items)

## Theme Awareness

All colors use Tailwind theme tokens:

- `bg-background` - Component backgrounds
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `border-border` - Borders
- `bg-muted` - Muted backgrounds
- `bg-primary` - Primary actions
- `bg-destructive` - Delete/error states
- `bg-secondary` - Secondary actions

This ensures the component automatically adapts to light/dark themes.

## Exposed Methods

```vue
<script setup lang="ts">
const uploadRef = ref()

// Programmatically trigger file selection
uploadRef.value?.triggerFileInput()

// Add files programmatically
uploadRef.value?.addFiles([file1, file2])

// Remove a file
uploadRef.value?.removeFile(fileRecord)

// Manually trigger upload
uploadRef.value?.uploadFiles(fileRecords)

// Access current files
console.log(uploadRef.value?.files)
</script>

<template>
  <FileUpload ref="uploadRef" v-model="files" />
</template>
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  FileRecord,
  FileUploadProps,
  DisplayMode,
  ShapeVariant,
  SizeVariant,
  ValidationRule,
  UploadConfig,
} from '@/components/ui/file-upload'
```

## Best Practices

1. **Always specify `accept`**: Improve UX by filtering file types
2. **Set reasonable `maxSize`**: Prevent large uploads (default is 10MB)
3. **Use appropriate `shape`**: Circle for avatars, square for galleries
4. **Choose correct `displayMode`**: Single for avatars, grid for galleries, list for documents
5. **Provide `fileType`**: Improves messaging ("Drop images here" vs "Drop files here")
6. **Handle events**: Listen to `validation-failed` and `file-failed` for error handling
7. **Use `readonly` prop**: For displaying uploaded files without edit capability
8. **Leverage slots**: Customize empty states for better UX
9. **Theme tokens only**: Never use hardcoded colors, always use Tailwind theme tokens

## Accessibility

- Keyboard accessible (Space/Enter to open file dialog)
- Proper ARIA labels
- Focus states for interactive elements
- Screen reader friendly status updates
- High contrast theme token colors
