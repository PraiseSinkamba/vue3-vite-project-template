import type { User } from "@supabase/supabase-js";
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";
import type { UseMutationOptions } from "@pinia/colada";


export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>
export interface Client extends Tables<'profiles'> {
  role: 'client'
}
export type UploadResponse = { id: string; path: string; fullPath: string }

export type ClientInsert = ProfileInsert
export type ClientUpdate = ProfileUpdate

export type ProductInsert = TablesInsert<'products'>
export type ProductUpdate = TablesUpdate<'products'>
export type Variant = Tables<'product_variants'>
export type Product = Tables<'products'> & {
  variants?: Variant[]
}
export type VariantInsert = TablesInsert<'product_variants'>
export type VariantUpdate = TablesUpdate<'product_variants'>
export type Category = Tables<'product_categories'>
export type CategoryInsert = TablesInsert<'product_categories'>
export type AddOn = Tables<'addons'>
export type AddOnInsert = TablesInsert<'addons'>
export type AddOnProduct = Tables<'addon_products'>
export type AddOnImage = Tables<'addon_images'>

export type AppointmentAddOn = Tables<'appointment_addons'>
export type Appointment = Tables<'appointments'>
export type AppointmentInsert = TablesInsert<'appointments'>
export type AppointmentUpdate = TablesUpdate<'appointments'>
export type AppointmentCalendar = Tables<'appointment_calendar'>

export type CategoryWithProducts = Category & {
  products: Product[]
}

export type ServiceImage = Tables<'service_images'>
export type ServiceImageInsert = TablesInsert<'service_images'>
export type ServiceImageUpdate = TablesUpdate<'service_images'>

export type Service = Tables<'services'> & {
  service_products?: ServiceProduct[]
  service_images?: ServiceImage[]
  service_category?: ServiceCategory
}

export type ServiceInsert = TablesInsert<'services'>
export type ServiceUpdate = TablesUpdate<'services'>
export type ServiceProduct = Tables<'service_products'>
export type ServiceProductInsert = TablesInsert<'service_products'>
export type ServiceProductUpdate = TablesUpdate<'service_products'>
export type ServiceCategory = Tables<'service_categories'> & {
  services?: Service[]
}
export type ServiceCategoryInsert = TablesInsert<'service_categories'>
export type ServiceCategoryUpdate = TablesUpdate<'service_categories'>

export type ServiceBundle = Tables<'service_bundles'>

export type BusinessSettings = Tables<'business_settings'>
export type BusinessSettingsInsert = TablesInsert<'business_settings'>
export type BusinessSettingsUpdate = TablesUpdate<'business_settings'>

export type AvailabilitySchedule = Tables<'availability_schedules'>
export type AvailabilityScheduleInsert = TablesInsert<'availability_schedules'>
export type AvailabilityScheduleUpdate = TablesUpdate<'availability_schedules'>

export type UnavailablePeriod = Tables<'unavailable_periods'>
export type UnavailablePeriodInsert = TablesInsert<'unavailable_periods'>
export type UnavailablePeriodUpdate = TablesUpdate<'unavailable_periods'>

export interface AuthenticatedUser {
  user: User
  profile: Profile
}

export type ProfileRequest = TablesInsert<'profiles'>

export type MutationOptions<TData, TVariables, TError = Error> = Omit<
  UseMutationOptions<TData, TVariables, TError>,
  'mutation'
>
