export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      addon_images: {
        Row: {
          addon_id: string | null
          alt_text: string | null
          alt_text_tr: string | null
          created_at: string | null
          description: string | null
          description_tr: string | null
          display_order: number | null
          id: string
          image_path: string
          image_url: string
          is_active: boolean | null
          is_featured: boolean | null
          title: string | null
          title_tr: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          addon_id?: string | null
          alt_text?: string | null
          alt_text_tr?: string | null
          created_at?: string | null
          description?: string | null
          description_tr?: string | null
          display_order?: number | null
          id?: string
          image_path: string
          image_url: string
          is_active?: boolean | null
          is_featured?: boolean | null
          title?: string | null
          title_tr?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          addon_id?: string | null
          alt_text?: string | null
          alt_text_tr?: string | null
          created_at?: string | null
          description?: string | null
          description_tr?: string | null
          display_order?: number | null
          id?: string
          image_path?: string
          image_url?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          title?: string | null
          title_tr?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addon_images_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addon_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "addon_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      addon_products: {
        Row: {
          addon_id: string | null
          created_at: string | null
          id: string
          is_required: boolean | null
          product_id: string | null
          typical_quantity: number | null
        }
        Insert: {
          addon_id?: string | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          product_id?: string | null
          typical_quantity?: number | null
        }
        Update: {
          addon_id?: string | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          product_id?: string | null
          typical_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "addon_products_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addon_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      addons: {
        Row: {
          additional_time_minutes: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          name_tr: string | null
          price: number | null
          price_type: string | null
          updated_at: string | null
        }
        Insert: {
          additional_time_minutes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_tr?: string | null
          price?: number | null
          price_type?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_time_minutes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_tr?: string | null
          price?: number | null
          price_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      appointment_addons: {
        Row: {
          addon_id: string | null
          appointment_id: string | null
          created_at: string | null
          id: string
          negotiated_price: number | null
          quantity: number | null
        }
        Insert: {
          addon_id?: string | null
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          negotiated_price?: number | null
          quantity?: number | null
        }
        Update: {
          addon_id?: string | null
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          negotiated_price?: number | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_addons_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_addons_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_number: string
          bundle_id: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          client_phone: string
          client_whatsapp: string | null
          completion_notes: string | null
          created_at: string | null
          duration_minutes: number
          end_time: string
          final_design_image_url: string | null
          final_price: number | null
          friend_booking: boolean | null
          friend_count: number | null
          id: string
          inspiration_image_url: string | null
          internal_notes: string | null
          quoted_price: number | null
          referred_by_client_id: string | null
          service_id: string | null
          special_requests: string | null
          start_time: string
          status: string | null
          technician_id: string
          updated_at: string | null
          whatsapp_negotiation_notes: string | null
        }
        Insert: {
          appointment_date: string
          appointment_number: string
          bundle_id?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          client_phone: string
          client_whatsapp?: string | null
          completion_notes?: string | null
          created_at?: string | null
          duration_minutes: number
          end_time: string
          final_design_image_url?: string | null
          final_price?: number | null
          friend_booking?: boolean | null
          friend_count?: number | null
          id?: string
          inspiration_image_url?: string | null
          internal_notes?: string | null
          quoted_price?: number | null
          referred_by_client_id?: string | null
          service_id?: string | null
          special_requests?: string | null
          start_time: string
          status?: string | null
          technician_id: string
          updated_at?: string | null
          whatsapp_negotiation_notes?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_number?: string
          bundle_id?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string
          client_whatsapp?: string | null
          completion_notes?: string | null
          created_at?: string | null
          duration_minutes?: number
          end_time?: string
          final_design_image_url?: string | null
          final_price?: number | null
          friend_booking?: boolean | null
          friend_count?: number | null
          id?: string
          inspiration_image_url?: string | null
          internal_notes?: string | null
          quoted_price?: number | null
          referred_by_client_id?: string | null
          service_id?: string | null
          special_requests?: string | null
          start_time?: string
          status?: string | null
          technician_id?: string
          updated_at?: string | null
          whatsapp_negotiation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "service_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_referred_by_client_id_fkey"
            columns: ["referred_by_client_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointments_referred_by_client_id_fkey"
            columns: ["referred_by_client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_gallery_view"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          technician_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          technician_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_schedules_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "availability_schedules_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_services: {
        Row: {
          bundle_id: string | null
          id: string
          quantity: number | null
          service_id: string | null
        }
        Insert: {
          bundle_id?: string | null
          id?: string
          quantity?: number | null
          service_id?: string | null
        }
        Update: {
          bundle_id?: string | null
          id?: string
          quantity?: number | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_services_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "service_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_gallery_view"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "bundle_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          advance_booking_days: number | null
          business_name: string | null
          created_at: string | null
          id: string
          is_accepting_bookings: boolean | null
          slot_duration: number | null
          technician_id: string | null
          updated_at: string | null
        }
        Insert: {
          advance_booking_days?: number | null
          business_name?: string | null
          created_at?: string | null
          id?: string
          is_accepting_bookings?: boolean | null
          slot_duration?: number | null
          technician_id?: string | null
          updated_at?: string | null
        }
        Update: {
          advance_booking_days?: number | null
          business_name?: string | null
          created_at?: string | null
          id?: string
          is_accepting_bookings?: boolean | null
          slot_duration?: number | null
          technician_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_settings_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "business_settings_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_dual_forms: {
        Row: {
          client_id: string | null
          created_at: string | null
          hand_type: string
          id: string
          index_size: string | null
          middle_size: string | null
          notes: string | null
          pinky_size: string | null
          ring_size: string | null
          thumb_size: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          hand_type: string
          id?: string
          index_size?: string | null
          middle_size?: string | null
          notes?: string | null
          pinky_size?: string | null
          ring_size?: string | null
          thumb_size?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          hand_type?: string
          id?: string
          index_size?: string | null
          middle_size?: string | null
          notes?: string | null
          pinky_size?: string | null
          ring_size?: string | null
          thumb_size?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_dual_forms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_dual_forms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      image_metadata: {
        Row: {
          created_at: string | null
          file_size: number | null
          height: number | null
          id: string
          image_url: string
          is_optimized: boolean | null
          mime_type: string | null
          original_filename: string | null
          storage_bucket: string | null
          storage_path: string | null
          thumbnail_url: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          image_url: string
          is_optimized?: boolean | null
          mime_type?: string | null
          original_filename?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          image_url?: string
          is_optimized?: boolean | null
          mime_type?: string | null
          original_filename?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          width?: number | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          id: string
          invoice_id: string | null
          item_id: string | null
          item_name: string
          item_type: string
          quantity: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          item_id?: string | null
          item_name: string
          item_type: string
          quantity?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          item_id?: string | null
          item_name?: string
          item_type?: string
          quantity?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_product_usage: {
        Row: {
          created_at: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          product_variant_id: string | null
          quantity_used: number | null
          tracked_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          product_variant_id?: string | null
          quantity_used?: number | null
          tracked_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          product_variant_id?: string | null
          quantity_used?: number | null
          tracked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_product_usage_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_product_usage_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          created_at: string | null
          discount_amount: number | null
          discount_type: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          loyalty_points_earned: number | null
          loyalty_points_used: number | null
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          subtotal: number
          total_amount: number
        }
        Insert: {
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          loyalty_points_earned?: number | null
          loyalty_points_used?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          subtotal: number
          total_amount: number
        }
        Update: {
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          loyalty_points_earned?: number | null
          loyalty_points_used?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          subtotal?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_accounts: {
        Row: {
          client_id: string | null
          created_at: string | null
          current_balance: number | null
          id: string
          total_points_earned: number | null
          total_points_used: number | null
          total_spent: number | null
          updated_at: string | null
          visit_count: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          total_points_earned?: number | null
          total_points_used?: number | null
          total_spent?: number | null
          updated_at?: string | null
          visit_count?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          total_points_earned?: number | null
          total_points_used?: number | null
          total_spent?: number | null
          updated_at?: string | null
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "loyalty_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          invoice_id: string | null
          points: number
          transaction_type: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          points: number
          transaction_type: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          points?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "loyalty_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          scheduled_for: string | null
          sent_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      past_work_gallery: {
        Row: {
          after_image_path: string
          after_image_url: string
          appointment_id: string | null
          approval_status: string | null
          approved_by: string | null
          before_image_path: string | null
          before_image_url: string | null
          category_id: string | null
          client_consent: boolean | null
          created_at: string | null
          description: string | null
          description_tr: string | null
          detail_images: Json | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          service_id: string | null
          tags: string[] | null
          tags_tr: string[] | null
          technique_notes: string | null
          title: string | null
          title_tr: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          after_image_path: string
          after_image_url: string
          appointment_id?: string | null
          approval_status?: string | null
          approved_by?: string | null
          before_image_path?: string | null
          before_image_url?: string | null
          category_id?: string | null
          client_consent?: boolean | null
          created_at?: string | null
          description?: string | null
          description_tr?: string | null
          detail_images?: Json | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          service_id?: string | null
          tags?: string[] | null
          tags_tr?: string[] | null
          technique_notes?: string | null
          title?: string | null
          title_tr?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          after_image_path?: string
          after_image_url?: string
          appointment_id?: string | null
          approval_status?: string | null
          approved_by?: string | null
          before_image_path?: string | null
          before_image_url?: string | null
          category_id?: string | null
          client_consent?: boolean | null
          created_at?: string | null
          description?: string | null
          description_tr?: string | null
          detail_images?: Json | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          service_id?: string | null
          tags?: string[] | null
          tags_tr?: string[] | null
          technique_notes?: string | null
          title?: string | null
          title_tr?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "past_work_gallery_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "past_work_gallery_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "past_work_gallery_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "past_work_gallery_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "past_work_gallery_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_gallery_view"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "past_work_gallery_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "past_work_gallery_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_gallery_view"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "past_work_gallery_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_gallery_view"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "past_work_gallery_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "past_work_gallery_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "past_work_gallery_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          name_tr: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          name_tr?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          name_tr?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          cost_price: number | null
          created_at: string | null
          current_quantity: number | null
          id: string
          product_id: string | null
          reorder_point: number | null
          sku: string | null
          stock_level: string | null
          updated_at: string | null
          variant_name: string
          variant_name_tr: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string | null
          current_quantity?: number | null
          id?: string
          product_id?: string | null
          reorder_point?: number | null
          sku?: string | null
          stock_level?: string | null
          updated_at?: string | null
          variant_name: string
          variant_name_tr?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string | null
          current_quantity?: number | null
          id?: string
          product_id?: string | null
          reorder_point?: number | null
          sku?: string | null
          stock_level?: string | null
          updated_at?: string | null
          variant_name?: string
          variant_name_tr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          name_tr: string | null
          product_type: string
          track_quantity: boolean | null
          track_usage: boolean | null
          unit_type: string | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          name_tr?: string | null
          product_type: string
          track_quantity?: boolean | null
          track_usage?: boolean | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          name_tr?: string | null
          product_type?: string
          track_quantity?: boolean | null
          track_usage?: boolean | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          preferred_language: string | null
          role: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          role?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          role?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          id: string
          referral_bonus_points: number | null
          referred_id: string | null
          referrer_id: string | null
          rewarded_at: string | null
          status: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          referral_bonus_points?: number | null
          referred_id?: string | null
          referrer_id?: string | null
          rewarded_at?: string | null
          status?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          referral_bonus_points?: number | null
          referred_id?: string | null
          referrer_id?: string | null
          rewarded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bundles: {
        Row: {
          base_price: number | null
          bundle_type: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          name_tr: string | null
          total_duration_minutes: number | null
        }
        Insert: {
          base_price?: number | null
          bundle_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_tr?: string | null
          total_duration_minutes?: number | null
        }
        Update: {
          base_price?: number | null
          bundle_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_tr?: string | null
          total_duration_minutes?: number | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          name_tr: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          name_tr?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          name_tr?: string | null
        }
        Relationships: []
      }
      service_category_images: {
        Row: {
          alt_text: string | null
          alt_text_tr: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          description_tr: string | null
          display_order: number | null
          id: string
          image_path: string
          image_url: string
          is_active: boolean | null
          is_hero_image: boolean | null
          title: string | null
          title_tr: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          alt_text_tr?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          description_tr?: string | null
          display_order?: number | null
          id?: string
          image_path: string
          image_url: string
          is_active?: boolean | null
          is_hero_image?: boolean | null
          title?: string | null
          title_tr?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          alt_text_tr?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          description_tr?: string | null
          display_order?: number | null
          id?: string
          image_path?: string
          image_url?: string
          is_active?: boolean | null
          is_hero_image?: boolean | null
          title?: string | null
          title_tr?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_category_images_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_gallery_view"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "service_category_images_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_category_images_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_gallery_view"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "service_category_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "service_category_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_images: {
        Row: {
          alt_text: string | null
          alt_text_tr: string | null
          created_at: string | null
          description: string | null
          description_tr: string | null
          display_order: number | null
          id: string
          image_path: string
          image_type: string | null
          image_url: string
          is_active: boolean | null
          is_featured: boolean | null
          service_id: string | null
          title: string | null
          title_tr: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          alt_text_tr?: string | null
          created_at?: string | null
          description?: string | null
          description_tr?: string | null
          display_order?: number | null
          id?: string
          image_path: string
          image_type?: string | null
          image_url: string
          is_active?: boolean | null
          is_featured?: boolean | null
          service_id?: string | null
          title?: string | null
          title_tr?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          alt_text_tr?: string | null
          created_at?: string | null
          description?: string | null
          description_tr?: string | null
          display_order?: number | null
          id?: string
          image_path?: string
          image_type?: string | null
          image_url?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          service_id?: string | null
          title?: string | null
          title_tr?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_images_image_url_fkey"
            columns: ["image_url"]
            isOneToOne: false
            referencedRelation: "image_metadata"
            referencedColumns: ["image_url"]
          },
          {
            foreignKeyName: "service_images_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_gallery_view"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_images_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "service_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_products: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          product_id: string | null
          service_id: string | null
          typical_quantity: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          product_id?: string | null
          service_id?: string | null
          typical_quantity?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          product_id?: string | null
          service_id?: string | null
          typical_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_products_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_gallery_view"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_products_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number
          category_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          name_tr: string | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          name_tr?: string | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          name_tr?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_gallery_view"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_gallery_view"
            referencedColumns: ["category_id"]
          },
        ]
      }
      unavailable_periods: {
        Row: {
          created_at: string | null
          description: string | null
          end_datetime: string
          id: string
          period_type: string | null
          start_datetime: string
          technician_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_datetime: string
          id?: string
          period_type?: string | null
          start_datetime: string
          technician_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_datetime?: string
          id?: string
          period_type?: string | null
          start_datetime?: string
          technician_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "unavailable_periods_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "client_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unavailable_periods_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      appointment_calendar: {
        Row: {
          appointment_date: string | null
          appointment_number: string | null
          bundle_name: string | null
          client_name: string | null
          client_phone: string | null
          duration_minutes: number | null
          end_time: string | null
          final_price: number | null
          id: string | null
          quoted_price: number | null
          service_name: string | null
          start_time: string | null
          status: string | null
          technician_name: string | null
        }
        Relationships: []
      }
      category_gallery_view: {
        Row: {
          category_id: string | null
          category_name: string | null
          category_name_tr: string | null
          created_at: string | null
          description: string | null
          featured_work_count: number | null
          hero_image_alt: string | null
          hero_image_title: string | null
          hero_image_url: string | null
          services_count: number | null
          total_images: number | null
        }
        Relationships: []
      }
      client_history: {
        Row: {
          client_id: string | null
          completed_appointments: number | null
          full_name: string | null
          last_visit: string | null
          loyalty_points: number | null
          phone: string | null
          total_appointments: number | null
          total_spent: number | null
        }
        Relationships: []
      }
      inventory_status: {
        Row: {
          category_name: string | null
          current_quantity: number | null
          product_name: string | null
          reorder_point: number | null
          status_alert: string | null
          stock_level: string | null
          variant_name: string | null
        }
        Relationships: []
      }
      service_gallery_view: {
        Row: {
          base_price: number | null
          category_id: string | null
          category_name: string | null
          category_name_tr: string | null
          created_at: string | null
          duration_minutes: number | null
          hero_image_alt: string | null
          hero_image_title: string | null
          hero_image_url: string | null
          is_active: boolean | null
          past_work_count: number | null
          service_description: string | null
          service_id: string | null
          service_name: string | null
          service_name_tr: string | null
          total_images: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_images_image_url_fkey"
            columns: ["hero_image_url"]
            isOneToOne: false
            referencedRelation: "image_metadata"
            referencedColumns: ["image_url"]
          },
        ]
      }
    }
    Functions: {
      bulk_upload_past_work: { Args: { work_items: Json }; Returns: number }
      create_image_metadata: {
        Args: {
          p_file_size?: number
          p_height?: number
          p_image_url: string
          p_mime_type?: string
          p_original_filename: string
          p_storage_bucket: string
          p_storage_path: string
          p_width?: number
        }
        Returns: string
      }
      generate_unique_filename: {
        Args: { original_filename: string; user_id?: string }
        Returns: string
      }
      get_file_url: {
        Args: { bucket_name: string; expires_in?: number; file_path: string }
        Returns: string
      }
      get_past_work_gallery: {
        Args: {
          p_category_id?: string
          p_featured_only?: boolean
          p_limit?: number
          p_offset?: number
          p_service_id?: string
          p_tags?: string[]
        }
        Returns: {
          after_image_url: string
          before_image_url: string
          category_name: string
          created_at: string
          description: string
          detail_images: Json
          id: string
          is_featured: boolean
          service_id: string
          service_name: string
          tags: string[]
          title: string
        }[]
      }
      get_service_images: {
        Args: { p_image_type?: string; p_limit?: number; p_service_id: string }
        Returns: {
          alt_text: string
          description: string
          display_order: number
          height: number
          id: string
          image_type: string
          image_url: string
          is_featured: boolean
          service_id: string
          thumbnail_url: string
          title: string
          width: number
        }[]
      }
      get_time_slots_for_day: {
        Args: {
          p_date: string
          p_service_duration_minutes?: number
          p_slot_interval_minutes?: number
          p_technician_id: string
        }
        Returns: {
          is_available: boolean
          reason: string
          time_slot: string
        }[]
      }
      is_staff_role: { Args: { user_id: string }; Returns: boolean }
      link_profile_to_auth: {
        Args: { profile_id: string; user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
