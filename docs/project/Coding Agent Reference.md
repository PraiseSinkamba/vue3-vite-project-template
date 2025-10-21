# Perfect Finish - Coding Agent Reference Documentation

## 🎯 Project Overview & Business Domain

### Core Business Model
Perfect Finish is a **professional nail salon management system** designed for an existing nail salon business. This is a production-ready application that handles both operational management and client-facing services.

**Critical Business Context:**
- **Existing Business**: This system supports a real nail salon with existing clientele and portfolio
- **Visual-First Experience**: The gallery system is absolutely critical for showcasing past work and attracting clients
- **Dual Language Support**: Turkish and English for diverse clientele (Client: TR/EN, Admin: EN only)
- **Professional Services**: High-end nail services including polygel, chrome effects, nail art, and custom designs

### Key Business Entities & Their Purpose

**Core Identity:**
- **Profiles**: All users (clients, technicians, admins) extending Supabase auth
- **Client Dual Forms**: Nail measurements for efficiency (critical for preparation)

**Service Catalog:**
- **Service Categories** → **Services** → **Service Bundles**
- **Addons**: Optional service extras (chrome, rhinestones, etc.)
- **Service Images**: Professional portfolio for each service type
- **Past Work Gallery**: Completed client work showcase (marketing critical)

**Business Operations:**
- **Appointments**: Core business transactions linking client + technician + service
- **Invoices**: Financial records with loyalty integration
- **Loyalty System**: Points-based rewards and referral tracking

**Visual Content System** (Business Critical):
- **Service Images**: Portfolio showcasing what services look like
- **Past Work Gallery**: Before/after examples of completed work
- **Image Metadata**: File management and optimization system

---

## 🏗️ Technical Architecture

### Technology Stack (Non-Negotiable)
- **Frontend**: Vue 3 + TypeScript (strict mode) + Vite
- **UI Framework**: shadcn-vue + Tailwind CSS (theme-aware dark/light)
- **State Management**: Pinia (Options API only) + Pinia Colada (data fetching)
- **Backend**: Supabase (PostgreSQL + authentication + file storage)
- **Routing**: unplugin-vue-router (file-based routing only)
- **Forms**: vee-validate + Zod validation + shadcn-vue forms
- **Internationalization**: Vue I18n (Client: TR/EN, Admin: EN)
- **Icons**: Lucide Vue Next
- **Date Handling**: date-fns

### Project Structure (Enforced)
```
src/
├── components/
│   └── ui/              # shadcn-vue components + ConditionalContent
├── lib/                 # Supabase client & utilities
├── types/               # ALL project types (centralized)
│   ├── index.ts         # Main types file (import from here)
│   └── database.types.ts # Supabase generated types
├── stores/              # Pinia stores (Options API only)
├── composables/         # Reusable composition functions
├── pages/               # File-based routing
│   ├── (client)/        # Client-facing pages (EN/TR)
│   └── (admin)/         # Admin management (EN only)
├── i18n/                # Internationalization
└── assets/              # Static resources
```

---

## 🗄️ Database Schema & Critical Relationships

### Entity Relationship Overview
```
👥 PROFILES (all users)
    ↓ 1:N
📅 APPOINTMENTS (service bookings) → 💰 INVOICES → 🎁 LOYALTY_ACCOUNTS
    ↓ belongs_to                      ↓ updates      ↓ tracks
🔧 SERVICES + ADDONS                INVOICE_ITEMS   LOYALTY_TRANSACTIONS
    ↓ showcase_via                    ↓ tracks
📸 SERVICE_IMAGES                   📦 PRODUCT_USAGE
📸 PAST_WORK_GALLERY               
    ↑ filtered_by
🏷️ TAGS & CATEGORIES
```

### Critical Database Entities

**PROFILES** (Central Identity):
```sql
id UUID                    -- Links to Supabase auth.users.id
email TEXT                 -- Login credential
full_name TEXT             -- Display name
phone TEXT                 -- Contact for appointments
role TEXT                  -- 'admin' | 'technician' | 'client'
preferred_language TEXT    -- 'en' | 'tr'
is_active BOOLEAN          -- Account status
```

**APPOINTMENTS** (Core Business Transaction):
```sql
id UUID                           -- Appointment identifier
client_id UUID                    -- Service recipient
technician_id UUID                -- Service provider
appointment_date DATE             -- Service date
start_time TIME                   -- Service start
service_id UUID                   -- Base service
quoted_price DECIMAL              -- Initial estimate
final_price DECIMAL               -- Actual price
status TEXT                       -- 'pending' → 'confirmed' → 'completed'
inspiration_image_url TEXT        -- Client's design reference
final_design_image_url TEXT       -- Completed work photos
special_requests TEXT             -- Client preferences
```

**SERVICE_IMAGES** (Visual Portfolio):
```sql
id UUID                    -- Image identifier
service_id UUID            -- Which service this showcases
image_url TEXT             -- Public URL
title TEXT / title_tr TEXT -- Multilingual titles
image_type TEXT            -- 'hero' | 'gallery' | 'before_after' | 'technique'
is_featured BOOLEAN        -- Highlight in cards
display_order INTEGER     -- Gallery sort order
is_active BOOLEAN          -- Currently visible
```

**PAST_WORK_GALLERY** (Marketing Critical):
```sql
id UUID                    -- Gallery entry
service_id UUID            -- Service demonstrated
before_image_url TEXT      -- Optional before photo
after_image_url TEXT       -- Required result photo
title TEXT / title_tr TEXT -- Multilingual titles
tags TEXT[]                -- ['french_tips', 'chrome', 'nude']
client_consent BOOLEAN     -- Permission to display
is_public BOOLEAN          -- Show on client site
approval_status TEXT       -- 'pending' | 'approved'
```

**CLIENT_DUAL_FORMS** (Efficiency Critical):
```sql
client_id UUID             -- Client these measurements belong to
hand_type TEXT             -- 'left' | 'right'
thumb_size TEXT            -- Dual form size code
index_size TEXT            -- Per finger measurements
middle_size TEXT
ring_size TEXT
pinky_size TEXT
notes TEXT                 -- Special considerations
```

---

## 🎨 Development Patterns (Enforced)

### 1. Pinia Options API Pattern (Required)
```typescript
export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    products: [],
    categories: []
  }),
  getters: {
    categorizedProducts: (state) => {
      // Pure computed derivations
      return state.categories.map(cat => ({
        ...cat,
        products: state.products.filter(p => p.category_id === cat.id)
      }))
    }
  },
  actions: {
    // Actions MUST return Query controllers or Promises
    fetchProducts() {
      return useQuery({
        key: ['admin', 'products'],
        query: async () => {
          const { data, error } = await supabase
            .from('products')
            .select('*')
          if (error) throw error
          this.products = data
          return data
        }
      })
    },

    async createProduct(input: ProductInsert): Promise<Product> {
      const { data, error } = await supabase
        .from('products')
        .insert([input])
        .select()
        .single()
      
      if (error) throw error
      
      // Invalidate related queries
      const cache = useQueryCache()
      cache.invalidateQueries(['admin', 'products'])
      
      return data
    }
  }
})
```

### 2. Centralized Type Management (Required)
```typescript
// types/index.ts - ALL types go here
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

// Domain aliases (use everywhere)
export type Product = Tables<'products'>
export type ProductInsert = TablesInsert<'products'>
export type ProductUpdate = TablesUpdate<'products'>

// Join types
export type ProductWithVariants = Product & { 
  variants: Tables<'product_variants'>[] 
}

export type CategoryWithProducts = Tables<'product_categories'> & {
  products: Product[]
}

// RPC types (for stored procedures)
export type UpdateStockQuantityArgs = 
  Database['public']['Functions']['update_stock_quantity']['Args']
```

### 3. ConditionalContent Pattern (Mandatory for Data UIs)
```vue
<template>
  <ConditionalContent
    :is-loading="query.isLoading"
    :has-error="query.status === 'error'"
    :error="query.error"
    :retry="query.refresh"
    :is-empty="!query.data?.length"
    empty-title="No items found"
    empty-message="Create your first item."
    empty-icon="package"
  >
    <DataComponent :data="query.data!" />
  </ConditionalContent>
</template>
```

### 4. Pinia Colada Data Fetching Pattern
```typescript
// Queries return controllers - caller controls loading
export function useProducts() {
  return useQuery({
    key: () => ['products'], // Always use functions for reactive keys
    query: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
      if (error) throw error
      return data
    },
    staleTime: 300_000 // 5 minutes
  })
}

// Usage in component
const { data: products, isLoading, error, refresh } = useProducts()

// Multiple dependencies in key
const { data: serviceImages } = useQuery({
  key: () => ['service-images', serviceId.value, categoryId.value],
  query: () => fetchServiceImages(serviceId.value, categoryId.value),
  staleTime: 600_000 // Images change less frequently
})
```

### 5. Form Validation Pattern (Required)
```vue
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

const formSchema = toTypedSchema(z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().optional()
}))

const { handleSubmit, isFieldDirty } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit(async (values) => {
  // Handle submission
})
</script>

<template>
  <form @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </form>
</template>
```

### 6. File-Based Routing (Enforced)
```
pages/
├── (client)/                    # Client-facing (EN/TR)
│   ├── index.vue               # Home page
│   ├── services/
│   │   ├── index.vue           # Service catalog
│   │   └── [id].vue            # Service detail
│   ├── gallery/
│   │   ├── index.vue           # Portfolio browser
│   │   └── [category].vue      # Category gallery
│   └── booking/
│       ├── index.vue           # Booking flow
│       └── confirm.vue         # Confirmation
└── (admin)/                    # Management (EN only)
    ├── clients/
    ├── inventory/
    ├── services/
    └── appointments/
```

---

## 🔄 Critical Business Workflows

### 1. Service Gallery Management (Admin)
```typescript
// Upload service images with metadata
const ServiceImageWorkflow = {
  async uploadServiceImage(serviceId: string, file: File, metadata: ImageMetadata) {
    // 1. Upload to service-gallery bucket
    const path = `service-gallery/${serviceId}/${Date.now()}_${file.name}`
    const { data: upload } = await supabase.storage
      .from('service-gallery')
      .upload(path, file)
    
    // 2. Create database record with multilingual metadata
    const { data: record } = await supabase.from('service_images').insert({
      service_id: serviceId,
      image_url: `${supabaseUrl}/storage/v1/object/public/service-gallery/${path}`,
      image_path: path,
      title: metadata.title,
      title_tr: metadata.title_tr,
      image_type: metadata.type, // 'hero' | 'gallery' | 'technique'
      is_featured: metadata.featured,
      display_order: metadata.order,
      uploaded_by: currentUser.id
    })
    
    return record
  }
}
```

### 2. Client Gallery Browsing (Critical Business Flow)
```typescript
// Client service selection with visual portfolio
const ClientGalleryBrowsing = {
  async getServiceCatalogWithImages() {
    return await supabase
      .from('service_gallery_view') // Use database view for performance
      .select(`
        service_id, service_name, service_name_tr,
        hero_image_url, total_images, past_work_count,
        base_price, duration_minutes
      `)
      .eq('is_active', true)
      .order('category_name, service_name')
  },

  async getServiceGallery(serviceId: string) {
    // Get service portfolio images
    const { data: serviceImages } = await supabase
      .rpc('get_service_images', {
        p_service_id: serviceId,
        p_limit: 20
      })
    
    // Get past work examples
    const { data: pastWork } = await supabase
      .rpc('get_past_work_gallery', {
        p_service_id: serviceId,
        p_featured_only: false,
        p_limit: 12
      })
    
    return {
      serviceImages,
      pastWork,
      totalExamples: serviceImages.length + pastWork.length
    }
  }
}
```

### 3. Appointment Booking with Visuals
```typescript
// Complete booking flow with design references
const BookingWorkflow = {
  async createAppointmentWithInspiration(bookingData: AppointmentBooking) {
    // 1. Upload inspiration image if provided
    let inspirationUrl = null
    if (bookingData.inspirationImage) {
      const path = `inspiration-images/${Date.now()}_${bookingData.inspirationImage.name}`
      const { data: upload } = await supabase.storage
        .from('inspiration-images')
        .upload(path, bookingData.inspirationImage)
      
      inspirationUrl = `${supabaseUrl}/storage/v1/object/public/inspiration-images/${path}`
    }
    
    // 2. Create appointment record
    const { data: appointment } = await supabase.from('appointments').insert({
      client_id: bookingData.clientId,
      technician_id: bookingData.technicianId,
      service_id: bookingData.serviceId,
      appointment_date: bookingData.date,
      start_time: bookingData.startTime,
      quoted_price: bookingData.quotedPrice,
      inspiration_image_url: inspirationUrl,
      special_requests: bookingData.requests,
      status: 'pending'
    }).select().single()
    
    // 3. Add selected addons
    if (bookingData.addons?.length) {
      await supabase.from('appointment_addons').insert(
        bookingData.addons.map(addon => ({
          appointment_id: appointment.id,
          addon_id: addon.id,
          quantity: addon.quantity
        }))
      )
    }
    
    return appointment
  }
}
```

### 4. Past Work Portfolio Management
```typescript
// Convert completed appointment to portfolio piece
const PortfolioWorkflow = {
  async promoteToPortfolio(appointmentId: string, portfolioData: PortfolioData) {
    const appointment = await supabase
      .from('appointments')
      .select('*, services(*), service_categories(*)')
      .eq('id', appointmentId)
      .single()
    
    // Create portfolio entry
    const { data: portfolioEntry } = await supabase.from('past_work_gallery').insert({
      appointment_id: appointmentId,
      service_id: appointment.service_id,
      category_id: appointment.services.category_id,
      after_image_url: appointment.final_design_image_url,
      before_image_url: portfolioData.beforeImage || null,
      title: portfolioData.title,
      title_tr: portfolioData.title_tr,
      description: portfolioData.description,
      tags: portfolioData.tags, // ['french_tips', 'chrome', 'nude']
      tags_tr: portfolioData.tags_tr,
      client_consent: portfolioData.clientConsent,
      is_public: portfolioData.makePublic,
      approval_status: 'pending' // Requires admin approval
    })
    
    return portfolioEntry
  },

  // Bulk upload for existing business setup
  async bulkUploadExistingPortfolio(portfolioItems: ExistingPortfolioItem[]) {
    const uploads = portfolioItems.map(async (item) => {
      // Upload images
      const afterImagePath = await this.uploadPortfolioImage(item.afterImage)
      const beforeImagePath = item.beforeImage ? 
        await this.uploadPortfolioImage(item.beforeImage) : null
      
      // Create gallery entry
      return await supabase.from('past_work_gallery').insert({
        service_id: item.serviceId,
        category_id: item.categoryId,
        after_image_url: afterImagePath,
        before_image_url: beforeImagePath,
        title: item.title,
        title_tr: item.titleTr,
        tags: item.tags,
        is_featured: item.featured,
        is_public: true,
        client_consent: true, // Pre-approved for existing work
        approval_status: 'approved'
      })
    })
    
    return await Promise.all(uploads)
  }
}
```

---

## 🎨 UI/UX Implementation Guidelines

### Theme System (Enforced)
```css
/* Use ONLY CSS variables - never hardcoded colors */
.service-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
}

.service-card:hover {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

/* Available theme tokens */
--background, --foreground
--card, --card-foreground  
--popover, --popover-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
```

### Component Architecture
```vue
<!-- Service Gallery Component Example -->
<template>
  <div class="gallery-container">
    <!-- Category Filter -->
    <div class="category-tabs">
      <Button
        v-for="category in categories"
        :key="category.id"
        :variant="selectedCategory === category.id ? 'default' : 'outline'"
        @click="selectedCategory = category.id"
      >
        {{ getLocalizedText(category.name, category.name_tr) }}
      </Button>
    </div>

    <!-- Gallery Grid -->
    <ConditionalContent
      :is-loading="isLoading"
      :has-error="status === 'error'"
      :error="error"
      :retry="refresh"
      :is-empty="!data?.length"
      empty-title="No images found"
      empty-icon="package"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ServiceImageCard
          v-for="image in data"
          :key="image.id"
          :image="image"
          @click="openLightbox(image)"
        />
      </div>
    </ConditionalContent>

    <!-- Lightbox Modal -->
    <ImageLightbox
      v-model:open="showLightbox"
      :image="selectedImage"
      :related-images="relatedImages"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@pinia/colada'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const selectedCategory = ref('all')
const showLightbox = ref(false)
const selectedImage = ref(null)

// Localization helper
const getLocalizedText = (en: string, tr: string | null) => {
  return locale.value === 'tr' && tr ? tr : en
}

// Query with reactive dependencies
const { data, isLoading, error, status, refresh } = useQuery({
  key: () => ['service-images-gallery', selectedCategory.value],
  query: () => fetchServiceImages(selectedCategory.value),
  staleTime: 600_000 // 10 minutes for images
})
</script>
```

---

## 🚫 Banned Practices & Common Mistakes

### Never Do These:
```typescript
// ❌ NEVER - React/Next patterns
const Component = () => <div>JSX</div>

// ❌ NEVER - Manual route arrays
const routes = [{ path: '/admin', component: Admin }]

// ❌ NEVER - Global loading flags in stores
state: () => ({ isLoading: false })

// ❌ NEVER - Hardcoded colors
style="color: #ff0000; background: #ffffff;"

// ❌ NEVER - Any type usage
const data: any = await fetchData()

// ❌ NEVER - Composition API stores
export const useStore = defineStore('store', () => {})

// ❌ NEVER - Direct Supabase imports in components
import { supabase } from '@supabase/supabase-js'

// ❌ NEVER - Unchecked destructuring
const { user } = useAuth() // Could be undefined

// ❌ NEVER - Missing ConditionalContent for data UIs
<div v-if="!isLoading">{{ data }}</div>
```

### Always Do These:
```typescript
// ✅ ALWAYS - Centralized types
import type { Product, Category } from '@/types'

// ✅ ALWAYS - Options API stores
export const useStore = defineStore('store', {
  state: () => ({}),
  actions: {}
})

// ✅ ALWAYS - Return query controllers
actions: {
  fetchData() {
    return useQuery({ key: ['data'], query: fetchFn })
  }
}

// ✅ ALWAYS - ConditionalContent wrapper
<ConditionalContent :is-loading="query.isLoading">
  <DataComponent :data="query.data!" />
</ConditionalContent>

// ✅ ALWAYS - Theme-aware styling
className="bg-background text-foreground border-border"

// ✅ ALWAYS - Reactive query keys
key: () => ['data', selectedId.value, filters.value]

// ✅ ALWAYS - Error handling
if (error) throw new Error(`Failed to fetch: ${error.message}`)
```

---

## 🔧 Development Workflow

### 1. Setting Up New Features
1. **Define types first** in `types/index.ts`
2. **Create database queries** using stored procedures if complex
3. **Build store actions** that return query controllers
4. **Implement UI components** with ConditionalContent
5. **Add i18n keys** for both English and Turkish
6. **Test with real data** using existing Supabase instance

### 2. Image/Gallery Feature Development
1. **Plan file storage structure** in Supabase buckets
2. **Create image metadata tables** for management
3. **Implement upload workflows** with proper error handling
4. **Add image optimization** (compression, thumbnails)
5. **Create gallery browsing** with filtering and search
6. **Test responsive display** across device sizes

### 3. Database Changes
1. **Update schema.sql** in project root
2. **Run migrations** on local Supabase instance
3. **Regenerate types** using `npm run supabase:types`
4. **Update centralized types** in `types/index.ts`
5. **Update affected stores** and components

---

## 📊 Performance & Optimization

### Query Optimization
```typescript
// Optimize staleTime based on data change frequency
const queries = {
  // Static content - 30 minutes
  services: { staleTime: 1800_000 },
  
  // Gallery images - 10 minutes  
  images: { staleTime: 600_000 },
  
  // User data - 5 minutes
  profile: { staleTime: 300_000 },
  
  // Live data - 1 minute
  appointments: { staleTime: 60_000 }
}
```

### Image Optimization
```typescript
// Image processing pipeline
const ImageOptimization = {
  async processUpload(file: File) {
    // 1. Client-side compression
    const compressed = await this.compressImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8
    })
    
    // 2. Generate thumbnail
    const thumbnail = await this.createThumbnail(compressed, {
      width: 300,
      height: 300
    })
    
    // 3. Upload both versions
    const [original, thumb] = await Promise.all([
      this.uploadImage(compressed, 'originals/'),
      this.uploadImage(thumbnail, 'thumbnails/')
    ])
    
    return { originalUrl: original.url, thumbnailUrl: thumb.url }
  }
}
```

---

## 🎯 Key Success Factors for Coding Agents

### 1. Business Context Understanding
- **This is a real business** - changes affect actual operations
- **Visual presentation is critical** - gallery system drives client acquisition
- **Existing portfolio matters** - system must support bulk upload of past work
- **Multilingual support is mandatory** - Turkish market requires TR translations

### 2. Technical Architecture Adherence
- **Type safety is non-negotiable** - no `any`, strict TypeScript
- **Options API pattern is enforced** - no Composition API stores
- **ConditionalContent is mandatory** - all data UIs must use it
- **File-based routing only** - never create manual route arrays

### 3. Data Flow Understanding
- **Stores return query controllers** - never manage loading states in stores  
- **Reactive query keys are required** - include all dependencies
- **Cache invalidation is precise** - invalidate specific query keys only
- **Image metadata is tracked** - all uploads need metadata records

### 4. User Experience Priorities
- **Gallery browsing is seamless** - images load progressively with thumbnails
- **Booking flow is visual** - clients select services based on portfolio
- **Admin workflows are efficient** - bulk operations for gallery management
- **Mobile experience is complete** - responsive design across all screen sizes

### 5. Development Quality Standards
- **Error handling is comprehensive** - every async operation has error boundaries
- **Performance is optimized** - appropriate staleTime, image compression, lazy loading
- **Accessibility is built-in** - semantic HTML, ARIA labels, keyboard navigation
- **Code is maintainable** - centralized types, consistent patterns, clear documentation

---

This reference document should be your primary source of truth when implementing any features or fixes in the Perfect Finish project. Always refer back to these patterns and guidelines to ensure consistency with the established architecture and business requirements.