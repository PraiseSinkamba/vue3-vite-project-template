# Developer Documentation
## 🏗️ Entity Relationships & System Architecture

### Core Entity Relationships & Column Definitions

## 👤 PROFILES Entity

**Logical Purpose**: Represents all users in the system - clients, technicians, and administrators. This is the central identity table that extends Supabase's built-in authentication.

**Key Columns Explained:**

```sql
id UUID                    -- Links to Supabase auth.users.id (Single Sign-On identity)
email TEXT                 -- Primary contact & login credential
full_name TEXT             -- Display name for UI and communications
phone TEXT                 -- Primary contact number for appointments
whatsapp_number TEXT       -- WhatsApp contact (often different from phone)
role TEXT                  -- Business role: 'admin' | 'technician' | 'client'
avatar_url TEXT            -- Profile picture path in 'avatars' bucket
preferred_language TEXT    -- UI language: 'en' | 'tr' (Turkish/English)
is_active BOOLEAN          -- Account status (for deactivating users)
```

**Relationships:**

- **1:N → appointments (as client)**: One person can book many appointments
- **1:N → appointments (as technician)**: One technician handles many appointments
- **1:1 → loyalty_accounts**: Each client has one loyalty account
- **1:N → client_dual_forms**: Client's nail measurements for different hands
- **1:N → notifications**: Personal messages and alerts
- **1:N → service_images, past_work_gallery**: Links to uploaded content (staff only)

---

## 📅 APPOINTMENTS Entity

**Logical Purpose**: The central business transaction. Represents a scheduled nail service session between a client and technician. This is where all business activity converges.

**Key Columns Explained:**

```sql
-- Identity & References
id UUID                           -- Unique appointment identifier
appointment_number TEXT           -- Human-readable reference (APT-20241215-001)
client_id UUID                    -- Who is receiving the service
technician_id UUID                -- Who is providing the service

-- Scheduling
appointment_date DATE             -- When the service happens
start_time TIME                   -- Service start time (30-min slots)
end_time TIME                     -- Calculated based on service duration
duration_minutes INTEGER          -- Total time blocked (service + addons)

-- Service Definition
service_id UUID                   -- Base service (e.g., "Polygel Manicure")
bundle_id UUID                    -- OR service bundle (multiple services)

-- Pricing Evolution
quoted_price DECIMAL              -- Initial price estimate for booking
final_price DECIMAL               -- Actual price after negotiation/changes

-- Client Information (for anonymous bookings)
client_name TEXT                  -- Name provided during booking
client_phone TEXT                 -- Contact number for communication
client_whatsapp TEXT              -- WhatsApp for design negotiation
client_email TEXT                 -- Optional email for receipts

-- Design & Requirements
inspiration_image_url TEXT        -- Client's desired design reference
special_requests TEXT             -- Written requests/preferences
final_design_image_url TEXT       -- Photos of completed work

-- Business Process
status TEXT                       -- 'pending' → 'confirmed' → 'in_progress' → 'completed'
whatsapp_negotiation_notes TEXT   -- Design discussion summary
internal_notes TEXT               -- Staff notes not visible to client
completion_notes TEXT             -- Service completion details

-- Marketing & Loyalty
referred_by_client_id UUID        -- If this is a referral booking
friend_booking BOOLEAN            -- Group booking with friends
friend_count INTEGER              -- Number of friends in group booking
```

**Relationships:**

- **belongs_to → profiles (client & technician)**: Links service provider and recipient
- **belongs_to → services XOR service_bundles**: What service is being performed
- **1:N → appointment_addons**: Additional services added to base service
- **1:1 → invoices**: Financial record of this appointment
- **stores → file paths**: Links to inspiration and result photos
- **optional_link → past_work_gallery**: Completed work may be added to portfolio

---

## 💰 INVOICES Entity

**Logical Purpose**: Financial record of completed services. Converts an appointment into a billable transaction with line items and payment tracking.

**Key Columns Explained:**

```sql
-- Identity & Links
id UUID                    -- Unique invoice identifier  
invoice_number TEXT        -- Human-readable reference (INV-20241215-001)
appointment_id UUID        -- Links back to the service appointment
client_id UUID             -- Who owes/paid this invoice

-- Financial Calculations
subtotal DECIMAL           -- Sum of all services and addons
discount_amount DECIMAL    -- Total discounts applied
total_amount DECIMAL       -- Final amount due (subtotal - discount)

-- Payment Tracking
payment_method TEXT        -- 'cash' | 'card' | 'bank_transfer' | 'other'
payment_status TEXT        -- 'pending' | 'paid' | 'partial' | 'refunded'

-- Loyalty Integration
loyalty_points_earned INT  -- Points awarded for this purchase
loyalty_points_used INT    -- Points redeemed as discount
discount_type TEXT         -- 'loyalty' | 'referral' | 'frequency' | 'friends'

-- Administrative
notes TEXT                 -- Payment notes, special circumstances
issued_at TIMESTAMPTZ      -- When invoice was generated
```

**Relationships:**

- **belongs_to → appointments**: One invoice per completed appointment
- **belongs_to → profiles (client)**: Who is responsible for payment
- **1:N → invoice_items**: Detailed line items (services, addons)
- **1:N → invoice_product_usage**: Tracks which products were used
- **triggers → loyalty_transactions**: Auto-updates loyalty points

---

## 🛍️ PRODUCTS Entity (Inventory Base)

**Logical Purpose**: Represents physical items used in nail services. Base products without specific variants (colors, sizes).

**Key Columns Explained:**

```sql
-- Identity & Classification  
id UUID                    -- Unique product identifier
category_id UUID           -- Groups products (Polygels, Chrome, Decorations)
name TEXT                  -- Product name in English
name_tr TEXT               -- Turkish translation for client interface

-- Product Information
description TEXT           -- Detailed product information
brand TEXT                 -- Manufacturer/brand name
product_type TEXT          -- 'polygel' | 'gel_polish' | 'chrome' | 'decoration'

-- Business Logic
track_usage BOOLEAN        -- Whether to track this product in services
track_quantity BOOLEAN     -- Whether to track numeric quantities
unit_type TEXT             -- 'piece' | 'bottle' | 'gram' | 'ml' | 'set'
```

**Child Entity: PRODUCT_VARIANTS**

**Logical Purpose**: Specific versions of products - different colors, sizes, or specifications.

```sql
-- Variant Identification
id UUID                    -- Unique variant identifier
product_id UUID            -- Links to base product
variant_name TEXT          -- "White", "Pink", "Rose Gold", "Size M"
variant_name_tr TEXT       -- Turkish translation
sku TEXT                   -- Stock Keeping Unit (unique identifier)

-- Inventory Management
current_quantity INTEGER   -- Current stock count
stock_level TEXT           -- 'in_stock' | 'low' | 'out_of_stock'  
reorder_point INTEGER      -- Trigger level for restocking
cost_price DECIMAL         -- Purchase price for profit calculations
```

**Relationships:**

- **belongs_to → product_categories**: Organizational grouping
- **1:N → product_variants**: Colors, sizes, specifications
- **N:M → services**: Which products are used in which services
- **tracked_in → invoice_product_usage**: Usage history per service

---

## 🔧 SERVICES Entity (Business Offerings)

**Logical Purpose**: Represents the nail services offered to clients - the core business products.

**Key Columns Explained:**

```sql
-- Service Identity
id UUID                    -- Unique service identifier
category_id UUID           -- Service grouping (Manicures, Nail Art, Repairs)
name TEXT                  -- Service name in English
name_tr TEXT               -- Turkish translation for client booking

-- Service Specifications  
description TEXT           -- Detailed service description
duration_minutes INTEGER   -- Time required (determines appointment slots)
base_price DECIMAL         -- Starting price (before negotiations)
is_active BOOLEAN          -- Whether service is currently offered
```

**Child Entity: ADDONS**

**Logical Purpose**: Optional extras that can be added to base services.

```sql
-- Addon Identity
id UUID                    -- Unique addon identifier  
name TEXT                  -- Addon name (e.g., "French Tips", "Chrome Art")
name_tr TEXT               -- Turkish translation

-- Pricing Strategy
additional_time_minutes INT -- Extra time added to appointment
price_type TEXT            -- 'fixed' | 'starting_price' | 'variable'
price DECIMAL              -- Base price (can be adjusted during service)
is_active BOOLEAN          -- Currently available
```

**Service Bundle Logic:**

```sql
-- SERVICE_BUNDLES: Pre-packaged combinations
id UUID                    -- Bundle identifier
name TEXT                  -- Bundle name (e.g., "Complete Manicure Package")  
bundle_type TEXT           -- 'sum_of_parts' | 'fixed_price' | 'starting_price'
base_price DECIMAL         -- Bundle pricing
total_duration_minutes INT -- Combined time of all services

-- BUNDLE_SERVICES: Which services are in which bundles
bundle_id UUID             -- Links to service bundle
service_id UUID            -- Links to individual service
quantity INTEGER           -- How many of this service in bundle
```

**Relationships:**

- **1:N → appointments**: Services can be booked multiple times
- **N:M → addons**: Services can have multiple addon options
- **N:M → products**: Services use various products during delivery
- **grouped_in → service_bundles**: Services can be packaged together
- **1:N → service_images**: Visual gallery for each service
- **1:N → past_work_gallery**: Portfolio examples of completed work

---

## 📸 SERVICE IMAGES SYSTEM (New)

### SERVICE_IMAGES Entity

**Logical Purpose**: Links visual content to specific services for client browsing and marketing display.

**Key Columns Explained:**

```sql
-- Image Identity & Links
id UUID                    -- Unique image record
service_id UUID            -- Which service this image showcases
image_url TEXT             -- Public URL for image access
image_path TEXT            -- Storage bucket path for management

-- Multilingual Content
title TEXT                 -- Image title in English
title_tr TEXT              -- Turkish translation
description TEXT           -- Detailed description
description_tr TEXT        -- Turkish description
alt_text TEXT              -- Accessibility text (English)
alt_text_tr TEXT           -- Accessibility text (Turkish)

-- Display Management
display_order INTEGER      -- Sort order for galleries
image_type TEXT            -- 'hero' | 'gallery' | 'before_after' | 'technique' | 'detail'
is_featured BOOLEAN        -- Highlight in service cards
is_active BOOLEAN          -- Currently visible to clients
uploaded_by UUID           -- Staff member who uploaded
```

**Image Type Classification:**
- **hero**: Main service banner/card image
- **gallery**: Portfolio photos for service browsing
- **before_after**: Transformation demonstrations
- **technique**: Step-by-step process photos
- **detail**: Close-up shots of specific elements

### SERVICE_CATEGORY_IMAGES Entity

**Logical Purpose**: Category-level imagery for navigation and marketing.

```sql
-- Category Image Management
id UUID                    -- Unique image record
category_id UUID           -- Which category this represents
image_url TEXT             -- Public image URL
image_path TEXT            -- Storage path

-- Display Settings
title TEXT                 -- Category image title
is_hero_image BOOLEAN      -- Main category banner
display_order INTEGER      -- Gallery sort order
is_active BOOLEAN          -- Currently displayed
```

### PAST_WORK_GALLERY Entity

**Logical Purpose**: Showcase completed client work for marketing and portfolio building. Critical for existing business setup.

**Key Columns Explained:**

```sql
-- Work Classification
id UUID                    -- Unique gallery entry
appointment_id UUID        -- Optional link to actual appointment
service_id UUID            -- What service this demonstrates
category_id UUID           -- Service category for filtering

-- Image Content
before_image_url TEXT      -- Optional before photo
before_image_path TEXT     -- Storage path
after_image_url TEXT       -- Required final result
after_image_path TEXT      -- Storage path
detail_images JSONB        -- Array of additional detail shots

-- Content Management
title TEXT                 -- Work title (e.g., "Nude French with Chrome")
title_tr TEXT              -- Turkish translation
description TEXT           -- Technique description
technique_notes TEXT       -- What products/methods were used
client_consent BOOLEAN     -- Permission to display publicly

-- Display Controls
is_featured BOOLEAN        -- Highlight in main gallery
is_public BOOLEAN          -- Show on client-facing site
display_order INTEGER     -- Gallery sort order
approval_status TEXT       -- 'pending' | 'approved' | 'rejected'

-- Search & Filter
tags TEXT[]                -- ['french_tips', 'chrome', 'rhinestones']
tags_tr TEXT[]             -- Turkish tag equivalents

-- Administration
uploaded_by UUID           -- Staff who uploaded
approved_by UUID           -- Admin who approved for public display
```

### ADDON_IMAGES Entity

**Logical Purpose**: Visual examples of add-on services for client selection.

```sql
-- Addon Image Management
id UUID                    -- Unique addon image
addon_id UUID              -- Which addon this demonstrates
image_url TEXT             -- Public image URL
title TEXT                 -- Image description
is_featured BOOLEAN        -- Highlight in addon selection
display_order INTEGER     -- Sort order
```

### IMAGE_METADATA Entity

**Logical Purpose**: Technical metadata for image management and optimization.

```sql
-- File Management
id UUID                    -- Unique metadata record
image_url TEXT             -- Links to any image in system
original_filename TEXT     -- User's original file name
file_size INTEGER          -- Bytes for storage tracking
width INTEGER              -- Image dimensions
height INTEGER             -- For responsive display
mime_type TEXT             -- File type validation
storage_bucket TEXT        -- Which Supabase bucket
storage_path TEXT          -- Full path within bucket
is_optimized BOOLEAN       -- Has been processed for web
thumbnail_url TEXT         -- Generated thumbnail path
```

---

## 🎯 CLIENT_DUAL_FORMS Entity

**Logical Purpose**: Stores nail size measurements for each client. Critical for preparation and efficiency - technician knows exact dual form sizes before appointment.

**Key Columns Explained:**

```sql
-- Client & Hand Identification
id UUID                    -- Unique measurement record
client_id UUID             -- Which client these measurements belong to  
hand_type TEXT             -- 'left' | 'right' (separate records per hand)

-- Finger Measurements (dual form sizes)
thumb_size TEXT            -- Size code for thumb dual form
index_size TEXT            -- Size code for index finger dual form  
middle_size TEXT           -- Size code for middle finger dual form
ring_size TEXT             -- Size code for ring finger dual form
pinky_size TEXT            -- Size code for pinky finger dual form

-- Additional Information
notes TEXT                 -- Special considerations (e.g., "wide nail beds")
updated_at TIMESTAMPTZ     -- When measurements were last updated
```

**Business Logic**: Each client has maximum 2 records (left hand, right hand). Measurements are captured via SVG hand interface where technician clicks on fingers to record sizes. This eliminates the need to measure during every appointment.

---

## 🎁 LOYALTY_ACCOUNTS Entity

**Logical Purpose**: Tracks each client's loyalty program participation - points earned, used, and current balance.

**Key Columns Explained:**

```sql
-- Client Link
id UUID                    -- Unique loyalty account
client_id UUID             -- Links to client profile (1:1 relationship)

-- Points Tracking
total_points_earned INT    -- Lifetime points accumulated
total_points_used INT      -- Lifetime points redeemed  
current_balance INT        -- Available points for use

-- Business Metrics
visit_count INTEGER        -- Number of completed appointments
total_spent DECIMAL        -- Lifetime spending (for VIP tiers)
```

**Child Entity: LOYALTY_TRANSACTIONS**

**Logical Purpose**: Audit log of all loyalty point movements - earned, redeemed, expired.

```sql
-- Transaction Details
id UUID                    -- Unique transaction
client_id UUID             -- Which client's account
invoice_id UUID            -- Which purchase (if applicable)
transaction_type TEXT      -- 'earned' | 'redeemed' | 'expired' | 'bonus'
points INTEGER             -- Points amount (positive or negative)
description TEXT           -- Human-readable transaction description
```

**Business Rules:**

- Points earned automatically via database trigger on invoice creation
- Multiple loyalty types: frequency discounts, referral bonuses, group bookings
- Points have no expiration (business decision)
- Negative point values represent redemptions

---

## 🔔 NOTIFICATIONS Entity

**Logical Purpose**: System messaging for appointment reminders, stock alerts, and business communications.

**Key Columns Explained:**

```sql
-- Message Identity
id UUID                    -- Unique notification
user_id UUID               -- Who should receive this notification
title TEXT                 -- Notification headline
message TEXT               -- Full notification content

-- Classification & Status
notification_type TEXT     -- 'appointment' | 'reminder' | 'inventory' | 'payment'
is_read BOOLEAN            -- Whether user has seen notification
scheduled_for TIMESTAMPTZ  -- When to send (for future notifications)
sent_at TIMESTAMPTZ        -- When notification was delivered
```

**Business Logic**:

- Appointment reminders generated 24 hours before service
- Inventory alerts when stock levels reach reorder points
- Payment reminders for overdue invoices
- System announcements for policy changes

---

## 🏗️ System Architecture & Data Flow

### Business Entity Hierarchy

```
🏢 BUSINESS LAYER
├── business_settings (operational parameters)
├── availability_schedules (when technician works)  
└── unavailable_periods (blocked time: exams, vacation)

👥 IDENTITY LAYER  
└── profiles (all users: admin, technician, clients)

📋 SERVICE CATALOG
├── service_categories → services → service_bundles
├── addons (optional extras)
├── service_products + addon_products (what materials are used)
└── 📸 VISUAL CONTENT LAYER (NEW)
    ├── service_images (service portfolio)
    ├── service_category_images (category banners)
    ├── past_work_gallery (completed work showcase)
    └── addon_images (add-on examples)

📦 INVENTORY LAYER
├── product_categories → products → product_variants
└── (Example: "Polygel" → ["Nude", "Pink", "White"] variants)

🎯 CLIENT DATA
├── client_dual_forms (nail measurements per hand)
├── loyalty_accounts → loyalty_transactions
└── referrals (client-to-client recommendations)

📅 BUSINESS OPERATIONS  
├── appointments (service bookings) → appointment_addons
├── invoices → invoice_items + invoice_product_usage
└── notifications (alerts and reminders)

🗂️ SYSTEM ADMINISTRATION
├── audit_logs (change tracking for business intelligence)
└── image_metadata (file management and optimization)
```

### Entity Relationship Summary

**Central Business Flow:**

```
PROFILES → book → APPOINTMENTS → generate → INVOICES → update → LOYALTY_ACCOUNTS
    ↓           ↓                    ↓            ↓
DUAL_FORMS   SERVICES +         INVOICE_ITEMS   LOYALTY_TRANSACTIONS
             ADDONS             PRODUCT_USAGE
             ↓
        SERVICE_IMAGES +
        PAST_WORK_GALLERY
```

**Visual Content Flow:**

```
SERVICES → showcase_via → SERVICE_IMAGES → displayed_in → CLIENT_BOOKING_INTERFACE
    ↓                          ↓
APPOINTMENTS → completed → PAST_WORK_GALLERY → filtered_by → TAGS & CATEGORIES
    ↓                          ↓
RESULT_PHOTOS → approved → PUBLIC_PORTFOLIO → browsed_by → POTENTIAL_CLIENTS
```

**File Storage Integration:**

```
📁 avatars/ ← profiles.avatar_url
📁 inspiration-images/ ← appointments.inspiration_image_url  
📁 result-photos/ ← appointments.final_design_image_url
📁 service-gallery/ ← service_images.image_path, past_work_gallery.after_image_path
📁 product-images/ ← product_variants.image_url (future)
📁 documents/ ← invoices.pdf_url (future)
```

---

## 🔄 Service Gallery Workflows

### 1. Service Image Management (Admin)

**Upload Service Images Flow:**

```javascript
// Admin selects service → uploads images → categorizes by type
const ServiceImageWorkflow = {
  async uploadServiceImage(serviceId, imageFile, metadata) {
    // 1. Upload to service-gallery bucket
    const imagePath = `service-gallery/${serviceId}/${Date.now()}_${imageFile.name}`
    const { data: upload } = await supabase.storage
      .from('service-gallery')
      .upload(imagePath, imageFile)
    
    // 2. Create database record
    const { data: imageRecord } = await supabase.from('service_images').insert({
      service_id: serviceId,
      image_url: `${supabaseUrl}/storage/v1/object/public/service-gallery/${imagePath}`,
      image_path: imagePath,
      title: metadata.title,
      title_tr: metadata.title_tr,
      description: metadata.description,
      image_type: metadata.type, // 'hero' | 'gallery' | 'technique'
      is_featured: metadata.featured,
      display_order: metadata.order,
      uploaded_by: currentUser.id
    })
    
    // 3. Create image metadata record
    await this.createImageMetadata(imageRecord.image_url, imagePath)
  }
}
```

### 2. Past Work Gallery Management

**Bulk Upload Existing Portfolio:**

```javascript
// For setting up existing business with past work
const PastWorkSetup = {
  async bulkUploadPortfolio(portfolioItems) {
    const uploadPromises = portfolioItems.map(async (item) => {
      // Upload images to service-gallery bucket
      const afterImagePath = await this.uploadPortfolioImage(item.afterImage)
      const beforeImagePath = item.beforeImage ? 
        await this.uploadPortfolioImage(item.beforeImage) : null
      
      // Create gallery record
      return await supabase.from('past_work_gallery').insert({
        service_id: item.serviceId,
        category_id: item.categoryId,
        after_image_url: afterImagePath,
        before_image_url: beforeImagePath,
        title: item.title,
        title_tr: item.titleTr,
        description: item.description,
        technique_notes: item.techniqueNotes,
        tags: item.tags, // ['french_tips', 'chrome', 'nude']
        tags_tr: item.tagsTr,
        is_featured: item.featured,
        is_public: true,
        client_consent: true, // Pre-approved for existing work
        approval_status: 'approved',
        uploaded_by: adminUserId
      })
    })
    
    await Promise.all(uploadPromises)
  },

  // Convert appointment result to portfolio piece
  async promoteToPortfolio(appointmentId, additionalData) {
    const appointment = await supabase
      .from('appointments')
      .select('*, services(*), service_categories(*)')
      .eq('id', appointmentId)
      .single()
    
    // Move result photo to service-gallery and create portfolio entry
    await supabase.from('past_work_gallery').insert({
      appointment_id: appointmentId,
      service_id: appointment.service_id,
      category_id: appointment.services.category_id,
      after_image_url: appointment.final_design_image_url,
      title: additionalData.title,
      description: additionalData.description,
      tags: additionalData.tags,
      is_public: additionalData.getClientConsent,
      approval_status: 'pending' // Requires admin approval
    })
  }
}
```

### 3. Client Gallery Browsing

**Service Selection with Visual Content:**

```javascript
// Client portal service browsing with images
const ClientGalleryBrowsing = {
  async getServiceCatalogWithImages() {
    return await supabase
      .from('service_gallery_view') // Database view with aggregated data
      .select(`
        service_id,
        service_name,
        service_name_tr,
        service_description,
        duration_minutes,
        base_price,
        category_name,
        hero_image_url,
        hero_image_title,
        total_images,
        past_work_count
      `)
      .eq('is_active', true)
      .order('category_name, service_name')
  },

  async getServiceGallery(serviceId) {
    // Get service images
    const { data: serviceImages } = await supabase
      .rpc('get_service_images', {
        p_service_id: serviceId,
        p_image_type: null, // All types
        p_limit: 20
      })
    
    // Get past work examples
    const { data: pastWork } = await supabase
      .rpc('get_past_work_gallery', {
        p_service_id: serviceId,
        p_category_id: null,
        p_tags: null,
        p_featured_only: false,
        p_limit: 12
      })
    
    return {
      serviceImages: serviceImages,
      pastWork: pastWork,
      totalExamples: serviceImages.length + pastWork.length
    }
  },

  // Filter portfolio by tags, category, featured status
  async filterPastWork(filters) {
    return await supabase
      .rpc('get_past_work_gallery', {
        p_service_id: filters.serviceId || null,
        p_category_id: filters.categoryId || null,
        p_tags: filters.tags || null,
        p_featured_only: filters.featuredOnly || false,
        p_limit: filters.limit || 20,
        p_offset: filters.offset || 0
      })
  }
}
```

---

## 🎨 Visual Interface Workflows

### Service Gallery Manager (Admin Interface)

**Gallery Management Dashboard:**

```vue
<template>
  <div class="gallery-manager">
    <!-- Service Image Management -->
    <Tabs defaultValue="services">
      <TabsContent value="services">
        <ServiceImageManager 
          :services="services"
          @upload="handleServiceImageUpload"
          @reorder="updateImageOrder"
          @toggle-featured="toggleFeatured"
        />
      </TabsContent>
      
      <TabsContent value="past-work">
        <PastWorkManager 
          :pastWork="pastWork"
          @bulk-upload="handleBulkUpload"
          @approve="approvePastWork"
          @feature="toggleFeaturedWork"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
const ServiceImageManager = {
  // Visual interface for managing service images
  // Drag-and-drop reordering
  // Image type classification (hero, gallery, technique)
  // Featured image selection
  // Bulk upload with metadata
}

const PastWorkManager = {
  // Bulk upload interface for existing portfolio
  // Approval workflow for client consent
  // Tag management for filtering
  // Featured work selection
  // Before/after comparison view
}
</script>
```

### Client Service Browser

**Visual Service Selection:**

```vue
<template>
  <div class="service-browser">
    <!-- Category Navigation with Images -->
    <div class="category-grid">
      <CategoryCard 
        v-for="category in categories"
        :key="category.id"
        :category="category"
        :heroImage="category.hero_image_url"
        @select="filterByCategory"
      />
    </div>
    
    <!-- Service Cards with Portfolio -->
    <div class="service-grid">
      <ServiceCard
        v-for="service in services"
        :key="service.id"
        :service="service"
        :heroImage="service.hero_image_url"
        :pastWorkCount="service.past_work_count"
        @view-gallery="openServiceGallery"
        @book="initiateBooking"
      />
    </div>
    
    <!-- Service Gallery Modal -->
    <ServiceGalleryModal
      v-model:open="showGallery"
      :service="selectedService"
      :images="galleryImages"
      :pastWork="pastWorkExamples"
    />
  </div>
</template>
```

This updated documentation now includes the comprehensive service image and past work gallery system that allows:

1. **Service Visual Management**: Upload and organize images for each service
2. **Past Work Portfolio**: Showcase completed client work (critical for existing businesses)
3. **Client Gallery Browsing**: Visual service selection with real examples
4. **Bulk Upload System**: Efficiently set up existing portfolio
5. **Approval Workflow**: Control what images are publicly displayed
6. **Multilingual Support**: Turkish/English image metadata
7. **Advanced Filtering**: Search portfolio by tags, categories, features

The system supports the existing business setup requirement by providing tools to upload and organize past work, making the client booking experience more visual and inspiring.