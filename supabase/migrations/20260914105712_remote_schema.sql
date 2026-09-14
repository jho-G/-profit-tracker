


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


CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "private"."user_restaurant_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select p.restaurant_id
  from public.profiles p
  where p.id = (select auth.uid())
    and p.role = 'owner'
  limit 1;
$$;


ALTER FUNCTION "private"."user_restaurant_id"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "restaurant_id" "uuid",
    "description" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "expenses_amount_check" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_daily_availability" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "available_date" "date" NOT NULL,
    "available" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_daily_availability" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_price_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "old_cost_price" numeric(10,2) NOT NULL,
    "old_selling_price" numeric(10,2) NOT NULL,
    "new_cost_price" numeric(10,2) NOT NULL,
    "new_selling_price" numeric(10,2) NOT NULL,
    "changed_by" "uuid",
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_price_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "restaurant_id" "uuid",
    "name" "text" NOT NULL,
    "cost_price" numeric(10,2) NOT NULL,
    "selling_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "description" "text",
    "category" "text",
    "image_url" "text",
    "active" boolean DEFAULT true NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "restaurant_id" "uuid",
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "phone" "text",
    "role" "text" DEFAULT 'owner'::"text" NOT NULL,
    CONSTRAINT "profiles_role_check" CHECK (("role" = 'owner'::"text"))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."restaurants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."restaurants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "restaurant_id" "uuid",
    "product_id" "uuid",
    "quantity" integer NOT NULL,
    "sold_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "product_name_snapshot" "text",
    "cost_price_snapshot" numeric(10,2),
    "selling_price_snapshot" numeric(10,2),
    "profit" numeric(10,2),
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sales_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."sales" OWNER TO "postgres";


ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_daily_availability"
    ADD CONSTRAINT "product_daily_availability_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_daily_availability"
    ADD CONSTRAINT "product_daily_availability_product_id_available_date_key" UNIQUE ("product_id", "available_date");



ALTER TABLE ONLY "public"."product_price_history"
    ADD CONSTRAINT "product_price_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_daily_availability_product_date" ON "public"."product_daily_availability" USING "btree" ("product_id", "available_date");



CREATE INDEX "idx_price_history_changed_at" ON "public"."product_price_history" USING "btree" ("changed_at");



CREATE INDEX "idx_price_history_product" ON "public"."product_price_history" USING "btree" ("product_id");



CREATE INDEX "idx_products_active" ON "public"."products" USING "btree" ("active");



CREATE INDEX "idx_products_restaurant" ON "public"."products" USING "btree" ("restaurant_id");



CREATE INDEX "idx_sales_product" ON "public"."sales" USING "btree" ("product_id");



CREATE INDEX "idx_sales_restaurant" ON "public"."sales" USING "btree" ("restaurant_id");



CREATE INDEX "idx_sales_sold_at" ON "public"."sales" USING "btree" ("sold_at");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_daily_availability"
    ADD CONSTRAINT "product_daily_availability_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_price_history"
    ADD CONSTRAINT "product_price_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_price_history"
    ADD CONSTRAINT "product_price_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



CREATE POLICY "Owners can create price history" ON "public"."product_price_history" FOR INSERT TO "authenticated" WITH CHECK ((("changed_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_price_history"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")))))));



CREATE POLICY "Owners can create product availability" ON "public"."product_daily_availability" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_daily_availability"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id"))))));



CREATE POLICY "Owners can create restaurant expenses" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK ((("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")) AND ("created_by" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Owners can create restaurant products" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")));



CREATE POLICY "Owners can create restaurant sales" ON "public"."sales" FOR INSERT TO "authenticated" WITH CHECK ((("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")) AND ("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "sales"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")))))));



CREATE POLICY "Owners can delete price history" ON "public"."product_price_history" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_price_history"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id"))))));



CREATE POLICY "Owners can delete product availability" ON "public"."product_daily_availability" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_daily_availability"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id"))))));



CREATE POLICY "Owners can delete restaurant expenses" ON "public"."expenses" FOR DELETE TO "authenticated" USING (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")));



CREATE POLICY "Owners can delete restaurant products" ON "public"."products" FOR DELETE TO "authenticated" USING (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")));



CREATE POLICY "Owners can delete restaurant sales" ON "public"."sales" FOR DELETE TO "authenticated" USING (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")));



CREATE POLICY "Owners can update price history" ON "public"."product_price_history" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_price_history"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_price_history"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id"))))));



CREATE POLICY "Owners can update product availability" ON "public"."product_daily_availability" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_daily_availability"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_daily_availability"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id"))))));



CREATE POLICY "Owners can update restaurant expenses" ON "public"."expenses" FOR UPDATE TO "authenticated" USING (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id"))) WITH CHECK (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")));



CREATE POLICY "Owners can update restaurant products" ON "public"."products" FOR UPDATE TO "authenticated" USING (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id"))) WITH CHECK (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")));



CREATE POLICY "Owners can update restaurant sales" ON "public"."sales" FOR UPDATE TO "authenticated" USING (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id"))) WITH CHECK ((("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "sales"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")))))));



CREATE POLICY "Owners can update their profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Owners can view price history" ON "public"."product_price_history" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_price_history"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id"))))));



CREATE POLICY "Owners can view product availability" ON "public"."product_daily_availability" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_daily_availability"."product_id") AND ("p"."restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id"))))));



CREATE POLICY "Owners can view restaurant expenses" ON "public"."expenses" FOR SELECT TO "authenticated" USING (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")));



CREATE POLICY "Owners can view restaurant products" ON "public"."products" FOR SELECT TO "authenticated" USING (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")));



CREATE POLICY "Owners can view restaurant sales" ON "public"."sales" FOR SELECT TO "authenticated" USING (("restaurant_id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")));



CREATE POLICY "Owners can view their profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Owners can view their restaurant" ON "public"."restaurants" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "private"."user_restaurant_id"() AS "user_restaurant_id")));



ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_daily_availability" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_price_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."restaurants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sales" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "private" TO "authenticated";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































REVOKE ALL ON FUNCTION "private"."user_restaurant_id"() FROM PUBLIC;
GRANT ALL ON FUNCTION "private"."user_restaurant_id"() TO "authenticated";


















GRANT ALL ON TABLE "public"."expenses" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."expenses" TO "authenticated";



GRANT ALL ON TABLE "public"."product_daily_availability" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."product_daily_availability" TO "authenticated";



GRANT ALL ON TABLE "public"."product_price_history" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."product_price_history" TO "authenticated";



GRANT ALL ON TABLE "public"."products" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."products" TO "authenticated";



GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT SELECT,UPDATE ON TABLE "public"."profiles" TO "authenticated";



GRANT ALL ON TABLE "public"."restaurants" TO "service_role";
GRANT SELECT ON TABLE "public"."restaurants" TO "authenticated";



GRANT ALL ON TABLE "public"."sales" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."sales" TO "authenticated";









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































