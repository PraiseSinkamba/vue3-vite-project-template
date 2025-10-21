# JetBrains Junie Project Guidelines

## 📋 CODING AGENT REFERENCE (MANDATORY)

**🎯 PRIMARY DOCUMENTATION**: Before implementing any features or fixes, coding agents MUST refer to the comprehensive project reference document:

**📄 [Coding Agent Reference Documentation](../docs/project/Coding%20Agent%20Reference.md)**

This document contains:
- **Complete business domain understanding** (nail salon management system)
- **Detailed technical architecture** and database relationships
- **Enforced development patterns** (Pinia Options API, ConditionalContent, etc.)
- **Critical business workflows** (gallery management, booking flows, portfolio system)
- **Implementation guidelines** specific to coding agents
- **Banned practices** and common mistakes to avoid

**🚨 IMPORTANT**: The Coding Agent Reference document is the single source of truth for understanding:
- Project goals and business context
- Entity relationships and database schema
- User workflows and business processes
- Required development patterns and best practices

Always consult this reference before starting any development work to ensure consistency with established architecture and business requirements.

---

## Project Overview
This is a Vue 3 TypeScript project using Vite as the build tool, with a modern tech stack including Supabase backend, shadcn-vue UI components, and internationalization support for Turkish and English locales.

## Tech Stack
- **Frontend**: Vue 3 + TypeScript + Vite
- **UI Framework**: shadcn-vue + Tailwind CSS
- **Icons**: Lucide Vue Next
- **State Management**: Pinia (Options API only) + Pinia Colada (for data fetching)
- **Backend**: Supabase (local instance in `/supabase` folder)
- **Forms**: shadcn-vue forms + vee-validate + Zod
- **Date Handling**: date-fns
- **Internationalization**: Vue I18n
- **Routing**: unplugin-vue-router (file-based routing)

## Scope & Non-negotiables
- Stack: Vue 3 + Vite + TypeScript (strict), Pinia (Options API stores), Pinia-Colada, unplugin-vue-router, Supabase, shadcn-vue + Tailwind, i18n (Client EN/TR; Admin EN).
- Never propose React/Next/JSX/TSX.
- File-based routing only (unplugin-vue-router). No manual route arrays.
- All UI must be **theme-aware** (dark/light). No hardcoded hex colors.
- Store actions that (re)fetch **must return** a **Query controller or Promise** so the **caller** controls loading state.
- Use **ConditionalContent** for all data UIs: `import { ConditionalContent } from '@/components/ui/conditional'`.

## Project Structure

### Directory Organization
```
src/
├── components/
│   └── ui/          # All shadcn-vue components
├── lib/             # Supabase instance & utility functions
├── i18n/            # Global locale configuration
├── types/           # Type definitions
│   ├── index.ts     # All project types (centralized)
│   └── database.types.ts # Supabase generated types
├── composables/     # Reusable composition functions
├── stores/          # Pinia stores
├── pages/           # File-based routing pages
│   ├── (client)/    # Client-facing pages (EN/TR)
│   └── (admin)/     # Admin pages (EN only)
└── views/           # Vue pages/views (legacy)
supabase/            # Local Supabase instance (root level)
```

## File Naming & Import Conventions
- Components: `PascalCase.vue` (e.g., `UserCard.vue`)
- Stores: `camelCase.ts` exporting `useXxxStore` (Options API)
- Composables: `useSomething.ts` (only when it improves reuse/clarity)
- Utility modules/types: `kebab-case.ts`
- Import order: Node/3rd → `@/` aliases → relative. Use `import type` for types

## TypeScript Guidelines

### Strict Rules
- **Strict mode enabled**. No `any`, no unchecked `JSON.parse`, avoid `@ts-ignore` (document rare exceptions)
- Prefer explicit return types on public functions, store actions, and composables
- Narrow errors to `Error` instances; normalize unknowns via a helper (e.g., `toUserMessage(err)`)

### Type Management

#### ✅ DO
- **Centralize all types** in `types/index.ts`
- Use the generated `database.types.ts` for Supabase types
- Import types from the centralized location: `import type { User, Product } from '@/types'`
- Prefer `interface` over `type` for object definitions
- Define **named domain types** per table (e.g., `Product`, `Variant`, `Category`)
- Define **join types** (e.g., `ProductWithVariants`, `CategoryWithProductsAndVariants`)
- Define **RPC types** (Args/Returns) for any used stored procedures

#### ❌ DON'T
- Never use `any` type
- Don't create types scattered throughout the project
- Avoid inline type definitions for complex objects
- Never import `Tables<'...'>` all over the codebase

```typescript
// ✅ Good - types/index.ts
import type { Database, Tables, TablesInsert, TablesUpdate} from './database.types'

// Domain aliases (reuse everywhere)
export type Product = Tables<'products'>;
export type ProductInsert = TablesInsert<'products'>;
export type ProductUpdate = TablesUpdate<'products'>;

// Joins
export type ProductWithVariants =
  Product & { product_variants: Tables<'product_variants'>[] };

export type CategoryWithProductsAndVariants =
  Tables<'product_categories'> & {
    products: (Product & { product_variants: Tables<'product_variants'>[] })[]
  };

// RPC example
export type UpdateStockQuantityArgs =
  Database['public']['Functions']['update_stock_quantity']['Args'];
export type UpdateStockQuantityReturn =
  Database['public']['Functions']['update_stock_quantity']['Returns'];
```

## Vue SFC Conventions
- Use `<script setup lang="ts">` + `<template>`. One component per file
- Keep templates declarative; push heavy logic into script/composables
- Reactivity: `ref` for primitives; `reactive` for grouped state; prefer `computed` over `watch`
- When consuming Pinia state in components, use `storeToRefs(store)` before destructuring

## Routing (unplugin-vue-router)
- Pages live under `src/pages/**`. Group by section: `(client)/**` and `(admin)/**`
- Use typed params & inferred names from the plugin
- Add `meta.requiresAuth`, `meta.role`, `meta.section` as needed
- Client: **EN/TR** (no hard-coded strings). Admin: **EN-only**

## State Management — Pinia (Options API only)

### Store Pattern
```ts
export const useThingStore = defineStore('thing', {
  state: () => ({ /* light, persistent state only */ }),
  getters: { /* pure derivations */ },
  actions: {
    /* async actions that return Promise or Colada controller */
  }
})
```

### Rules
- No global `isLoading` flags for network calls in stores
- Mutate state **only** inside store actions
- Store actions that (re)fetch **must return** a **Query controller or Promise**

### Reference Implementation
```ts
// src/stores/inventory.ts (Options API)
import { defineStore } from 'pinia'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { supabase } from '@/lib/supabase'
import type { Product, ProductInsert, Variant, VariantInsert, CategoryWithProductsAndVariants, UpdateStockQuantityArgs } from '@/types'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({ selectedCategoryId: null as string | null }),
  getters: {},
  actions: {
    // READS → return controllers (caller owns loading/error/success)
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
        staleTime: 300_000
      })
    },

    // WRITES → return Promises; invalidate precise keys
    async createProduct(input: ProductInsert): Promise<Product> {
      const { data, error } = await supabase.from('products').insert([input]).select().single()
      if (error) throw error
      const created = data as Product
      const cache = useQueryCache()
      cache.invalidateQueries(['inventory', 'categories+products'])
      cache.invalidateQueries(['products'])
      cache.invalidateQueries(['products', created.id])
      return created
    }
  }
})
```

## Data Fetching — Pinia-Colada

### Query Keys
- **Always use functions** for reactive query keys
- **Include all dependencies** used in the query function
- Make keys depend on any variable used in the query

```typescript
// ✅ Correct
useQuery({
  key: () => ['products', route.params.id, filters.category],
  query: () => getProductById(route.params.id, filters.category),
})

// ❌ Wrong
useQuery({
  key: ['products'], // Missing dependencies
  query: () => getProductById(route.params.id),
})
```

### Query State Management
- Use `refresh()` for normal refreshes (respects staleTime, reuses loading requests)
- Use `refetch()` only when forcing a new request regardless of current status
- Handle both `state.status` (data status) and `asyncStatus` (query call status)

```typescript
const { data, error, status, isLoading, asyncStatus, refresh, refetch } = useQuery({
  key: () => ['todos'],
  query: () => fetchTodos(),
  staleTime: 300_000
})

// Preferred for most cases
await refresh()

// Only when forcing a fresh request
await refetch()
```

### Reusable Queries
Create composables for common query patterns:

```typescript
// composables/useProducts.ts
export function useProducts() {
  return useQuery({
    key: () => ['products'],
    query: () => supabase.from('products').select('*'),
  })
}

// composables/useProduct.ts
export function useProduct(id: Ref<string>) {
  return useQuery({
    key: () => ['products', id.value],
    query: () => supabase.from('products').select('*').eq('id', id.value).single(),
  })
}
```

### Mutations
- Use mutations for data modifications
- Invalidate related queries after successful mutations
- Handle optimistic updates when appropriate
- Use `mutate` for fire-and-forget operations
- Use `mutateAsync` when you need to await the result

```typescript
import {useMutation,useQueryCache} from 'pinia/colada'
const queryCache = useQueryCache()

// Basic mutation usage
const { mutate: createProduct, mutateAsync: createProductAsync, isLoading } = useMutation({
  mutation: (product: CreateProductInput) => 
    supabase.from('products').insert(product),
  onSuccess: () => {
    queryCache.invalidateQueries(['products'])
  }
})

// Fire-and-forget
mutate(newProduct)

// Async with error handling
try {
  const result = await mutateAsync(newProduct)
  // Handle success
} catch (error) {
  // Handle error
}
```

### Refetch Rule (Enforced)
Any action that (re)fetches **returns** a controller or Promise:

```ts
// inside store
refreshById(id: string) {
  return queryCache.refresh(['things', id]) // Promise the caller awaits
}
```

## UI State Management — ConditionalContent (Required)

Always wrap data views with ConditionalContent:

```vue
<ConditionalContent
  :is-loading="q.isLoading"
  :has-error="q.status==='error'"
  :error="q.error"
  :retry="q.refresh"
  :is-empty="Array.isArray(q.data) ? q.data.length===0 : !q.data"
  empty-title="No items"
  empty-message="Create your first item."
  empty-icon="package"
>
  <ItemList :items="q.data!" />
</ConditionalContent>
```

### Multi-query Pages
- Combine `isLoading` with `||`
- Combine `error` with `??`
- `retry` calls each controller's `refresh()`
- Allowed icon strings: `database|search|file|users|package|calendar|bell|settings|inbox`

## Supabase Integration

### Database Types
- Use generated types from `database.types.ts`
- Create wrapper types in `types/index.ts` for enhanced functionality
- Leverage Supabase's built-in TypeScript support
- Wrap the Supabase client in `src/lib/*` typed helpers
- Keep component/store code free of raw SQL strings when practical
- For inserts that should return rows, use `.insert(...).select().single()` (v2 behavior)

```typescript
// types/index.ts
import type { Tables,TablesUpdate } from './database.types'

export type User = Tables<'users'>
export type CreateUserInput = TablesUpdate<'users'>
```

### Query Patterns
```typescript
// ✅ Proper Supabase + Pinia Colada integration
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
    }
  })
}
```

## Internationalization (i18n)

### Structure
```
i18n/
├── index.ts         # Global i18n configuration
├── locales/
│   ├── en.ts        # English translations
│   └── tr.ts        # Turkish translations

component or view folder
└── i18n/          # Component-specific translations
    ├── auth.ts
    └── products.ts
```

### Usage Pattern
- Always use scoped messages for better maintainability
- Reference locale files in global configuration
- Use composition API with `useI18n`
- Client: EN & TR; no hard-coded user-facing text. Admin: English only
- Keep locale keys consistent and descriptive
- Wrap date/number formatting in i18n-aware utils

```vue
<!-- Component usage -->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { authMessages } from '@/.../i18n/auth'

const { t } = useI18n({
  messages: {
    en: authMessages.en,
    tr: authMessages.tr
  }
})
</script>

<template>
  <h1>{{ t('welcome') }}</h1>
</template>
```

## Form Handling

### Required Stack
- **shadcn-vue forms** for UI components
- **vee-validate** for form validation
- **Zod** for schema validation

```vue
<!-- ✅ Standard form pattern -->
<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod'
  import { useForm } from 'vee-validate'
  import { h } from 'vue'
  import {z} from 'zod'

  import { Button } from '@/components/ui/button'
  import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form'
  import { Input } from '@/components/ui/input'
  import { toast } from '@/components/ui/toast/use-toast'

  const formSchema = toTypedSchema(z.object({
    username: z.string().min(2).max(50),
  }))

  const { isFieldDirty, handleSubmit } = useForm({
    validationSchema: formSchema,
  })

  const onSubmit = handleSubmit((values) => {
    toast({
      title: 'You submitted the following values:',
      description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))),
    })
  })
</script>

<template>
  <form class="w-2/3 space-y-6" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="username" :validate-on-blur="!isFieldDirty">
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input type="text" placeholder="shadcn" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          This is your public display name.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit">
      Submit
    </Button>
  </form>
</template>
```

## Component Guidelines

### shadcn-vue Components
- All UI components are located in `@/components/ui`
- Import components individually: `import { Button } from '@/components/ui/button'`
- Use shadcn-vue primitives; customize via props/variants, not ad-hoc CSS
- Use tokens/CSS vars only: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `ring-ring`, etc.
- Prefer **light borders/dividers** over heavy shadows; maintain a clear visual hierarchy
- Keep accessible focus states; never remove outlines without a visible replacement

### Composable Guidelines
- Create only when reused ≥2 places or they materially simplify complex components
- **Always check existing composables** before creating new ones
- Prefer composition over inheritance
- Create focused, single-responsibility composables
- Input/output must be typed
- Composables must not leak raw Supabase client unless they are domain lib wrappers

```typescript
// ✅ Good - focused composable
export function useProductFilters() {
  const filters = ref({ category: '', priceRange: [0, 1000] })
  const filteredProducts = computed(() => {
    /* filtering logic would go here */
    return products.value.filter(p => p.category === filters.value.category)
  })
  
  return { filters, filteredProducts }
}

// ❌ Avoid - overly broad composable
export function useEverythingRelatedToProducts() {
  // Too many responsibilities
}
```

## Date Handling
- **Always use date-fns** for date operations
- Create utility functions for common date patterns
- Handle timezone considerations for Turkish/English locales

```typescript
// composables/useLocaleFormatter.ts
// formatting functionality that depends on locale should make use of the useLocaleFormatter()
```

## Error Handling
- Throw `Error` objects (never raw strings)
- Map to user-facing text in UI (i18n on Client)
- Components render errors exclusively via `ConditionalContent`'s error slot
- Provide `retry` where safe

## UI/UX Guidelines

### Design Principles
- **Clean and Modern**: Use shadcn-vue's design system consistently
- **Responsive**: Ensure mobile-first responsive design
- **Accessible**: Follow WCAG guidelines, use semantic HTML
- **Performance**: Lazy load components, optimize images
- **Theme-aware**: All UI must support dark/light themes

### Tailwind Usage
- Use Tailwind's utilities consistently
- Create component variants through class composition
- Avoid custom CSS unless absolutely necessary
- Use theme tokens only, no hardcoded colors

## Performance Guidelines
- Use `defineAsyncComponent` for code splitting
- Implement proper loading states with Pinia Colada
- Optimize images and assets
- Use `v-memo` for expensive computations
- Code-split large views with `defineAsyncComponent`
- Tune `staleTime` realistically; avoid chatty re-fetch loops
- Prefer DB views/RPCs for heavy joins; index frequently queried columns

## Testing & Linting
- ESLint: `eslint-plugin-vue`, `@typescript-eslint`. Prettier aligned with **100** column width
- `vue-tsc` in CI for type checks
- Unit test stores and `src/lib/*`; smoke test critical pages
- Mock Supabase in tests

## Best Practices Summary

### Vue 3 & TypeScript
- Use Composition API with `<script lang="ts" setup>`
- Prefer `ref()` and `reactive()` appropriately
- Use proper type definitions for props and emits
- Leverage Vue's built-in TypeScript support

### Code Quality
- Follow ESLint and Prettier configurations
- Write descriptive commit messages
- Use meaningful variable and function names
- Document complex business logic

## PR Hygiene
- Small, single-concern PRs
- Checklist: centralized types used; queries/mutations follow patterns; `ConditionalContent` wraps data UIs; i18n keys added; theme tokens only; tests updated

## Development Workflow
1. **Check existing composables** before creating new ones
2. **Define types** in `types/index.ts` before implementation
3. **Create reusable queries** for common data access patterns
4. **Implement proper error handling** for all async operations
5. **Ensure both Turkish and English locales** for new & existing features
6. **Ensure responsive design** across different screen sizes
7. **Use ConditionalContent** for all data UIs
8. **Follow file-based routing** patterns

## Banned Practices (Enforced)
- React/Next/JSX/TSX
- Manual vue-router arrays
- Blanket cache invalidation
- Global store loading flags
- Heavy shadows
- Hardcoded colors
- Duplicative composables
- `any` type usage
- Unreviewed `@ts-ignore` usage
- Composition API stores (Options API only)
- Direct Supabase imports outside of centralized types
- UI components without theme awareness