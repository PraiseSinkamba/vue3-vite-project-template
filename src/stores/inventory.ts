
import { defineStore } from 'pinia'
import type { Product, Category, AddOn, CategoryWithProducts, ProductInsert, VariantInsert, ProductUpdate, VariantUpdate } from '@/types'
import { useQuery } from '@pinia/colada'
import { supabase } from '@/lib/supabase'
import { toValue, type MaybeRefOrGetter } from 'vue'

export interface InventoryStore {
  products: Product[]
  categories: Category[]
  addons: AddOn[]
}

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryStore => ({
    products: [],
    categories: [],
    addons: [],
  }),
  getters: {
    categorizedProducts: (state): CategoryWithProducts[] => {
      let categories: CategoryWithProducts[] = []
      state.categories.forEach(category => {
        categories.push({
          ...category,
          products: state.products.filter(product => product.category_id === category.id)
        })
      })
      return categories.sort((a, b) => a.name.localeCompare(b.name))
    }
  },
  actions: {
    fetchProducts() {
      return useQuery({
        key: ['admin', 'products'],
        query: async () => {
          const { data, error } = await supabase
            .from('product_categories')
            .select('*,products(*,variants:product_variants(*))')

          if (error) throw error

          this.products = data.map(category => category.products).flat()
          this.categories = data.map(category => {
            category.products = []
            return category
          })
          return this.categories
        },
        initialData: () => this.categories || []
      })
    },
    fetchProductById(id: MaybeRefOrGetter<string>) {
      return useQuery<Product>({
        key: () => ['admin', 'products', toValue(id)],
        query: async () => {
          const { data, error } = await supabase.from('products')
            .select('*, variants:product_variants(*)')
            .eq('id', toValue(id))
            .single()
          if (error) {
            const product = this.products.find(product => product.id === toValue(id))
            if (product) return product
            else throw error
          }
          return data
        }
      })
    },
    fetchAddons() {
      return useQuery({
        key: ['admin', 'addons'],
        query: async () => {
          const { data, error } = await supabase.from('addons').select('*')
          if (error) throw error
          this.addons = data as AddOn[]
        }
      })
    },
    async createProduct(product: ProductInsert): Promise<{ data: Product | null, error: Error | null }> {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          name_tr: product.name_tr,
          description: product.description,
          brand: product.brand,
          category_id: product.category_id,
          product_type: product.product_type,
          track_usage: product.track_usage ?? false,
          track_quantity: product.track_quantity ?? false,
          unit_type: product.unit_type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        throw error
      }

      // Update local state
      if (data && data[0]) {
        this.products.push(data[0] as Product)
      }

      return { data, error }
    },
    async updateProduct(product: ProductUpdate): Promise<{ data: Product | null, error: Error | null }> {
      console.log(`'updating product' ${product.name}`)
      const { data, error } = await supabase
        .from('products')
        .update({
          id: product.id,
          name: product.name,
          name_tr: product.name_tr,
          description: product.description,
          brand: product.brand,
          category_id: product.category_id,
          product_type: product.product_type,
          track_usage: product.track_usage ?? false,
          track_quantity: product.track_quantity ?? false,
          unit_type: product.unit_type
        })
        .eq('id', product.id as string)
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        throw error
      }

      // Update local state
      if (data) {
        this.products = this.products.map(product => product.id === data.id ? data : product)
      }

      return { data, error }
    },
    async createOrUpadateProduct(product: ProductInsert | ProductUpdate) {
      if (product.id) {
        console.log('updating')
        return this.updateProduct(product as ProductUpdate)
      } else {
        console.log('creating')
        return this.createProduct(product as ProductInsert)
      }
    },
    async createVariants(variants: VariantInsert[]) {
      if (!variants || variants.length === 0) {
        return { data: [], error: null }
      }

      const variantsToInsert = variants.map(variant => ({
        product_id: variant.product_id,
        variant_name: variant.variant_name,
        variant_name_tr: variant.variant_name_tr,
        sku: variant.sku,
        current_quantity: variant.current_quantity,
        reorder_point: variant.reorder_point,
        cost_price: variant.cost_price,
        stock_level: variant.stock_level ?? 'in_stock',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from('product_variants')
        .insert(variantsToInsert)

      if (error) {
        console.error('Error creating variants:', error)
        throw error
      }

      return { data, error }
    },
    async updateVariants(variants: VariantUpdate[]) {
      if (!variants || variants.length === 0) {
        return { data: [], error: null }
      }

      const variantsToUpdate: VariantUpdate[] = variants.map(variant => ({
        id: variant.id,
        variant_name: variant.variant_name,
        variant_name_tr: variant.variant_name_tr,
        sku: variant.sku,
        current_quantity: variant.current_quantity,
        reorder_point: variant.reorder_point,
        cost_price: variant.cost_price,
        stock_level: variant.stock_level ?? 'in_stock',
        updated_at: new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from('product_variants')
        .upsert(variantsToUpdate, { onConflict: 'id' })
        .select()

      if (error) {
        console.error('Error updating variants:', error)
        throw error
      }

      return { data, error }
    },
    async createOrUpdateVariants(variants: VariantInsert[] | VariantUpdate[]) {
      if (!variants || variants.length === 0) {
        return { data: [], error: null }
      }
      if (variants.some(variant => variant.id)) {
        return this.updateVariants(variants as VariantUpdate[])
      } else {
        return this.createVariants(variants as VariantInsert[])
      }
    }
  },
  persist: {
    key: 'inventory',
    storage: localStorage,
  }
})
