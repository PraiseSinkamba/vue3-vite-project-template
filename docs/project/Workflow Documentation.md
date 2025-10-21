# Workflow Documentation

## System Overview

This system provides comprehensive business management for Melody's nail tech services with:

- **Client Portal** (Turkish/English) for easy booking and history
- **Admin Dashboard** (English) for business management
- **Visual dual form sizing** with SVG hand interface
- **Inventory management** with color variants and usage tracking
- **Appointment scheduling** with 30-minute time slots
- **Loyalty & referral system** with multiple reward types
- **Service gallery & past work showcase** for visual service selection
- **Sales analytics** and reporting

---

## Core Workflows

### 1. Client Booking Flow (Client Portal - TR/EN)

**Step 1: Service Selection with Visual Gallery**

```
Client visits booking page → Browses service categories with hero images → Selects service → Views service gallery & past work examples → Sees estimated price & duration
```

**Enhanced Visual Selection Process:**
- Category cards display hero images and service count
- Service cards show featured images and past work count
- Click "View Gallery" to see full portfolio before booking
- Inspiration from past work helps clients decide on design preferences

**Step 2: Appointment Scheduling**

```
Selects date → System shows available 30-min slots → Selects time slot
```

**Step 3: Client Information with Visual Inspiration**

```
Enters: Name, WhatsApp, Email (optional) → Uploads inspiration image OR selects from past work gallery → Adds special requests
```

**Enhanced Inspiration Process:**
- Upload own inspiration image to `inspiration-images/{appointment_id}/`
- OR reference existing past work: "I want something like Work #123"
- System links referenced past work to appointment for technician preparation

**Step 4: Booking Creation**

```
System creates appointment with "pending" status → Generates APT-YYYYMMDD-XXX reference → Stores inspiration preferences
```

**Step 5: WhatsApp Negotiation with Visual References**

```
Melody contacts client via WhatsApp → Discusses design with reference to inspiration images/past work → Confirms or modifies booking
```

**Step 6: Appointment Confirmation**

```
Melody updates appointment status to "confirmed" → Time slots become unavailable → Client receives confirmation with visual references
```

### 2. Service Gallery Management (Admin - EN)

**Initial Portfolio Setup Workflow (For Existing Business):**

```
Admin Dashboard → Gallery Manager → Past Work Tab → Bulk Upload Tool
```

**Bulk Upload Process:**
1. **Batch Image Selection**: Upload multiple past work photos
2. **Metadata Assignment**: For each image assign:
    - Service type (Polygel Manicure, French Tips, etc.)
    - Category classification
    - Title and description (EN/TR)
    - Tags for filtering (french_tips, chrome, rhinestones)
    - Featured status (highlight best work)
3. **Quality Control**: Review and approve images before going public
4. **Organization**: System auto-organizes by service and category

**Ongoing Gallery Management:**

**Service Image Upload Workflow:**
```
Select Service → Upload Images → Classify Image Type → Set Display Order → Publish
```

**Image Type Classification:**
- **Hero Images**: Main service card banners (1 per service)
- **Gallery Images**: Portfolio photos showing service variety
- **Before/After**: Transformation demonstrations
- **Technique**: Step-by-step process documentation
- **Detail Shots**: Close-ups of specific design elements

**Past Work Promotion Workflow:**
```
Completed Appointment → Upload Result Photos → Tag & Categorize → Get Client Consent → Add to Public Gallery
```

### 3. Dual Form Management (Admin - EN)

**Visual Interface Workflow:**
```
Client Profile → Dual Forms Tab → SVG Hand Display (Left/Right hands)
```

**Recording Process:**
1. **Visual Selection**: Click on finger in SVG hand interface
2. **Size Recording**: Select dual form size from dropdown
3. **Auto-Save**: System saves measurements per hand
4. **Quick Access**: Pre-populated forms ready for next appointment

**Data Structure:**
- Separate records for left/right hands
- Individual finger measurements (thumb, index, middle, ring, pinky)
- Historical tracking of size changes
- Notes field for special considerations

### 4. Inventory Management with Product Variants

**Product Setup Flow:**
```
Create Product Category → Add Base Product → Create Color/Variant → Set Stock Levels
```

**Example: Polygel Management**
```
Base Product: "Manicure Polygel"
├── Variant: "Nude" (qty: 2, status: in_stock)
├── Variant: "Pink" (qty: 1, status: low)  
└── Variant: "White" (qty: 0, status: out_of_stock)
```

**Usage Tracking Options:**
- **Track Usage**: Yes/No toggle per product
- **Track Quantity**: Numeric vs Status-only (low/in_stock/out_of_stock)
- **Optional Quantity**: Usage tracking can be skipped during busy periods

### 5. Service & Add-on System

**Service Structure with Visual Content:**
```
Base Service (e.g., "Polygel Manicure")
├── Duration: 120 minutes
├── Base Price: $150
├── Linked Products: [Polygel, Base Coat, Top Coat]
├── Service Images: [Hero, Gallery, Technique photos]
├── Past Work Examples: [12 completed client works]
└── Available Add-ons: [French Tips, Chrome, Decorations]
```

**Add-on Types:**
- **Fixed Price**: Set amount (e.g., French Tips = $25)
- **Starting Price**: Base price that can increase (e.g., Chrome from $30)
- **Variable**: Price set during invoicing (e.g., Rhinestones)

**Bundle Services:**
- **Sum of Parts**: Total = Service prices added
- **Fixed Price**: Set bundle price regardless of components
- **Starting Price**: Base bundle price + add-on modifications

### 6. Enhanced Appointment & Invoicing Flow

**Appointment Progression:**
```
pending → confirmed → in_progress → completed
                    ↓               ↓
                 cancelled       promote_to_gallery
                 no_show              ↓
                                past_work_entry
```

**Service Delivery with Documentation:**
1. **Start Appointment**: Status → "in_progress", load client dual forms
2. **Service Documentation**: Take progress photos for technique reference
3. **Add Services/Add-ons**: Modify during service if needed
4. **Final Pricing**: Adjust price based on actual work
5. **Upload Results**: Photos of completed nails vs inspiration
6. **Complete Appointment**: Status → "completed"
7. **Portfolio Consideration**: Decide if work should be added to gallery

**Invoice Generation with Gallery Integration:**
```
Appointment Complete → Generate Invoice (INV-YYYYMMDD-XXX) → Record Payment → Update Loyalty Points → Optional: Add to Gallery
```

**Product Usage Tracking:**
```
Optional during invoicing → Select products used → Specify variants/colors → Record quantities
```

### 7. Past Work Gallery Curation

**Quality Control Workflow:**
```
Staff uploads past work → Admin reviews → Approve/Reject → Featured work selection → Public gallery update
```

**Client Consent Management:**
- Each gallery entry requires client consent flag
- Option to contact clients for retroactive consent
- Anonymous display option (no client identification)
- Consent tracking in appointment notes

**Gallery Organization:**
- Filter by service type, category, featured status
- Tag-based search (french_tips, chrome, seasonal)
- Before/after comparison views
- Technique documentation linking

### 8. Client Gallery Browsing Experience

**Visual Discovery Flow:**
```
Browse Categories → View Category Gallery → Select Service → View Service Portfolio → Choose Past Work Inspiration → Book Appointment
```

**Gallery Features for Clients:**
- **Category Browsing**: Hero images for each service category
- **Service Portfolios**: Multiple examples per service type
- **Filter & Search**: By tags, colors, complexity, featured status
- **Inspiration Selection**: Save favorite works for appointment reference
- **Before/After Views**: See transformation possibilities

**Mobile Gallery Experience:**
- Swipe-through image galleries
- Pinch-to-zoom for detail viewing
- Save to favorites for appointment reference
- Share images via WhatsApp for consultation

### 9. Loyalty & Referral System

**Loyalty Point Types:**

**Standard Loyalty:**
- Earn points per dollar spent (configurable ratio)
- Redeem points for discounts on future services

**Frequency Loyalty:**
- Visit milestone rewards (e.g., every 5th visit = 10% discount)
- Tier-based rewards (e.g., 10 visits = VIP status)

**Referral Rewards:**
- Referrer gets points when referred client completes first appointment
- Referred client gets welcome bonus

**Friends Booking:**
- Group booking discounts when client brings friends
- Bulk appointment scheduling for friend groups

**Implementation:**
```
Invoice Creation → Calculate Points Earned → Update Loyalty Account → Log Transaction
```

### 10. Availability Management

**Schedule Setup:**
```
Weekly Schedule → Set daily hours (e.g., Mon: 9AM-5PM) → Account for breaks
```

**Unavailable Periods:**
```
Add Period → Set dates/times → Choose type (exam/study/vacation) → Block appointments
```

**Time Slot Logic:**
- 30-minute base slots
- Service duration determines slot consumption
- Example: 2-hour service = 4 consecutive slots blocked

### 11. Enhanced Admin Dashboard Workflows

**Daily Operations:**
1. **Morning Review**: Check today's appointments, confirm bookings
2. **Gallery Management**: Review uploaded past work, approve for public display
3. **Inventory Check**: Review low stock alerts, update levels
4. **Client Communication**: Respond to WhatsApp negotiations with visual references
5. **Service Delivery**: Update appointment statuses, upload results, consider gallery promotion

**Weekly Management:**
1. **Schedule Planning**: Set availability, block study/exam times
2. **Portfolio Curation**: Feature best past work, organize by seasons/trends
3. **Inventory Restocking**: Order low stock items, update quantities
4. **Client Follow-up**: Send loyalty updates, referral rewards
5. **Analytics Review**: Check performance reports, popular services, most-viewed gallery items

**Monthly Analysis:**
1. **Financial Reports**: Revenue, profit margins, payment trends
2. **Client Analytics**: Retention rates, new vs returning clients, gallery engagement
3. **Service Performance**: Most popular services, add-on uptake, gallery impact on bookings
4. **Portfolio Performance**: Most-viewed past work, seasonal trends
5. **Inventory Optimization**: Usage patterns, reorder point adjustments

---

## User Interface Workflows

### Client Portal (TR/EN Internationalization)

**Enhanced Visual Experience:**
- Image-rich service browsing with lazy loading
- Past work galleries with filtering capabilities
- Inspiration saving and reference system
- Visual appointment confirmation with reference images

**Language Detection:**
- Browser language preference
- Manual language toggle
- Persistent language setting
- Image metadata serves appropriate language content

**Mobile-First Design:**
- Touch-friendly booking calendar
- Swipe-through image galleries
- Image upload for inspiration photos
- WhatsApp integration buttons
- Responsive appointment cards with visual content

**Key Screens:**
1. **Home/Booking**: Service selection with hero images, gallery previews
2. **Service Gallery**: Full portfolio browsing with filtering
3. **My Profile**: Personal info, dual form history, saved inspirations
4. **My History**: Past appointments with before/after comparisons
5. **Loyalty Dashboard**: Points balance, available rewards

### Admin Dashboard (English Only)

**Enhanced Gallery Management Interface:**

**Service Gallery Manager:**
```html
<!-- Tabbed interface for different image types -->
<Tabs>
  <TabsContent value="services">
    <!-- Service image management with drag-drop ordering -->
    <ServiceImageGrid 
      :images="serviceImages"
      @reorder="updateDisplayOrder"
      @feature="toggleFeaturedStatus"
      @upload="showImageUploadModal"
    />
  </TabsContent>
  
  <TabsContent value="past-work">
    <!-- Past work curation with approval workflow -->
    <PastWorkManager 
      :works="pastWorkGallery"
      :filters="galleryFilters"
      @approve="approvePastWork"
      @feature="setFeaturedWork"
      @bulk-upload="showBulkUploadModal"
    />
  </TabsContent>
</Tabs>
```

**Visual Dual Form Interface:**
```html
<!-- SVG hand with clickable finger regions -->
<svg viewBox="0 0 300 400" class="hand-svg">
  <path d="..." class="finger thumb" @click="selectFinger('thumb')" />
  <path d="..." class="finger index" @click="selectFinger('index')" />
  <!-- ... other fingers ... -->
</svg>

<!-- Size selection modal -->
<select v-model="selectedSize">
  <option value="XS">Extra Small</option>
  <option value="S">Small</option>
  <!-- ... -->
</select>
```

**Enhanced Calendar Interface:**
- Weekly/monthly views with time slots
- Drag-and-drop appointment management
- Color coding by status
- Conflict detection and warnings
- Visual appointment cards showing inspiration images

**Gallery-Enabled Inventory Dashboard:**
- Visual stock level indicators
- Product usage charts
- Reorder alerts with supplier integration
- Color variant management grid
- Product image management

---

## Analytics & Reporting Workflows

### Enhanced Real-Time Dashboards

**Business Overview with Gallery Metrics:**
- Today's revenue and appointments
- Gallery engagement statistics (most-viewed services)
- Week-over-week growth metrics
- Low stock alerts
- Pending appointment confirmations
- Past work approval queue

**Client Insights with Visual Engagement:**
- New vs returning client ratio
- Average spend per client
- Popular service combinations
- Gallery browsing patterns
- Inspiration source analysis (uploaded vs gallery-selected)
- Loyalty program participation rates

**Gallery Performance Analytics:**
- Most-viewed past work pieces
- Service booking correlation with gallery views
- Seasonal trend identification in requests
- Popular tag combinations
- Featured work performance metrics

### Automated Reports

**Daily Summary:**
- Appointments completed
- Revenue generated
- Products used
- Gallery uploads and approvals
- No-shows and cancellations

**Weekly Performance:**
- Service popularity rankings
- Add-on attachment rates
- Client retention metrics
- Gallery engagement rates
- Most-requested inspiration styles

**Monthly Analytics:**
- Financial statements
- Client growth analysis
- Service profitability
- Portfolio performance impact on bookings
- Seasonal trend analysis
- Gallery ROI metrics

---

## Technical Implementation Notes

### Vue 3 + TypeScript Structure with Gallery System

**Enhanced Store Management (Pinia):**
```typescript
// stores/gallery.ts
export const useGalleryStore = defineStore('gallery', () => {
  const serviceImages = ref<ServiceImage[]>([])
  const pastWork = ref<PastWork[]>([])
  const categories = ref<Category[]>([])
  
  const featuredPastWork = computed(() => 
    pastWork.value.filter(work => work.is_featured && work.is_public)
  )
  
  const getServiceGallery = async (serviceId: string) => {
    const { data } = await supabase.rpc('get_service_images', { 
      p_service_id: serviceId 
    })
    return data
  }
  
  const uploadPastWork = async (workData: PastWorkUpload) => {
    // Handle image upload and metadata creation
    const imagePath = await uploadToStorage(workData.image)
    return await supabase.from('past_work_gallery').insert({
      ...workData,
      after_image_path: imagePath,
      approval_status: 'pending'
    })
  }
})
```

**Enhanced Component Structure:**
```
src/
├── components/
│   ├── booking/
│   │   ├── ServiceSelector.vue
│   │   ├── ServiceGallery.vue          // NEW: Visual service browsing
│   │   ├── PastWorkGallery.vue         // NEW: Portfolio browsing
│   │   ├── TimeSlotPicker.vue
│   │   └── InspirationUpload.vue
│   ├── admin/
│   │   ├── DualFormInterface.vue
│   │   ├── AppointmentCalendar.vue
│   │   ├── ServiceGalleryManager.vue   // NEW: Gallery management
│   │   ├── PastWorkManager.vue         // NEW: Portfolio curation
│   │   ├── BulkUploadTool.vue          // NEW: Bulk portfolio upload
│   │   └── InventoryGrid.vue
│   ├── gallery/
│   │   ├── ImageUploader.vue           // NEW: Drag-drop image upload
│   │   ├── ImageGrid.vue               // NEW: Responsive image grid
│   │   ├── ImageModal.vue              // NEW: Full-screen image viewer
│   │   └── TagManager.vue              // NEW: Tag-based filtering
│   └── shared/
├── stores/
├── views/
└── types/
    └── gallery.ts                      // NEW: Gallery type definitions
```

### Enhanced Supabase Integration

**Authentication with Gallery Permissions:**
- Role-based access (client/technician/admin)
- Row Level Security for gallery content
- Image upload permissions by role
- Gallery approval workflow

**Real-time Features:**
```typescript
// Real-time gallery updates
const gallerySubscription = supabase
  .channel('gallery-updates')
  .on('postgres_changes', 
     { event: '*', schema: 'public', table: 'past_work_gallery' },
     (payload) => {
       // Update gallery displays in real-time
       updateGalleryStore(payload)
     })
  .subscribe()
```

**Enhanced File Storage:**
- Inspiration images: `inspiration-images/{appointment_id}/`
- Result photos: `result-photos/{appointment_id}/`
- Service gallery: `service-gallery/{service_id}/`
- Past work portfolio: `service-gallery/past-work/{work_id}/`
- Avatar images: `avatars/{user_id}/`

### Gallery-Enhanced Data Fetching (Pinia Colada)

**Image-Optimized Query Management:**
```typescript
// composables/useServiceGallery.ts
export function useServiceGallery(serviceId: Ref<string>) {
  return useQuery({
    key: computed(() => ['service-gallery', serviceId.value]),
    query: () => fetchServiceGallery(serviceId.value),
    staleTime: 1000 * 60 * 10, // 10 minutes (images change less frequently)
  })
}

// composables/usePastWork.ts
export function usePastWorkGallery(filters: Ref<GalleryFilters>) {
  return useQuery({
    key: computed(() => ['past-work', filters.value]),
    query: () => fetchPastWork(filters.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
```

**Image Processing Pipeline:**
- Client-side image compression before upload
- Automatic thumbnail generation
- Progressive image loading
- Lazy loading for gallery grids
- Image optimization for different screen sizes

---

## Deployment & Scaling Considerations

### Production Setup with Gallery System

**Enhanced Environment Configuration:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_WHATSAPP_API_URL=optional_whatsapp_integration
VITE_IMAGE_OPTIMIZATION_SERVICE=optional_image_processing
VITE_CDN_URL=optional_cdn_for_images
```

**Performance Optimizations:**
- Image compression and optimization pipeline
- CDN integration for gallery images
- Progressive image loading
- Lazy loading for appointment history and galleries
- Virtual scrolling for large client lists
- Aggressive caching for gallery content
- Image preloading for popular services

### Future Enhancements

**Phase 2 Features:**
- AI-powered image tagging and categorization
- Automated before/after comparison generation
- Video support for technique documentation
- Advanced image search and filtering
- Client mood board creation tools
- Social media integration for gallery sharing
- Payment gateway integration (Stripe/PayPal)
- Automated appointment reminders (SMS/Email)
- QR code check-ins
- Advanced analytics with ML insights on gallery performance

**Scaling Considerations:**
- Multi-technician support with individual galleries
- Branch/location management with regional portfolios
- Franchise system compatibility with shared gallery assets
- API rate limiting and quotas
- Image storage optimization and archiving
- Gallery performance monitoring and analytics

This enhanced system now provides a complete visual experience that supports both the operational needs of the business and the marketing requirements of showcasing past work. The gallery system is particularly crucial for an existing business that needs to display their portfolio to attract new clients while providing visual inspiration for the booking process.