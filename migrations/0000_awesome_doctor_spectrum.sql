CREATE TABLE "ad_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"banner_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"image_url" text,
	"user_agent" text,
	"ip_address" text,
	"referrer_page" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_performance_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"banner_id" integer NOT NULL,
	"date" text NOT NULL,
	"image_url" text,
	"impressions" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"click_through_rate" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_init_meta" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_init_meta_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "banner_ads" (
	"id" serial PRIMARY KEY NOT NULL,
	"position" text NOT NULL,
	"images" json DEFAULT '[]'::json NOT NULL,
	"image_urls" json DEFAULT '[]'::json NOT NULL,
	"click_url" text,
	"rotation_interval" integer DEFAULT 7000 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website_url" text,
	"industry_name" text NOT NULL,
	"sector_name" text NOT NULL,
	"employee_count" text,
	"revenue_estimate" text,
	"founded_year" integer,
	"company_size" text,
	"specialization_tags" text,
	"verification_status" text DEFAULT 'unverified',
	CONSTRAINT "companies_name_sector_name_industry_name_unique" UNIQUE("name","sector_name","industry_name")
);
--> statement-breakpoint
CREATE TABLE "company_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"website_url" text,
	"company_description" text NOT NULL,
	"logo_image_path" text,
	"logo_image_original_name" text,
	"plan" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"email_verified" boolean DEFAULT false NOT NULL,
	"verification_code" text,
	"verification_sent_at" timestamp,
	"verification_expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "company_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"website_url" text NOT NULL,
	"contact_email" text NOT NULL,
	"sector_name" text NOT NULL,
	"industry_name" text NOT NULL,
	"description" text,
	"logo_url" text,
	"payment_amount" text NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_reference" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"country_id" integer NOT NULL,
	"city" text,
	"state" text,
	"is_primary" boolean DEFAULT true NOT NULL,
	"confidence" text DEFAULT 'low' NOT NULL,
	"source" text,
	"old_country_id" integer,
	"old_confidence" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"contact_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "continents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	CONSTRAINT "continents_name_unique" UNIQUE("name"),
	CONSTRAINT "continents_slug_unique" UNIQUE("slug"),
	CONSTRAINT "continents_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"iso2" text NOT NULL,
	"iso3" text NOT NULL,
	"phone_code" text,
	"capital" text,
	"currency" text,
	"region_id" integer NOT NULL,
	"continent_id" integer NOT NULL,
	"flag_emoji" text,
	CONSTRAINT "countries_name_unique" UNIQUE("name"),
	CONSTRAINT "countries_slug_unique" UNIQUE("slug"),
	CONSTRAINT "countries_iso2_unique" UNIQUE("iso2"),
	CONSTRAINT "countries_iso3_unique" UNIQUE("iso3")
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient_email" text NOT NULL,
	"sender_email" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"email_type" text NOT NULL,
	"related_id" integer,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"delivery_status" text DEFAULT 'sent' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sector_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"website_url" text NOT NULL,
	"contact_email" text NOT NULL,
	"sector_name" text NOT NULL,
	"industry_name" text NOT NULL,
	"description" text,
	"logo_url" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"notified" timestamp
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"continent_id" integer NOT NULL,
	"description" text,
	CONSTRAINT "regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "sectors_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "company_locations" ADD CONSTRAINT "company_locations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_locations" ADD CONSTRAINT "company_locations_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "countries" ADD CONSTRAINT "countries_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "countries" ADD CONSTRAINT "countries_continent_id_continents_id_fk" FOREIGN KEY ("continent_id") REFERENCES "public"."continents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_continent_id_continents_id_fk" FOREIGN KEY ("continent_id") REFERENCES "public"."continents"("id") ON DELETE no action ON UPDATE no action;