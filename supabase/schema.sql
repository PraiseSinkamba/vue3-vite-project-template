

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."generate_appointment_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.appointment_number IS NULL THEN
        NEW.appointment_number := 'APT-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || 
                                 LPAD((SELECT COUNT(*) + 1 FROM appointments 
                                       WHERE DATE(created_at) = DATE(NEW.created_at))::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_appointment_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_invoice_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || 
                             LPAD((SELECT COUNT(*) + 1 FROM invoices 
                                   WHERE DATE(created_at) = DATE(NEW.created_at))::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_invoice_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_unique_filename"("original_filename" "text", "user_id" "uuid" DEFAULT NULL::"uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    file_extension TEXT;
    base_name TEXT;
    unique_name TEXT;
BEGIN
    -- Extract file extension
    file_extension := lower(substring(original_filename from '\.([^.]*)$'));
    
    -- Extract base name without extension
    base_name := regexp_replace(original_filename, '\.[^.]*$', '');
    
    -- Generate unique filename with timestamp
    unique_name := CASE 
        WHEN user_id IS NOT NULL THEN
            user_id::text || '/' || extract(epoch from now())::bigint || '_' || 
            regexp_replace(lower(base_name), '[^a-z0-9_-]', '_', 'g') || 
            CASE WHEN file_extension IS NOT NULL THEN '.' || file_extension ELSE '' END
        ELSE
            extract(epoch from now())::bigint || '_' || 
            regexp_replace(lower(base_name), '[^a-z0-9_-]', '_', 'g') || 
            CASE WHEN file_extension IS NOT NULL THEN '.' || file_extension ELSE '' END
    END;
    
    RETURN unique_name;
END;
$_$;


ALTER FUNCTION "public"."generate_unique_filename"("original_filename" "text", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_file_url"("bucket_name" "text", "file_path" "text", "expires_in" integer DEFAULT 3600) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- For public buckets, return public URL
    IF bucket_name IN ('avatars', 'service-gallery', 'product-images', 'system-assets') THEN
        RETURN 'https://your-supabase-url.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
    ELSE
        -- For private buckets, return signed URL (this would be handled in your application)
        RETURN 'https://your-supabase-url.supabase.co/storage/v1/object/sign/' || bucket_name || '/' || file_path || '?expires_in=' || expires_in;
    END IF;
END;
$$;


ALTER FUNCTION "public"."get_file_url"("bucket_name" "text", "file_path" "text", "expires_in" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.email = 'malumbosink@gmail.com' THEN 'admin'
            ELSE 'client'
        END
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    -- Create loyalty account for new clients
    IF NEW.email != 'malumbosink@gmail.com' THEN
        INSERT INTO loyalty_accounts (client_id)
        VALUES (NEW.id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff_role"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_id
      AND p.role IN ('admin','technician')
  );
$$;


ALTER FUNCTION "public"."is_staff_role"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_loyalty_points"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update loyalty account when invoice is created
    INSERT INTO loyalty_accounts (client_id, current_balance, visit_count, total_spent)
    VALUES (NEW.client_id, NEW.loyalty_points_earned, 1, NEW.total_amount)
    ON CONFLICT (client_id) DO UPDATE SET
        total_points_earned = loyalty_accounts.total_points_earned + NEW.loyalty_points_earned,
        total_points_used = loyalty_accounts.total_points_used + COALESCE(NEW.loyalty_points_used, 0),
        current_balance = loyalty_accounts.current_balance + NEW.loyalty_points_earned - COALESCE(NEW.loyalty_points_used, 0),
        visit_count = loyalty_accounts.visit_count + 1,
        total_spent = loyalty_accounts.total_spent + NEW.total_amount,
        updated_at = NOW();
    
    -- Log loyalty transaction
    IF NEW.loyalty_points_earned > 0 THEN
        INSERT INTO loyalty_transactions (client_id, invoice_id, transaction_type, points, description)
        VALUES (NEW.client_id, NEW.id, 'earned', NEW.loyalty_points_earned, 
                'Points earned from invoice ' || NEW.invoice_number);
    END IF;
    
    IF NEW.loyalty_points_used > 0 THEN
        INSERT INTO loyalty_transactions (client_id, invoice_id, transaction_type, points, description)
        VALUES (NEW.client_id, NEW.id, 'redeemed', -NEW.loyalty_points_used, 
                'Points redeemed for invoice ' || NEW.invoice_number);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_loyalty_points"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."addon_products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "addon_id" "uuid",
    "product_id" "uuid",
    "typical_quantity" numeric(10,2),
    "is_required" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."addon_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."addons" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "name_tr" "text",
    "description" "text",
    "additional_time_minutes" integer DEFAULT 0,
    "price_type" "text" DEFAULT 'fixed'::"text",
    "price" numeric(10,2),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "addons_price_type_check" CHECK (("price_type" = ANY (ARRAY['fixed'::"text", 'starting_price'::"text", 'variable'::"text"])))
);


ALTER TABLE "public"."addons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointment_addons" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "appointment_id" "uuid",
    "addon_id" "uuid",
    "quantity" integer DEFAULT 1,
    "negotiated_price" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."appointment_addons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "appointment_number" "text" NOT NULL,
    "client_id" "uuid",
    "technician_id" "uuid" NOT NULL,
    "appointment_date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "duration_minutes" integer NOT NULL,
    "service_id" "uuid",
    "bundle_id" "uuid",
    "quoted_price" numeric(10,2),
    "final_price" numeric(10,2),
    "client_name" "text" NOT NULL,
    "client_phone" "text" NOT NULL,
    "client_whatsapp" "text",
    "client_email" "text",
    "inspiration_image_url" "text",
    "special_requests" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "whatsapp_negotiation_notes" "text",
    "internal_notes" "text",
    "final_design_image_url" "text",
    "completion_notes" "text",
    "referred_by_client_id" "uuid",
    "friend_booking" boolean DEFAULT false,
    "friend_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "appointments_check" CHECK (((("service_id" IS NOT NULL) AND ("bundle_id" IS NULL)) OR (("service_id" IS NULL) AND ("bundle_id" IS NOT NULL)))),
    CONSTRAINT "appointments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'in_progress'::"text", 'completed'::"text", 'cancelled'::"text", 'no_show'::"text"])))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "whatsapp_number" "text",
    "role" "text" DEFAULT 'client'::"text",
    "avatar_url" "text",
    "preferred_language" "text" DEFAULT 'en'::"text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_preferred_language_check" CHECK (("preferred_language" = ANY (ARRAY['en'::"text", 'tr'::"text"]))),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'technician'::"text", 'client'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_bundles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "name_tr" "text",
    "description" "text",
    "bundle_type" "text" DEFAULT 'sum_of_parts'::"text",
    "base_price" numeric(10,2),
    "total_duration_minutes" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "service_bundles_bundle_type_check" CHECK (("bundle_type" = ANY (ARRAY['sum_of_parts'::"text", 'fixed_price'::"text", 'starting_price'::"text"])))
);


ALTER TABLE "public"."service_bundles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category_id" "uuid",
    "name" "text" NOT NULL,
    "name_tr" "text",
    "description" "text",
    "duration_minutes" integer NOT NULL,
    "base_price" numeric(10,2) NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."appointment_calendar" AS
 SELECT "a"."id",
    "a"."appointment_number",
    "a"."appointment_date",
    "a"."start_time",
    "a"."end_time",
    "a"."duration_minutes",
    "a"."client_name",
    "a"."client_phone",
    "a"."status",
    "s"."name" AS "service_name",
    "sb"."name" AS "bundle_name",
    "a"."quoted_price",
    "a"."final_price",
    "p"."full_name" AS "technician_name"
   FROM ((("public"."appointments" "a"
     LEFT JOIN "public"."services" "s" ON (("a"."service_id" = "s"."id")))
     LEFT JOIN "public"."service_bundles" "sb" ON (("a"."bundle_id" = "sb"."id")))
     LEFT JOIN "public"."profiles" "p" ON (("a"."technician_id" = "p"."id")))
  WHERE ("a"."status" <> 'cancelled'::"text");


ALTER VIEW "public"."appointment_calendar" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."availability_schedules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "technician_id" "uuid",
    "day_of_week" integer,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "availability_schedules_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."availability_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bundle_services" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "bundle_id" "uuid",
    "service_id" "uuid",
    "quantity" integer DEFAULT 1
);


ALTER TABLE "public"."bundle_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "technician_id" "uuid",
    "business_name" "text" DEFAULT 'Melody Nails'::"text",
    "slot_duration" integer DEFAULT 30,
    "advance_booking_days" integer DEFAULT 30,
    "is_accepting_bookings" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."business_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_dual_forms" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid",
    "hand_type" "text" NOT NULL,
    "thumb_size" "text",
    "index_size" "text",
    "middle_size" "text",
    "ring_size" "text",
    "pinky_size" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "client_dual_forms_hand_type_check" CHECK (("hand_type" = ANY (ARRAY['left'::"text", 'right'::"text"])))
);


ALTER TABLE "public"."client_dual_forms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invoice_number" "text" NOT NULL,
    "appointment_id" "uuid",
    "client_id" "uuid",
    "subtotal" numeric(10,2) NOT NULL,
    "discount_amount" numeric(10,2) DEFAULT 0,
    "total_amount" numeric(10,2) NOT NULL,
    "payment_method" "text" DEFAULT 'cash'::"text",
    "payment_status" "text" DEFAULT 'paid'::"text",
    "loyalty_points_earned" integer DEFAULT 0,
    "loyalty_points_used" integer DEFAULT 0,
    "discount_type" "text",
    "notes" "text",
    "issued_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "invoices_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['loyalty'::"text", 'referral'::"text", 'frequency'::"text", 'friends'::"text", 'manual'::"text"]))),
    CONSTRAINT "invoices_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['cash'::"text", 'card'::"text", 'bank_transfer'::"text", 'other'::"text"]))),
    CONSTRAINT "invoices_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'partial'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."loyalty_accounts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid",
    "total_points_earned" integer DEFAULT 0,
    "total_points_used" integer DEFAULT 0,
    "current_balance" integer DEFAULT 0,
    "visit_count" integer DEFAULT 0,
    "total_spent" numeric(10,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."loyalty_accounts" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."client_history" AS
 SELECT "p"."id" AS "client_id",
    "p"."full_name",
    "p"."phone",
    "count"("a"."id") AS "total_appointments",
    "count"(
        CASE
            WHEN ("a"."status" = 'completed'::"text") THEN 1
            ELSE NULL::integer
        END) AS "completed_appointments",
    "sum"(
        CASE
            WHEN ("i"."payment_status" = 'paid'::"text") THEN "i"."total_amount"
            ELSE (0)::numeric
        END) AS "total_spent",
    "la"."current_balance" AS "loyalty_points",
    "max"("a"."appointment_date") AS "last_visit"
   FROM ((("public"."profiles" "p"
     LEFT JOIN "public"."appointments" "a" ON (("p"."id" = "a"."client_id")))
     LEFT JOIN "public"."invoices" "i" ON (("a"."id" = "i"."appointment_id")))
     LEFT JOIN "public"."loyalty_accounts" "la" ON (("p"."id" = "la"."client_id")))
  WHERE ("p"."role" = 'client'::"text")
  GROUP BY "p"."id", "p"."full_name", "p"."phone", "la"."current_balance";


ALTER VIEW "public"."client_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "name_tr" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "variant_name" "text" NOT NULL,
    "variant_name_tr" "text",
    "sku" "text",
    "current_quantity" integer DEFAULT 0,
    "stock_level" "text" DEFAULT 'in_stock'::"text",
    "reorder_point" integer,
    "cost_price" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_variants_stock_level_check" CHECK (("stock_level" = ANY (ARRAY['in_stock'::"text", 'low'::"text", 'out_of_stock'::"text"])))
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category_id" "uuid",
    "name" "text" NOT NULL,
    "name_tr" "text",
    "description" "text",
    "brand" "text",
    "product_type" "text" NOT NULL,
    "track_usage" boolean DEFAULT true,
    "track_quantity" boolean DEFAULT true,
    "unit_type" "text" DEFAULT 'piece'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "products_product_type_check" CHECK (("product_type" = ANY (ARRAY['polygel'::"text", 'gel_polish'::"text", 'chrome'::"text", 'decoration'::"text", 'tool'::"text", 'other'::"text"]))),
    CONSTRAINT "products_unit_type_check" CHECK (("unit_type" = ANY (ARRAY['piece'::"text", 'bottle'::"text", 'gram'::"text", 'ml'::"text", 'set'::"text"])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."inventory_status" AS
 SELECT "p"."name" AS "product_name",
    "pc"."name" AS "category_name",
    "pv"."variant_name",
    "pv"."current_quantity",
    "pv"."stock_level",
    "pv"."reorder_point",
        CASE
            WHEN ("pv"."current_quantity" <= COALESCE("pv"."reorder_point", 0)) THEN 'needs_reorder'::"text"
            WHEN ("pv"."stock_level" = 'low'::"text") THEN 'low_stock'::"text"
            ELSE 'good'::"text"
        END AS "status_alert"
   FROM (("public"."products" "p"
     JOIN "public"."product_categories" "pc" ON (("p"."category_id" = "pc"."id")))
     JOIN "public"."product_variants" "pv" ON (("p"."id" = "pv"."product_id")))
  WHERE ("p"."track_quantity" = true)
  ORDER BY
        CASE "pv"."stock_level"
            WHEN 'out_of_stock'::"text" THEN 1
            WHEN 'low'::"text" THEN 2
            ELSE 3
        END, "p"."name", "pv"."variant_name";


ALTER VIEW "public"."inventory_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invoice_id" "uuid",
    "item_type" "text" NOT NULL,
    "item_id" "uuid",
    "item_name" "text" NOT NULL,
    "quantity" integer DEFAULT 1,
    "unit_price" numeric(10,2) NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "invoice_items_item_type_check" CHECK (("item_type" = ANY (ARRAY['service'::"text", 'addon'::"text", 'bundle'::"text"])))
);


ALTER TABLE "public"."invoice_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_product_usage" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invoice_id" "uuid",
    "product_variant_id" "uuid",
    "quantity_used" numeric(10,2),
    "notes" "text",
    "tracked_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."invoice_product_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."loyalty_transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid",
    "invoice_id" "uuid",
    "transaction_type" "text" NOT NULL,
    "points" integer NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "loyalty_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['earned'::"text", 'redeemed'::"text", 'expired'::"text", 'bonus'::"text"])))
);


ALTER TABLE "public"."loyalty_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "notification_type" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "scheduled_for" timestamp with time zone,
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_notification_type_check" CHECK (("notification_type" = ANY (ARRAY['appointment'::"text", 'reminder'::"text", 'system'::"text", 'inventory'::"text", 'payment'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "referrer_id" "uuid",
    "referred_id" "uuid",
    "appointment_id" "uuid",
    "referral_bonus_points" integer DEFAULT 0,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "rewarded_at" timestamp with time zone,
    CONSTRAINT "referrals_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'rewarded'::"text"])))
);


ALTER TABLE "public"."referrals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "name_tr" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."service_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "service_id" "uuid",
    "product_id" "uuid",
    "typical_quantity" numeric(10,2),
    "is_required" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."service_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."unavailable_periods" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "technician_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "start_datetime" timestamp with time zone NOT NULL,
    "end_datetime" timestamp with time zone NOT NULL,
    "period_type" "text" DEFAULT 'other'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "unavailable_periods_period_type_check" CHECK (("period_type" = ANY (ARRAY['exam'::"text", 'study'::"text", 'vacation'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."unavailable_periods" OWNER TO "postgres";


ALTER TABLE ONLY "public"."addon_products"
    ADD CONSTRAINT "addon_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."addons"
    ADD CONSTRAINT "addons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointment_addons"
    ADD CONSTRAINT "appointment_addons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_appointment_number_key" UNIQUE ("appointment_number");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."availability_schedules"
    ADD CONSTRAINT "availability_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bundle_services"
    ADD CONSTRAINT "bundle_services_bundle_id_service_id_key" UNIQUE ("bundle_id", "service_id");



ALTER TABLE ONLY "public"."bundle_services"
    ADD CONSTRAINT "bundle_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_settings"
    ADD CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_dual_forms"
    ADD CONSTRAINT "client_dual_forms_client_id_hand_type_key" UNIQUE ("client_id", "hand_type");



ALTER TABLE ONLY "public"."client_dual_forms"
    ADD CONSTRAINT "client_dual_forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_product_usage"
    ADD CONSTRAINT "invoice_product_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_accounts"
    ADD CONSTRAINT "loyalty_accounts_client_id_key" UNIQUE ("client_id");



ALTER TABLE ONLY "public"."loyalty_accounts"
    ADD CONSTRAINT "loyalty_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_transactions"
    ADD CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referrer_id_referred_id_key" UNIQUE ("referrer_id", "referred_id");



ALTER TABLE ONLY "public"."service_bundles"
    ADD CONSTRAINT "service_bundles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_categories"
    ADD CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_products"
    ADD CONSTRAINT "service_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."unavailable_periods"
    ADD CONSTRAINT "unavailable_periods_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_appointments_client" ON "public"."appointments" USING "btree" ("client_id");



CREATE INDEX "idx_appointments_date_time" ON "public"."appointments" USING "btree" ("appointment_date", "start_time");



CREATE INDEX "idx_appointments_number" ON "public"."appointments" USING "btree" ("appointment_number");



CREATE INDEX "idx_appointments_status" ON "public"."appointments" USING "btree" ("status");



CREATE INDEX "idx_appointments_technician" ON "public"."appointments" USING "btree" ("technician_id");



CREATE INDEX "idx_invoices_client" ON "public"."invoices" USING "btree" ("client_id");



CREATE INDEX "idx_invoices_date" ON "public"."invoices" USING "btree" ("issued_at");



CREATE INDEX "idx_invoices_number" ON "public"."invoices" USING "btree" ("invoice_number");



CREATE INDEX "idx_loyalty_accounts_client" ON "public"."loyalty_accounts" USING "btree" ("client_id");



CREATE INDEX "idx_loyalty_transactions_client" ON "public"."loyalty_transactions" USING "btree" ("client_id");



CREATE INDEX "idx_product_variants_product" ON "public"."product_variants" USING "btree" ("product_id");



CREATE INDEX "idx_product_variants_stock" ON "public"."product_variants" USING "btree" ("stock_level");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_phone" ON "public"."profiles" USING "btree" ("phone");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE OR REPLACE TRIGGER "generate_appointment_number_trigger" BEFORE INSERT ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."generate_appointment_number"();



CREATE OR REPLACE TRIGGER "generate_invoice_number_trigger" BEFORE INSERT ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."generate_invoice_number"();



CREATE OR REPLACE TRIGGER "update_appointments_updated_at" BEFORE UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_loyalty_points_trigger" AFTER INSERT ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."update_loyalty_points"();



CREATE OR REPLACE TRIGGER "update_product_variants_updated_at" BEFORE UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."addon_products"
    ADD CONSTRAINT "addon_products_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."addon_products"
    ADD CONSTRAINT "addon_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_addons"
    ADD CONSTRAINT "appointment_addons_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id");



ALTER TABLE ONLY "public"."appointment_addons"
    ADD CONSTRAINT "appointment_addons_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "public"."service_bundles"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_referred_by_client_id_fkey" FOREIGN KEY ("referred_by_client_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."availability_schedules"
    ADD CONSTRAINT "availability_schedules_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bundle_services"
    ADD CONSTRAINT "bundle_services_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "public"."service_bundles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bundle_services"
    ADD CONSTRAINT "bundle_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_settings"
    ADD CONSTRAINT "business_settings_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_dual_forms"
    ADD CONSTRAINT "client_dual_forms_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_product_usage"
    ADD CONSTRAINT "invoice_product_usage_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_product_usage"
    ADD CONSTRAINT "invoice_product_usage_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."loyalty_accounts"
    ADD CONSTRAINT "loyalty_accounts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loyalty_transactions"
    ADD CONSTRAINT "loyalty_transactions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loyalty_transactions"
    ADD CONSTRAINT "loyalty_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_products"
    ADD CONSTRAINT "service_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_products"
    ADD CONSTRAINT "service_products_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id");



ALTER TABLE ONLY "public"."unavailable_periods"
    ADD CONSTRAINT "unavailable_periods_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins & staff can manage profiles" ON "public"."profiles" USING ("public"."is_staff_role"("auth"."uid"())) WITH CHECK ("public"."is_staff_role"("auth"."uid"()));



CREATE POLICY "Admins can view audit logs" ON "public"."audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text")))));



CREATE POLICY "Anonymous can create appointments" ON "public"."appointments" FOR INSERT WITH CHECK (("auth"."uid"() IS NULL));



CREATE POLICY "Clients can create appointments" ON "public"."appointments" FOR INSERT WITH CHECK (("client_id" = "auth"."uid"()));



CREATE POLICY "Clients can manage own dual forms" ON "public"."client_dual_forms" USING (("client_id" = "auth"."uid"()));



CREATE POLICY "Clients can view own appointments" ON "public"."appointments" FOR SELECT USING (("client_id" = "auth"."uid"()));



CREATE POLICY "Clients can view own invoices" ON "public"."invoices" FOR SELECT USING (("client_id" = "auth"."uid"()));



CREATE POLICY "Clients can view own loyalty account" ON "public"."loyalty_accounts" FOR SELECT USING (("client_id" = "auth"."uid"()));



CREATE POLICY "Clients can view own loyalty accounts" ON "public"."loyalty_accounts" FOR SELECT USING (("client_id" = "auth"."uid"()));



CREATE POLICY "Clients can view own loyalty transactions" ON "public"."loyalty_transactions" FOR SELECT USING (("client_id" = "auth"."uid"()));



CREATE POLICY "Clients can view their own appointments" ON "public"."appointments" FOR SELECT USING (("client_id" = "auth"."uid"()));



CREATE POLICY "Everyone can view addons" ON "public"."addons" FOR SELECT USING (true);



CREATE POLICY "Everyone can view bundle services" ON "public"."bundle_services" FOR SELECT USING (true);



CREATE POLICY "Everyone can view product categories" ON "public"."product_categories" FOR SELECT USING (true);



CREATE POLICY "Everyone can view product variants" ON "public"."product_variants" FOR SELECT USING (true);



CREATE POLICY "Everyone can view products" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Everyone can view service bundles" ON "public"."service_bundles" FOR SELECT USING (true);



CREATE POLICY "Everyone can view service categories" ON "public"."service_categories" FOR SELECT USING (true);



CREATE POLICY "Everyone can view services" ON "public"."services" FOR SELECT USING (true);



CREATE POLICY "Match appointment addon permissions" ON "public"."appointment_addons" USING ((EXISTS ( SELECT 1
   FROM "public"."appointments" "a"
  WHERE (("a"."id" = "appointment_addons"."appointment_id") AND (("a"."client_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))))))));



CREATE POLICY "Match invoice item permissions" ON "public"."invoice_items" USING ((EXISTS ( SELECT 1
   FROM "public"."invoices" "i"
  WHERE (("i"."id" = "invoice_items"."invoice_id") AND (("i"."client_id" = "auth"."uid"()) OR "public"."is_staff_role"("auth"."uid"())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."invoices" "i"
  WHERE (("i"."id" = "invoice_items"."invoice_id") AND (("i"."client_id" = "auth"."uid"()) OR "public"."is_staff_role"("auth"."uid"()))))));



CREATE POLICY "Match invoice product usage permissions" ON "public"."invoice_product_usage" USING ((EXISTS ( SELECT 1
   FROM "public"."invoices" "i"
  WHERE (("i"."id" = "invoice_product_usage"."invoice_id") AND (("i"."client_id" = "auth"."uid"()) OR "public"."is_staff_role"("auth"."uid"())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."invoices" "i"
  WHERE (("i"."id" = "invoice_product_usage"."invoice_id") AND (("i"."client_id" = "auth"."uid"()) OR "public"."is_staff_role"("auth"."uid"()))))));



CREATE POLICY "Match invoice usage permissions" ON "public"."invoice_product_usage" USING ((EXISTS ( SELECT 1
   FROM "public"."invoices" "i"
  WHERE (("i"."id" = "invoice_product_usage"."invoice_id") AND (("i"."client_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))))))));



CREATE POLICY "Referral clients can view" ON "public"."appointments" FOR SELECT USING (("referred_by_client_id" = "auth"."uid"()));



CREATE POLICY "Staff can manage addon products" ON "public"."addon_products" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage addons" ON "public"."addons" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage all appointments" ON "public"."appointments" USING (("public"."is_staff_role"("auth"."uid"()) OR ("technician_id" = "auth"."uid"()))) WITH CHECK (("public"."is_staff_role"("auth"."uid"()) OR ("technician_id" = "auth"."uid"())));



CREATE POLICY "Staff can manage all dual forms" ON "public"."client_dual_forms" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage all invoices" ON "public"."invoices" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage availability" ON "public"."availability_schedules" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage availability schedules" ON "public"."availability_schedules" USING ("public"."is_staff_role"("auth"."uid"())) WITH CHECK ("public"."is_staff_role"("auth"."uid"()));



CREATE POLICY "Staff can manage bundle services" ON "public"."bundle_services" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage business settings" ON "public"."business_settings" USING ("public"."is_staff_role"("auth"."uid"())) WITH CHECK ("public"."is_staff_role"("auth"."uid"()));



CREATE POLICY "Staff can manage invoices" ON "public"."invoices" USING ("public"."is_staff_role"("auth"."uid"())) WITH CHECK ("public"."is_staff_role"("auth"."uid"()));



CREATE POLICY "Staff can manage loyalty accounts" ON "public"."loyalty_accounts" USING ("public"."is_staff_role"("auth"."uid"())) WITH CHECK ("public"."is_staff_role"("auth"."uid"()));



CREATE POLICY "Staff can manage loyalty transactions" ON "public"."loyalty_transactions" USING ("public"."is_staff_role"("auth"."uid"())) WITH CHECK ("public"."is_staff_role"("auth"."uid"()));



CREATE POLICY "Staff can manage notifications" ON "public"."notifications" USING ("public"."is_staff_role"("auth"."uid"())) WITH CHECK ("public"."is_staff_role"("auth"."uid"()));



CREATE POLICY "Staff can manage product categories" ON "public"."product_categories" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage product variants" ON "public"."product_variants" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage products" ON "public"."products" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage referrals" ON "public"."referrals" USING ("public"."is_staff_role"("auth"."uid"())) WITH CHECK ("public"."is_staff_role"("auth"."uid"()));



CREATE POLICY "Staff can manage service bundles" ON "public"."service_bundles" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage service categories" ON "public"."service_categories" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage service products" ON "public"."service_products" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage services" ON "public"."services" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can manage unavailable periods" ON "public"."unavailable_periods" USING ("public"."is_staff_role"("auth"."uid"())) WITH CHECK ("public"."is_staff_role"("auth"."uid"()));



CREATE POLICY "Staff can view addon products" ON "public"."addon_products" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Staff can view service products" ON "public"."service_products" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Technicians and admins can view all appointments" ON "public"."appointments" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'technician'::"text"]))))));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own referrals" ON "public"."referrals" FOR SELECT USING ((("referrer_id" = "auth"."uid"()) OR ("referred_id" = "auth"."uid"())));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."addon_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."addons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointment_addons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."availability_schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bundle_services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_dual_forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_product_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."referrals" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."service_bundles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."service_categories" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."service_products" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."unavailable_periods" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."generate_appointment_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_appointment_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_appointment_number"() TO "service_role";

GRANT ALL ON FUNCTION "public"."generate_invoice_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_invoice_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_invoice_number"() TO "service_role";

GRANT ALL ON FUNCTION "public"."generate_unique_filename"("original_filename" "text", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_filename"("original_filename" "text", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_filename"("original_filename" "text", "user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_file_url"("bucket_name" "text", "file_path" "text", "expires_in" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_file_url"("bucket_name" "text", "file_path" "text", "expires_in" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_file_url"("bucket_name" "text", "file_path" "text", "expires_in" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_staff_role"("user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_staff_role"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_staff_role"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_staff_role"("user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."update_loyalty_points"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_loyalty_points"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_loyalty_points"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

GRANT ALL ON TABLE "public"."addon_products" TO "anon";
GRANT ALL ON TABLE "public"."addon_products" TO "authenticated";
GRANT ALL ON TABLE "public"."addon_products" TO "service_role";

GRANT ALL ON TABLE "public"."addons" TO "anon";
GRANT ALL ON TABLE "public"."addons" TO "authenticated";
GRANT ALL ON TABLE "public"."addons" TO "service_role";

GRANT ALL ON TABLE "public"."appointment_addons" TO "anon";
GRANT ALL ON TABLE "public"."appointment_addons" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_addons" TO "service_role";

GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."service_bundles" TO "anon";
GRANT ALL ON TABLE "public"."service_bundles" TO "authenticated";
GRANT ALL ON TABLE "public"."service_bundles" TO "service_role";

GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";

GRANT ALL ON TABLE "public"."appointment_calendar" TO "anon";
GRANT ALL ON TABLE "public"."appointment_calendar" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_calendar" TO "service_role";

GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";

GRANT ALL ON TABLE "public"."availability_schedules" TO "anon";
GRANT ALL ON TABLE "public"."availability_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_schedules" TO "service_role";

GRANT ALL ON TABLE "public"."bundle_services" TO "anon";
GRANT ALL ON TABLE "public"."bundle_services" TO "authenticated";
GRANT ALL ON TABLE "public"."bundle_services" TO "service_role";

GRANT ALL ON TABLE "public"."business_settings" TO "anon";
GRANT ALL ON TABLE "public"."business_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."business_settings" TO "service_role";

GRANT ALL ON TABLE "public"."client_dual_forms" TO "anon";
GRANT ALL ON TABLE "public"."client_dual_forms" TO "authenticated";
GRANT ALL ON TABLE "public"."client_dual_forms" TO "service_role";

GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";

GRANT ALL ON TABLE "public"."loyalty_accounts" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_accounts" TO "service_role";

GRANT ALL ON TABLE "public"."client_history" TO "anon";
GRANT ALL ON TABLE "public"."client_history" TO "authenticated";
GRANT ALL ON TABLE "public"."client_history" TO "service_role";

GRANT ALL ON TABLE "public"."product_categories" TO "anon";
GRANT ALL ON TABLE "public"."product_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."product_categories" TO "service_role";

GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";

GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";

GRANT ALL ON TABLE "public"."inventory_status" TO "anon";
GRANT ALL ON TABLE "public"."inventory_status" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_status" TO "service_role";

GRANT ALL ON TABLE "public"."invoice_items" TO "anon";
GRANT ALL ON TABLE "public"."invoice_items" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_items" TO "service_role";

GRANT ALL ON TABLE "public"."invoice_product_usage" TO "anon";
GRANT ALL ON TABLE "public"."invoice_product_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_product_usage" TO "service_role";

GRANT ALL ON TABLE "public"."loyalty_transactions" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_transactions" TO "service_role";

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";

GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";

GRANT ALL ON TABLE "public"."service_categories" TO "anon";
GRANT ALL ON TABLE "public"."service_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."service_categories" TO "service_role";

GRANT ALL ON TABLE "public"."service_products" TO "anon";
GRANT ALL ON TABLE "public"."service_products" TO "authenticated";
GRANT ALL ON TABLE "public"."service_products" TO "service_role";

GRANT ALL ON TABLE "public"."unavailable_periods" TO "anon";
GRANT ALL ON TABLE "public"."unavailable_periods" TO "authenticated";
GRANT ALL ON TABLE "public"."unavailable_periods" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

RESET ALL;