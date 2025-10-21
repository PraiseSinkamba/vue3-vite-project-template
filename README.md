# 💅 Perfect Finish - Nail Tech Business Management System

> A comprehensive business management solution for Melody's nail salon, featuring visual appointment booking, dual-form sizing, inventory tracking, and portfolio showcase.

## 📋 Overview

**Perfect Finish** is a full-stack Vue 3 application designed for nail tech business management. The system supports both client-facing booking (Turkish/English) and admin management interfaces, with emphasis on visual galleries, precise dual-form measurements, and loyalty programs.

**Current Status**: Development in progress
**Priority**: Admin Section → Client Portal

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Vue 3.5 with TypeScript + Vite
- **UI Library**: shadcn-vue (reka-ui) + Tailwind CSS 4.1
- **State Management**: Pinia 3.0 with Options API pattern
- **Data Fetching**: Pinia Colada 0.17 (useQuery/useMutation)
- **Routing**: File-based routing (unplugin-vue-router)
- **Validation**: Vee-Validate + Zod
- **Internationalization**: Vue i18n (Turkish/English)
- **Date Handling**: date-fns (all date operations)
- **Icons**: Lucide Vue Next + Radix Icons

### Backend
- **BaaS**: Supabase (Authentication + PostgreSQL + Storage)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **File Storage**: Supabase Storage (multi-bucket strategy)
- **Real-time**: Supabase Realtime subscriptions

---

## 📁 Project Structure

```
perfect-finish/
├── src/
│   ├── assets/              # Static assets and fonts
│   ├── components/
│   │   ├── ui/             # shadcn-vue components
│   │   ├── admin/          # Admin-specific components
│   │   ├── client/         # Client portal components
│   │   ├── shared/         # Shared business components
│   │   ├── layout/         # Layout wrappers & sidebar
│   │   └── icons/          # Custom icon components
│   ├── composables/        # Vue composables (useQuery patterns)
│   ├── i18n/               # Internationalization (en.json, tr.json)
│   ├── lib/                # Core utilities
│   │   ├── pinia.ts       # Pinia configuration
│   │   ├── supabase.ts    # Supabase client
│   │   └── utils.ts       # Helper functions
│   ├── pages/              # File-based routing
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── (client)/      # Client portal (grouped route)
│   │   └── auth/          # Authentication pages
│   ├── stores/             # Pinia stores (Options API)
│   ├── types/              # TypeScript definitions
│   │   └── database.types.ts  # Supabase generated types
│   └── main.ts
├── docs/
│   └── project/            # Comprehensive documentation
├── supabase/               # Supabase migration files
└── CLAUDE.md               # AI assistant context
```

---

## ✨ Key Features

### Client Portal (Turkish/English)
- 🎨 **Visual Service Selection**: Browse services with hero images and past work galleries
- 📅 **Smart Appointment Booking**: 30-minute time slot system with availability checking
- 🖼️ **Inspiration Upload**: Upload reference images or select from past work portfolio
- 👤 **Client Profile**: Personal info, appointment history, loyalty dashboard
- 💎 **Loyalty Program**: Points earning, frequency rewards, referral bonuses
- 📱 **Mobile-First Design**: Touch-friendly interface with WhatsApp integration

### Admin Dashboard (English)
- 📊 **Business Dashboard**: Today's appointments, revenue metrics, alerts
- 📅 **Calendar Management**: Weekly/daily views with drag-drop scheduling
- 👥 **Client Management**: Searchable client list with detailed profiles
- ✋ **Dual Form Interface**: Visual SVG hand selector for nail measurements
- 🖼️ **Gallery Manager**: Upload service images, curate past work portfolio
- 📦 **Inventory Tracking**: Product variants, stock levels, usage tracking
- 🛍️ **Service Catalog**: Services, add-ons, bundles with pricing
- 💰 **Invoicing**: Automated invoice generation with loyalty integration
- 📈 **Analytics**: Revenue reports, service performance, client insights

### Core Business Features
- **Visual Portfolio System**: Service galleries and past work showcase for marketing
- **Dual Form Measurements**: Precise nail sizing recorded per hand via SVG interface
- **Product Variants**: Color-based inventory (e.g., Polygel: Nude, Pink, White)
- **Flexible Pricing**: Fixed, starting price, and variable pricing models
- **Multi-Language**: Full Turkish/English support with i18n
- **WhatsApp Integration**: Client communication and design negotiation
- **Real-time Updates**: Live appointment and inventory changes

---

## 🗄️ Database Architecture

### Core Entities
- **profiles**: Users (clients, technicians, admins) with roles and preferences
- **appointments**: Service bookings with client, technician, services, and pricing
- **services** + **addons**: Service catalog with duration, pricing, and product links
- **products** + **product_variants**: Inventory with colors/sizes and stock tracking
- **client_dual_forms**: Nail measurements per hand (left/right) for each client
- **invoices** + **invoice_items**: Financial records with payment tracking
- **loyalty_accounts** + **loyalty_transactions**: Points system with audit log
- **service_images** + **past_work_gallery**: Visual portfolio and marketing content

### Entity Relationships
```
PROFILES → book → APPOINTMENTS → generate → INVOICES → update → LOYALTY_ACCOUNTS
    ↓           ↓                    ↓            ↓
DUAL_FORMS   SERVICES +         INVOICE_ITEMS   LOYALTY_TRANSACTIONS
             ADDONS             PRODUCT_USAGE
             ↓
        SERVICE_IMAGES +
        PAST_WORK_GALLERY
```

**See [Developer Documentation](docs/project/Developer%20Documentation.md) for complete entity definitions and relationships.**

---

## 🔄 Core Workflows

### 1. Client Booking Flow
```
Browse Services (with galleries) → Select Service → Choose Time Slot →
Enter Client Info → Upload Inspiration → Submit Booking (pending) →
WhatsApp Negotiation → Admin Confirms → Appointment Confirmed
```

### 2. Appointment Management
```
Dashboard → Today's Appointments → View Details →
Update Status (pending/confirmed/in_progress/completed) →
Upload Result Photos → Generate Invoice → Optional: Add to Gallery
```

### 3. Dual Form Measurement
```
Client Profile → Dual Forms Tab → Select Hand (Left/Right) →
Click Finger on SVG Hand → Select Dual Form Size → Save →
Auto-loaded for Future Appointments
```

### 4. Gallery Management
```
Admin Dashboard → Gallery Manager →
Service Images: Upload & Categorize (hero/gallery/technique) →
Past Work: Bulk Upload Portfolio → Tag & Approve →
Set Featured Works → Publish to Client Portal
```

### 5. Inventory Tracking
```
Products → Create/Select Product → Add Variants (colors/sizes) →
Set Stock Levels → Configure Usage Tracking →
Appointment Complete → Record Product Usage (optional) →
Auto-update Stock → Reorder Alerts
```

### 6. Invoicing & Loyalty
```
Appointment Completed → Generate Invoice →
Apply Loyalty Discounts → Record Payment →
Auto-calculate Loyalty Points → Update Client Balance →
Loyalty Transactions Log
```

**See [Workflow Documentation](docs/project/Workflow%20Documentation.md) for detailed process flows and UI mockups.**

---

## 💻 Development Guide

### Prerequisites
- Node.js 18+ and npm
- Supabase account with project created
- Git for version control

### Getting Started

**1. Clone and Install**
```bash
git clone <repository-url>
cd perfect-finish
npm install
```

**2. Environment Setup**
```bash
# Create .env file
cp .env.example .env

# Add your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**3. Generate Database Types**
```bash
npm run supabase:types
```

**4. Start Development Server**
```bash
npm run dev              # Start on localhost
npm run dev-host         # Start with network access
```

### Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost)
npm run dev-host         # Start dev server with host access

# Building
npm run build            # Build for production (includes type-check)
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run all linting (oxlint + eslint)
npm run lint:oxlint      # Run oxlint with auto-fix
npm run lint:eslint      # Run eslint with auto-fix
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test:unit        # Run unit tests (Vitest)
npm run test:e2e         # Run E2E tests (Cypress)
npm run test:e2e:dev     # Run Cypress in dev mode

# Database
npm run supabase:types   # Generate TypeScript types from Supabase
```

---

## 🏗️ Architecture Patterns

### State Management (Pinia)

**Options API Pattern for Stores:**
```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    profile: null as Profile | null,
  }),

  persist: {
    key: 'auth-store',
    pick: ['user', 'profile'], // Only persist specific fields
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.profile?.role === 'admin',
  },

  actions: {
    async login(email: string, password: string) {
      // Authentication logic
    },
  },
})
```

**Key Points:**
- Use Options API syntax for all stores
- Configure persistence with `pinia-plugin-persistedstate`
- Stores manage UI state, NOT data fetching
- Keep stores focused and single-purpose

### Data Fetching (Pinia Colada)

**Query Pattern with Reactive Keys:**
```typescript
// composables/useAppointments.ts
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'

// Fetch appointments with reactive parameters
export function useAppointments(dateRange: Ref<DateRange>) {
  return useQuery({
    key: () => ['appointments', dateRange.value], // Reactive key without computed()
    query: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, client:profiles(*), service:services(*)')
        .gte('appointment_date', format(dateRange.value.start, 'yyyy-MM-dd'))
        .lte('appointment_date', format(dateRange.value.end, 'yyyy-MM-dd'))

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Create appointment mutation
export function useCreateAppointment() {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async (data: CreateAppointmentData) => {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return appointment
    },
    onSuccess: () => {
      // Invalidate all appointment queries
      queryCache.invalidateQueries({ key: ['appointments'] })
    },
  })
}
```

**Key Points:**
- Use `useQuery` for data fetching with reactive parameters
- Use `useMutation` for data modifications
- Implement proper cache invalidation with `useQueryCache`
- Return `QueryReturn`/`MutationReturn` from composables
- No `computed()` wrapper for reactive keys

### Component Development

**Using `<script setup>` with TypeScript:**
```vue
<script setup lang="ts">
import { useAppointments } from '@/composables/useAppointments'
import { useAppointmentStore } from '@/stores/appointments'
import { computed } from 'vue'

const appointmentStore = useAppointmentStore()
const dateRange = computed(() => appointmentStore.dateRange)

// Returns UseQueryReturn with data, isLoading, error
const { data: appointments, isLoading, error } = useAppointments(dateRange)
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <AppointmentCard v-for="apt in appointments" :key="apt.id" :appointment="apt" />
  </div>
</template>
```

**Key Points:**
- Use `<script setup>` syntax consistently
- Import shadcn-vue components from `@/components/ui/[component]`
- Follow existing component patterns
- Use `date-fns` for all date operations
- Proper TypeScript typing with database.types.ts

### Date Handling with date-fns

**Always use date-fns for date operations:**
```typescript
import { format, isToday, isSameDay, startOfDay, endOfDay, parseISO } from 'date-fns'

// Format dates consistently
const formatDate = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, 'MMM dd, yyyy')
}

// Format time
const formatTime = (time: string) => {
  return format(parseISO(`2000-01-01T${time}`), 'h:mm a')
}

// Check if appointment is today
const isAppointmentToday = (date: string) => {
  return isToday(parseISO(date))
}
```

**Never use native Date methods - always use date-fns.**

---

## 🎨 Design System

### UI/UX Principles
- **Clean & Minimal**: Light borders, efficient use of space, no heavy shadows
- **Visual Hierarchy**: Clear information architecture with proper spacing
- **Productivity Focus**: Fast, efficient admin tools with keyboard shortcuts
- **Responsive Design**: Mobile-first approach for all interfaces
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Color Scheme
```css
/* Professional nail salon aesthetic */
--primary: 221 83% 53%;           /* Blue - primary actions */
--primary-foreground: 0 0% 98%;   /* White text on primary */

/* Neutral palette */
--background: 0 0% 100%;           /* Pure white background */
--foreground: 222.2 84% 4.9%;     /* Near-black text */
--muted: 210 40% 98%;              /* Light gray backgrounds */
--border: 214.3 31.8% 91.4%;      /* Subtle borders */

/* Semantic colors */
--success: 142 76% 36%;            /* Green - completed */
--warning: 38 92% 50%;             /* Amber - pending */
--destructive: 0 84% 60%;          /* Red - cancelled */
```

---

## 📚 Documentation

### Project Documentation
- **[Developer Documentation](docs/project/Developer%20Documentation.md)**: Complete entity relationships, column definitions, and technical architecture
- **[Workflow Documentation](docs/project/Workflow%20Documentation.md)**: User workflows, UI patterns, and business processes
- **[CLAUDE.md](CLAUDE.md)**: AI assistant context and coding guidelines

### Key Concepts

**Dual Form System**: Visual SVG hand interface for recording nail sizes per finger. Each client has up to 2 records (left/right hand). Critical for pre-appointment preparation.

**Service Gallery System**: Visual portfolio management with service images and past work showcase. Supports bulk upload for existing businesses.

**Product Variants**: Base products with multiple variants (colors/sizes). Example: Polygel → Nude, Pink, White variants with individual stock tracking.

**Flexible Pricing**: Services support fixed price, starting price (adjustable), and variable pricing models.

**Loyalty System**: Multiple reward types - points per dollar, frequency milestones, referral bonuses, friends booking discounts.

---

## 🛠️ Implementation Guidelines

### TypeScript & Type Safety
- Use `database.types.ts` consistently for all database entities
- No `any` types allowed
- Proper Zod schemas for form validation
- Type-safe environment variables

### Code Organization
- Single Responsibility Principle
- Consistent file naming (kebab-case for files, PascalCase for components)
- Barrel exports for clean imports (`index.ts` files)
- Proper component composition and reusability

### Performance
- Virtual scrolling for large lists (@tanstack/vue-table)
- Image optimization with lazy loading
- Proper query caching with Pinia Colada
- v-memo for expensive renders

### Error Handling
- Global error handler in main.ts
- Toast notifications for user feedback (vue-sonner)
- Graceful degradation for network issues
- Proper loading states and error boundaries

### Styling
- Tailwind CSS 4.1 with shadcn-vue design system
- CSS custom properties for theming
- Mobile-first responsive design
- Clean, minimal aesthetic

---

## 📦 Deployment

### Production Build
```bash
npm run build     # Build with type checking
npm run preview   # Preview production build
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Deployment Checklist
- [ ] Generate latest database types
- [ ] Run type checking
- [ ] Run linting
- [ ] Test production build locally
- [ ] Configure Supabase RLS policies
- [ ] Set up environment variables
- [ ] Deploy to hosting platform (Vercel/Netlify)
- [ ] Test production deployment

---

## 🚧 Current Development Status

### Completed
- ✅ Project setup with Vue 3 + TypeScript + Vite
- ✅ Supabase integration and authentication
- ✅ State management with Pinia
- ✅ UI component library (shadcn-vue)
- ✅ File-based routing
- ✅ Database schema and types

### In Progress
- 🔄 Admin dashboard implementation
- 🔄 Appointment management system
- 🔄 Client management interface
- 🔄 Service catalog and gallery

### Planned
- 📋 Dual form interface (SVG hand)
- 📋 Inventory management
- 📋 Invoicing system
- 📋 Loyalty program
- 📋 Client portal (Turkish/English)
- 📋 Analytics and reporting

---

## 🤝 Contributing

This is a private project for Melody's nail salon business. For development inquiries, please contact the project maintainer.

---

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for nail tech professionals
