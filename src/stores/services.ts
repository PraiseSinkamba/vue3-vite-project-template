import { defineStore } from "pinia";
import type { ServiceCategory, Service, ServiceBundle, ServiceInsert, ServiceProductInsert, ServiceProductUpdate, ServiceUpdate, ServiceCategoryInsert, ServiceCategoryUpdate, AddOn } from "@/types";
import { useQuery } from "@pinia/colada";
import { supabase } from "@/lib/supabase";
import { toValue, type MaybeRefOrGetter } from "vue";

interface ServiceStore {
  categories: ServiceCategory[]
  services: Service[]
  bundles: ServiceBundle[]
}

export const useServiceStore = defineStore('services', {
  state: (): ServiceStore => ({
    categories: [],
    services: [],
    bundles: []
  }),
  getters: {
    categorizedServices: (state) => {
      return state.categories.map(category => {
        return {
          ...category,
          services: state.services.filter(service => service.category_id === category.id)
        } as ServiceCategory
      })
    },
    servicesCount: (state) => state.services.length || 0
  },
  actions: {
    fetchServices() {
      return useQuery({
        key: ['admin', 'services'],
        query: async () => {
          const { data, error } = await supabase.from('service_categories')
            .select('*,services(*,service_products(*))')
          if (error) throw error
          this.services = data.map(category => category.services).flat()
          this.categories = data.map(category => {
            category.services = []
            return category
          })
          return this.categories
        },
        initialData: () => this.categories || []
      })
    },

    // Client-side: Fetch services with images grouped by category
    fetchServicesWithImages() {
      return useQuery({
        key: ['client', 'services', 'with-images'],
        query: async () => {
          const { data, error } = await supabase
            .from('service_categories')
            .select(`
              *,
              services(
                *,
                service_images(
                  *
                )
              )
            `)
            .order('name', { ascending: true })

          if (error) throw error

          // Filter out categories with no active services
          const categoriesWithServices = data
            .map(category => ({
              ...category,
              services: category.services?.filter(s => s.is_active) || []
            }))
            .filter(category => category.services.length > 0)
            .map(category => {
              if (category.services) {
                category.services.forEach(service => {
                  if (service.service_images) {
                    service.service_images.sort((a, b) =>
                      (a.display_order || 0) - (b.display_order || 0)
                    );
                  }
                });
              }
              return category
            })

          return categoriesWithServices as ServiceCategory[]
        },
        staleTime: 300_000, // 5 minutes
      })
    },
    async createService(serviceData: ServiceInsert) {
      console.log('create service', serviceData)
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single()
      console.log('created service', data)
      if (error) throw error
      return { data, error }
    },
    async createServiceProducts(serviceProducts: ServiceProductInsert[]) {
      const { data, error } = await supabase
        .from('service_products')
        .insert(serviceProducts)

      if (error) throw error
      return { data, error }
    },
    async updateService(serviceData: ServiceUpdate) {
      console.log('create service', serviceData)
      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', serviceData.id as string)
        .select()
        .single()
      console.log('created service', data)
      if (error) throw error
      return { data, error }
    },
    async updateServiceProducts(serviceProducts: ServiceProductUpdate[]) {
      const { data, error } = await supabase
        .from('service_products')
        .upsert(serviceProducts, { onConflict: 'id' })

      if (error) throw error
      return { data, error }
    },
    createOrUpdateService(serviceData: ServiceInsert | ServiceUpdate) {
      if (serviceData.id) {
        return this.updateService(serviceData as ServiceUpdate)
      } else {
        return this.createService(serviceData as ServiceInsert)
      }
    },
    createOrUpdateServiceProducts(serviceProducts: ServiceProductInsert[] | ServiceProductUpdate[]) {
      if (serviceProducts.some(sp => sp.id)) {
        return this.updateServiceProducts(serviceProducts as ServiceProductUpdate[])
      } else {
        return this.createServiceProducts(serviceProducts as ServiceProductInsert[])
      }
    },
    getServiceById(id: MaybeRefOrGetter<string>) {
      return useQuery({
        key: ['admin', 'service', toValue(id)],
        query: async () => {
          const { data, error } = await supabase.from('services')
            .select('*,service_products(*)').eq('id', toValue(id))
            .single()
          if (error) {
            const service = this.services.find(service => service.id === toValue(id))
            if (service) return service
            else throw error
          }
          if (this.services.length === 0) this.services.push(data)
          else this.services = this.services.map(service => service.id === toValue(id) ? data : service)

          return data
        }
      })
    },

    // Client-side: Fetch service with all related data (images, addons, category)
    fetchServiceDetailById(id: MaybeRefOrGetter<string>) {
      return useQuery({
        key: () => ['client', 'service-detail', toValue(id)],
        query: async () => {
          const { data, error } = await supabase
            .from('services')
            .select(`
              *,
              service_category:service_categories(
                id,
                name,
                name_tr
              ),
              service_images(
                *
              )
            `)
            .eq('id', toValue(id))
            .eq('is_active', true)
            .single()

          if (error) throw error

          // Sort images by display_order
          if (data.service_images) {
            data.service_images.sort((a, b) =>
              (a.display_order || 0) - (b.display_order || 0)
            )
          }

          return data as Service
        },
        staleTime: 300_000, // 5 minutes
      })
    },

    // Client-side: Fetch all active addons
    fetchAddons() {
      return useQuery({
        key: () => ['client', 'addons'],
        query: async () => {
          const { data, error } = await supabase
            .from('addons')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true })

          if (error) throw error
          return (data || []) as AddOn[]
        },
        staleTime: 300_000, // 5 minutes
      })
    },
    async saveServiceCategory(categoryData: ServiceCategoryInsert | ServiceCategoryUpdate) {
      const { data, error } = categoryData.id
        ? await supabase.from('service_categories').update(categoryData).eq('id', categoryData.id).select().single()
        : await supabase.from('service_categories').insert(categoryData as ServiceCategoryInsert).select().single()
      if (error) throw error
      return data
    },
  },
  // Persistence disabled to avoid caching issues with service images
  // persist: {
  //   key: 'services',
  //   storage: localStorage,
  // }
})
