# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 MANDATORY REFERENCE DOCUMENTATION

**🎯 PRIMARY SOURCE**: Before implementing any features, ALWAYS refer to:

**📄 [Coding Agent Reference Documentation](docs/project/Coding%20Agent%20Reference.md)**

This document contains:
- Complete business domain understanding (nail salon management)
- Detailed technical architecture and database relationships
- Enforced development patterns and best practices
- Critical business workflows and processes
- Implementation guidelines for coding agents
- Banned practices and common mistakes to avoid

**Additional Documentation**:
- **[Developer Documentation](docs/project/Developer%20Documentation.md)**: Entity relationships and database architecture
- **[Workflow Documentation](docs/project/Workflow%20Documentation.md)**: User workflows and business processes

---

## Project Overview

**Perfect Finish** is a nail tech business management system for Melody's nail salon. Built with Vue 3 + TypeScript + Supabase, focused on launching an admin section for business management with a client portal to follow.

**Priority**: Admin functionality first, then client portal later.

---

## Development Commands

### Core Commands
- `npm run dev` - Start development server (localhost)
- `npm run dev-host` - Start development server with host access
- `npm run build` - Build for production (includes type checking)
- `npm run preview` - Preview production build

### Code Quality & Testing
- `npm run lint` - Run all linting (oxlint + eslint)
- `npm run lint:oxlint` - Run oxlint with auto-fix
- `npm run lint:eslint` - Run eslint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking
- `npm run test:unit` - Run unit tests with Vitest
- `npm run test:e2e` - Run Cypress E2E tests
- `npm run test:e2e:dev` - Run Cypress in dev mode

### Database
- `npm run supabase:types` - Generate TypeScript types from Supabase schema

---

## Tech Stack & Scope (Non-negotiables)

### Stack
- **Frontend**: Vue 3.5 + TypeScript (strict mode) + Vite
- **UI Framework**: shadcn-vue (reka-ui) + Tailwind CSS 4.1
- **State Management**: Pinia 3.0 (Options API ONLY) + Pinia Colada 0.17 (data fetching)
- **Backend**: Supabase (Auth + Database + Storage)
- **Routing**: File-based routing with unplugin-vue-router (NO manual route arrays)
- **Validation**: Vee-Validate + Zod
- **Forms**: shadcn-vue forms + vee-validate + Zod
- **Internationalization**: Vue i18n (Client: Turkish/English; Admin: English only)
- **Date Utilities**: date-fns (ALWAYS use, never native Date methods)
- **Icons**: Lucide Vue Next + Radix Icons

### Banned Technologies
- ❌ React/Next.js/JSX/TSX
- ❌ Manual vue-router arrays (use file-based routing only)
- ❌ Composition API stores (Options API only for Pinia)
- ❌ Native Date methods (use date-fns)
- ❌ Hardcoded colors (theme tokens only)
- ❌ `any` type usage
- ❌ Heavy shadows in UI (use light borders/dividers)

---

## Project Structure

```
src/
├── assets/          # Static assets and global styles
├── components/
│   ├── ui/         # shadcn-vue UI components (theme-aware)
│   ├── admin/      # Admin-specific components
│   ├── client/     # Client portal components
│   ├── shared/     # Shared business components
│   └── layout/     # Layout components
├── composables/     # Vue composables (check existing before creating)
├── i18n/           # Global i18n config + locale files
│   └── locales/    # en.ts, tr.ts
├── lib/            # Utility libraries (pinia.ts, supabase.ts, utils.ts)
├── pages/          # File-based routing pages
│   ├── (admin)/    # Admin panel pages (EN only)
│   ├── (client)/   # Client portal pages (EN/TR)
│   └── auth/       # Authentication pages
├── stores/         # Pinia stores (Options API)
├── types/          # TypeScript type definitions
│   ├── index.ts    # CENTRALIZED types (use this!)
│   └── database.types.ts # Supabase generated types
└── main.ts
supabase/           # Local Supabase instance
```

---

## TypeScript Guidelines (Strict Mode)

### Rules
- **Strict mode enabled** - No `any`, no unchecked `JSON.parse`, avoid `@ts-ignore`
- Explicit return types on public functions, store actions, and composables
- Narrow errors to `Error` instances
- Always use `import type` for type imports

### Type Management (CENTRALIZED)

#### ✅ DO
- **Centralize ALL types** in `types/index.ts`
- Use generated `database.types.ts` for Supabase types
- Import from centralized location: `import type { User, Product } from '@/types'`
- Define named domain types per table (e.g., `Product`, `Variant`)
- Define join types (e.g., `ProductWithVariants`)
- Define RPC types (Args/Returns) for stored procedures

#### ❌ DON'T
- Never use `any` type
- Don't scatter types throughout the project
- Avoid inline type definitions for complex objects
- Never import `Tables<'...'>` all over the codebase

```typescript
// ✅ Good - types/index.ts (CENTRALIZED)
import type { Database, Tables, TablesInsert, TablesUpdate } from './database.types'

// Domain aliases (reuse everywhere)
export type Product = Tables<'products'>
export type ProductInsert = TablesInsert<'products'>
export type ProductUpdate = TablesUpdate<'products'>

// Join types
export type ProductWithVariants = Product & {
  product_variants: Tables<'product_variants'>[]
}

// RPC types
export type UpdateStockQuantityArgs = Database['public']['Functions']['update_stock_quantity']['Args']
export type UpdateStockQuantityReturn = Database['public']['Functions']['update_stock_quantity']['Returns']
```

---

## State Management — Pinia (Options API ONLY)

### Store Pattern (ENFORCED)
```typescript
// stores/example.ts
export const useExampleStore = defineStore('example', {
  state: () => ({
    // Light, persistent state only
    selectedItem: null as Item | null,
    filters: {} as Filters,
  }),

  persist: {
    key: 'example-store',
    pick: ['filters'], // Only persist specific fields
  },

  getters: {
    // Pure derivations
    hasSelection: (state) => !!state.selectedItem,
  },

  actions: {
    // Actions that (re)fetch MUST return Query controller or Promise
    // Mutate state ONLY inside actions
    setSelectedItem(item: Item | null) {
      this.selectedItem = item
    },

    // Return controller for caller to manage loading
    useItems() {
      return useQuery({
        key: () => ['items'],
        query: async () => {
          const { data, error } = await supabase.from('items').select('*')
          if (error) throw error
          return data || []
        },
      })
    },
  },
})
```

### Rules (ENFORCED)
- ❌ NO global `isLoading` flags in stores for network calls
- ❌ NO Composition API stores (Options API only)
- ✅ Mutate state ONLY inside store actions
- ✅ Store actions that (re)fetch MUST return Query controller or Promise
- ✅ Caller controls loading state, not the store

---

## Data Fetching — Pinia Colada

### Query Keys (ENFORCED)
- **ALWAYS use functions** for reactive query keys
- **Include ALL dependencies** used in the query function

```typescript
// ✅ Correct
useQuery({
  key: () => ['products', route.params.id, filters.category],
  query: () => getProductById(route.params.id, filters.category),
})

// ❌ Wrong - missing dependencies
useQuery({
  key: ['products'], // Missing route.params.id and filters.category
  query: () => getProductById(route.params.id),
})
```

### Query State Management
- Use `refresh()` for normal refreshes (respects staleTime)
- Use `refetch()` only when forcing new request
- Handle both `status` (data status) and `asyncStatus` (query call status)

```typescript
const { data, error, status, isLoading, asyncStatus, refresh, refetch } = useQuery({
  key: () => ['todos'],
  query: () => fetchTodos(),
  staleTime: 300_000, // 5 minutes
})

// Preferred for most cases
await refresh()

// Only when forcing fresh request
await refetch()
```

### Mutations
- Use `mutate` for fire-and-forget operations
- Use `mutateAsync` when you need to await result
- Invalidate related queries after successful mutations

```typescript
import { useMutation, useQueryCache } from '@pinia/colada'

const queryCache = useQueryCache()

const { mutate, mutateAsync, isLoading } = useMutation({
  mutation: async (product: CreateProductInput) => {
    const { data, error } = await supabase.from('products').insert(product).select().single()
    if (error) throw error
    return data
  },
  onSuccess: () => {
    queryCache.invalidateQueries({ key: ['products'] })
  },
})

// Fire-and-forget
mutate(newProduct)

// Async with error handling
try {
  const result = await mutateAsync(newProduct)
} catch (error) {
  // Handle error
}
```

### Reference Implementation
```typescript
// stores/inventory.ts (Options API)
import { defineStore } from 'pinia'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { supabase } from '@/lib/supabase'
import type { Product, ProductInsert, CategoryWithProductsAndVariants } from '@/types'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    selectedCategoryId: null as string | null,
  }),

  getters: {},

  actions: {
    // READS → return controllers (caller owns loading/error)
    useCategoriesProducts() {
      return useQuery({
        key: () => ['inventory', 'categories+products'],
        query: async () => {
          const { data, error } = await supabase
            .from('product_categories')
            .select('*, products(*, product_variants(*))')
          if (error) throw error
          return (data ?? []) as CategoryWithProductsAndVariants[]
        },
        staleTime: 300_000, // 5 minutes
      })
    },

    // WRITES → return Promises; invalidate precise keys
    async createProduct(input: ProductInsert): Promise<Product> {
      const { data, error } = await supabase
        .from('products')
        .insert([input])
        .select()
        .single()
      if (error) throw error

      const created = data as Product
      const cache = useQueryCache()
      cache.invalidateQueries({ key: ['inventory', 'categories+products'] })
      cache.invalidateQueries({ key: ['products'] })
      cache.invalidateQueries({ key: ['products', created.id] })
      return created
    },
  },
})
```

---

## UI State Management — ConditionalContent (REQUIRED)

**ALWAYS wrap data views with ConditionalContent:**

```vue
<script setup lang="ts">
import { ConditionalContent } from '@/components/ui/conditional'

const q = store.useItems()
</script>

<template>
  <ConditionalContent
    :is-loading="q.isLoading"
    :has-error="q.status === 'error'"
    :error="q.error"
    :retry="q.refresh"
    :is-empty="Array.isArray(q.data) ? q.data.length === 0 : !q.data"
    empty-title="No items"
    empty-message="Create your first item."
    empty-icon="package"
  >
    <ItemList :items="q.data!" />
  </ConditionalContent>
</template>
```

### Multi-query Pages
- Combine `isLoading` with `||`
- Combine `error` with `??`
- `retry` calls each controller's `refresh()`
- Allowed icons: `database|search|file|users|package|calendar|bell|settings|inbox`

---

## Vue SFC Conventions

- Use `<script setup lang="ts">` + `<template>` (one component per file)
- Keep templates declarative; push heavy logic into script/composables
- Reactivity: `ref` for primitives; `reactive` for grouped state; prefer `computed` over `watch`
- When consuming Pinia state, use `storeToRefs(store)` before destructuring

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useExampleStore } from '@/stores/example'

const store = useExampleStore()
const { selectedItem, filters } = storeToRefs(store) // Reactive refs
const { setSelectedItem } = store // Actions
</script>
```

---

## Routing (unplugin-vue-router)

- Pages live under `src/pages/**`
- Group by section: `(client)/**` and `(admin)/**`
- Use typed params & inferred names from plugin
- Add `meta.requiresAuth`, `meta.role`, `meta.section` as needed
- Client pages: **EN/TR** (no hardcoded strings)
- Admin pages: **EN only**

---

## Internationalization (i18n)

### Structure
```
i18n/
├── index.ts         # Global i18n configuration
└── locales/
    ├── en.ts        # English translations
    └── tr.ts        # Turkish translations

component or view folder/
└── i18n/            # Component-specific translations
    ├── auth.ts
    └── products.ts
```

### Usage Pattern
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { authMessages } from '@/.../i18n/auth'

const { t } = useI18n({
  messages: {
    en: authMessages.en,
    tr: authMessages.tr,
  },
})
</script>

<template>
  <h1>{{ t('welcome') }}</h1>
</template>
```

### Rules
- Client pages: EN & TR (no hardcoded user-facing text)
- Admin pages: English only
- Use scoped messages for maintainability
- Wrap date/number formatting in i18n-aware utils

---

## Date Handling (date-fns ONLY)

**ALWAYS use date-fns. NEVER use native Date methods.**

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

// Check if today
const isAppointmentToday = (date: string) => {
  return isToday(parseISO(date))
}
```

---

## Form Handling (shadcn-vue + vee-validate + Zod)

```vue
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = toTypedSchema(
  z.object({
    username: z.string().min(2).max(50),
  })
)

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit((values) => {
  // Handle submission
})
</script>

<template>
  <form @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="username" :validate-on-blur="!isFieldDirty">
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input type="text" placeholder="shadcn" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit">Submit</Button>
  </form>
</template>
```

---

## Supabase Integration

### Database Types
- Use generated `database.types.ts`
- Create wrapper types in `types/index.ts`
- For inserts that return rows: `.insert(...).select().single()`

```typescript
// types/index.ts
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

export type User = Tables<'users'>
export type CreateUserInput = TablesInsert<'users'>
export type UpdateUserInput = TablesUpdate<'users'>
```

### Query Patterns
```typescript
export function useUserProfile(userId: Ref<string>) {
  return useQuery({
    key: () => ['users', userId.value],
    query: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId.value)
        .single()

      if (error) throw error
      return data
    },
  })
}
```

---

## UI/UX Guidelines

### Design Principles
- **Theme-aware**: All UI must support dark/light themes (NO hardcoded colors)
- **Clean & Modern**: Use shadcn-vue consistently
- **Light borders/dividers**: Avoid heavy shadows
- **Responsive**: Mobile-first design
- **Accessible**: WCAG guidelines, semantic HTML

### Tailwind Usage
- Use theme tokens ONLY: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`
- NO hardcoded hex colors
- Component variants via class composition
- Avoid custom CSS unless necessary

### shadcn-vue Components
- All UI components in `@/components/ui`
- Import individually: `import { Button } from '@/components/ui/button'`
- Use primitives; customize via props/variants
- Keep accessible focus states

---

## Composable Guidelines

### When to Create
- Only when reused ≥2 places OR materially simplifies components
- **ALWAYS check existing composables first**

### Rules
- Focused, single-responsibility composables
- Input/output must be typed
- Must not leak raw Supabase client

```typescript
// ✅ Good - focused composable
export function useProductFilters() {
  const filters = ref({ category: '', priceRange: [0, 1000] })
  const filteredProducts = computed(() => {
    return products.value.filter((p) => p.category === filters.value.category)
  })

  return { filters, filteredProducts }
}

// ❌ Avoid - overly broad
export function useEverythingRelatedToProducts() {
  // Too many responsibilities
}
```

---

## Error Handling

- Throw `Error` objects (never raw strings)
- Map to user-facing text in UI (i18n on client)
- Components render errors via `ConditionalContent`'s error slot
- Provide `retry` where safe

---

## Performance Guidelines

- Use `defineAsyncComponent` for code splitting
- Optimize images and assets
- Use `v-memo` for expensive computations
- Tune `staleTime` realistically
- Prefer DB views/RPCs for heavy joins

---

## File Naming & Import Conventions

- Components: `PascalCase.vue` (e.g., `UserCard.vue`)
- Stores: `camelCase.ts` exporting `useXxxStore` (Options API)
- Composables: `useSomething.ts`
- Utilities: `kebab-case.ts`
- Import order: Node/3rd → `@/` aliases → relative
- Use `import type` for types

---

## Business Domain (Quick Reference)

### Core Entities
- **profiles**: Users (clients, technicians, admins)
- **appointments**: Service bookings
- **services** + **addons**: Service catalog
- **products** + **product_variants**: Inventory (color-based variants)
- **client_dual_forms**: Nail measurements per hand (SVG interface)
- **invoices** + **invoice_items**: Financial records
- **loyalty_accounts** + **loyalty_transactions**: Points system
- **service_images** + **past_work_gallery**: Visual portfolio

### Key Features
- Visual service selection with galleries
- Dual form measurements (SVG hand interface)
- Inventory with product variants (e.g., Polygel: Nude, Pink, White)
- Flexible pricing (fixed, starting price, variable)
- Multi-language support (Turkish/English for client, English for admin)
- WhatsApp integration
- Loyalty & referral system

---

## Environment Setup

Required environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Development Workflow

1. **Check existing composables** before creating new ones
2. **Define types** in `types/index.ts` before implementation
3. **Use ConditionalContent** for all data UIs
4. **Follow file-based routing** patterns
5. **Run linting** and type checking before committing
6. **Generate database types** after schema changes
7. **Support Turkish/English** for client features
8. **Ensure theme awareness** for all UI components

---

## Testing & Linting

- ESLint + Prettier (100 column width)
- `vue-tsc` for type checks
- Unit test stores and `src/lib/*`
- Mock Supabase in tests

---

## Banned Practices (ENFORCED)

- ❌ React/Next/JSX/TSX
- ❌ Manual vue-router arrays
- ❌ Blanket cache invalidation
- ❌ Global store loading flags
- ❌ Heavy shadows
- ❌ Hardcoded colors
- ❌ Duplicative composables
- ❌ `any` type usage
- ❌ Unreviewed `@ts-ignore`
- ❌ Composition API stores (Options API only)
- ❌ Direct Supabase imports outside centralized types
- ❌ UI components without theme awareness
- ❌ Native Date methods (use date-fns)

---

## PR Checklist

- [ ] Centralized types used from `types/index.ts`
- [ ] Queries/mutations follow Pinia Colada patterns
- [ ] `ConditionalContent` wraps data UIs
- [ ] i18n keys added for client features (TR/EN)
- [ ] Theme tokens only (no hardcoded colors)
- [ ] Tests updated
- [ ] Type checking passes
- [ ] Linting passes
- [ ] No banned practices used

---

This system prioritizes maintainable, type-safe code with excellent user experience for nail salon business management.
