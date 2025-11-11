CREATE TABLE "ad_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"website" text,
	"ad_format" text NOT NULL,
	"ad_position" text NOT NULL,
	"campaign_duration" text NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"ad_images" json DEFAULT '[]'::json NOT NULL,
	"ad_click_url" text NOT NULL,
	"base_price" text NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"currency_amount" text NOT NULL,
	"exchange_rate" text,
	"payment_method" text NOT NULL,
	"payment_reference" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_processed_at" timestamp,
	"campaign_status" text DEFAULT 'draft' NOT NULL,
	"approval_status" text DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"activated_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_claims" ADD COLUMN "currency" text DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "company_claims" ADD COLUMN "currency_amount" text;--> statement-breakpoint
ALTER TABLE "company_claims" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "company_claims" ADD COLUMN "payment_reference" text;--> statement-breakpoint
ALTER TABLE "company_claims" ADD COLUMN "payment_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "company_listings" ADD COLUMN "currency" text DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "company_listings" ADD COLUMN "currency_amount" text;--> statement-breakpoint
ALTER TABLE "company_listings" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "industry_waitlist" ADD COLUMN "currency" text DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "industry_waitlist" ADD COLUMN "currency_amount" text;--> statement-breakpoint
ALTER TABLE "industry_waitlist" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "industry_waitlist" ADD COLUMN "payment_reference" text;--> statement-breakpoint
ALTER TABLE "industry_waitlist" ADD COLUMN "payment_status" text DEFAULT 'pending';