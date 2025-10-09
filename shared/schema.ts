import { pgTable, text, integer, timestamp, json, varchar, serial, boolean, unique } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const sectors = pgTable('sectors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const industries = pgTable('industries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sectorName: text('sector_name').notNull(),
});

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  websiteUrl: text('website_url'),
  industryName: text('industry_name').notNull(),
  sectorName: text('sector_name').notNull(),
  // Enhanced company intelligence fields
  employeeCount: text('employee_count'), // e.g., "145,000+", "1,500+", "50-200"
  revenueEstimate: text('revenue_estimate'), // e.g., "$66.6B", "€59B", "$1.5B-$3B"
  foundedYear: integer('founded_year'), // e.g., 1916, 2008
  companySize: text('company_size'), // e.g., "Large Enterprise", "SME", "Conglomerate"
  specializationTags: text('specialization_tags'), // Comma-separated: "Film Production, Distribution, Franchise Management"
  verificationStatus: text('verification_status').default('unverified'), // 'verified', 'unverified', 'pending'
}, (table) => ({
  // Composite unique constraint: same company can exist in different sectors/industries
  // but prevents true duplicates (same name + sector + industry)
  uniqueCompanyIndustry: unique().on(table.name, table.sectorName, table.industryName),
}));

// Contact Messages table
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  contactType: text('contact_type').notNull(), // 'general', 'technical', 'business', 'listing'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Company Listings table
export const companyListings = pgTable('company_listings', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  websiteUrl: text('website_url').notNull(),
  contactEmail: text('contact_email').notNull(),
  sectorName: text('sector_name').notNull(),
  industryName: text('industry_name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  paymentAmount: text('payment_amount').notNull(), // Stored as string to preserve decimal precision
  paymentStatus: text('payment_status').default('pending').notNull(), // 'pending', 'completed', 'failed'
  paymentReference: text('payment_reference'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

// Waitlist for full industries
export const industryWaitlist = pgTable('industry_waitlist', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  websiteUrl: text('website_url').notNull(),
  contactEmail: text('contact_email').notNull(),
  sectorName: text('sector_name').notNull(),
  industryName: text('industry_name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  notified: timestamp('notified'),
});

// Company Claims table (for claiming existing company listings)
export const companyClaims = pgTable('company_claims', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull(), // Reference to existing company
  companyName: text('company_name').notNull(),
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  websiteUrl: text('website_url'),
  companyDescription: text('company_description').notNull(),
  logoImagePath: text('logo_image_path'),
  logoImageOriginalName: text('logo_image_original_name'),
  plan: text('plan').notNull(), // 'basic', 'premium', 'enterprise'
  status: text('status').default('pending').notNull(), // 'pending', 'approved', 'rejected', 'completed'
  adminNotes: text('admin_notes'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationCode: text('verification_code'),
  verificationSentAt: timestamp('verification_sent_at'),
  verificationExpiresAt: timestamp('verification_expires_at'),
});

// Banner Ads table for persistent banner ad management
export const bannerAds = pgTable('banner_ads', {
  id: serial('id').primaryKey(),
  position: text('position').notNull(), // 'left' or 'right'
  images: json('images').$type<string[]>().default([]).notNull(), // Array of image URLs
  imageUrls: json('image_urls').$type<string[]>().default([]).notNull(), // Individual URLs for each image
  clickUrl: text('click_url'),
  rotationInterval: integer('rotation_interval').default(7000).notNull(), // Milliseconds, default 7 seconds
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Ad Performance Analytics table
export const adAnalytics = pgTable('ad_analytics', {
  id: serial('id').primaryKey(),
  bannerId: integer('banner_id').notNull(), // Reference to banner_ads.id
  eventType: text('event_type').notNull(), // 'view', 'click', 'impression'
  imageUrl: text('image_url'), // Which specific image was interacted with
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  referrerPage: text('referrer_page'), // Which page the user was on
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Daily ad performance summary for efficient querying
export const adPerformanceSummary = pgTable('ad_performance_summary', {
  id: serial('id').primaryKey(),
  bannerId: integer('banner_id').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD format
  imageUrl: text('image_url'),
  impressions: integer('impressions').default(0).notNull(),
  views: integer('views').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  clickThroughRate: text('click_through_rate'), // Stored as string for precision
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Email Logs table for tracking sent emails
export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  recipientEmail: text('recipient_email').notNull(),
  senderEmail: text('sender_email').notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  emailType: text('email_type').notNull(), // 'waitlist_notification', 'claim_approval', etc.
  relatedId: integer('related_id'), // Reference to related record (waitlist ID, claim ID, etc.)
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  deliveryStatus: text('delivery_status').default('sent').notNull(), // 'sent', 'delivered', 'failed'
});

// App Initialization Metadata - for tracking database initialization state
export const appInitMeta = pgTable('app_init_meta', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(), // e.g., 'init_lock', 'core_data_seeded', 'banners_seeded_v1'
  value: text('value'), // optional value for the key
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Geographic tables for continent/region/country hierarchy
export const continents = pgTable('continents', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // e.g., 'Africa', 'Asia', 'Europe'
  slug: text('slug').notNull().unique(), // e.g., 'africa', 'asia', 'europe'
  code: text('code').notNull().unique(), // e.g., 'AF', 'AS', 'EU'
  description: text('description'),
});

export const regions = pgTable('regions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g., 'West Africa', 'Southeast Asia'
  slug: text('slug').notNull().unique(),
  continentId: integer('continent_id').notNull().references(() => continents.id), // FK to continents
  description: text('description'),
});

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // e.g., 'Nigeria', 'United States'
  slug: text('slug').notNull().unique(), // e.g., 'nigeria', 'united-states'
  iso2: text('iso2').notNull().unique(), // ISO 3166-1 alpha-2, e.g., 'NG', 'US'
  iso3: text('iso3').notNull().unique(), // ISO 3166-1 alpha-3, e.g., 'NGA', 'USA'
  phoneCode: text('phone_code'), // e.g., '+234', '+1'
  capital: text('capital'), // e.g., 'Abuja', 'Washington, D.C.'
  currency: text('currency'), // e.g., 'NGN', 'USD'
  regionId: integer('region_id').notNull().references(() => regions.id), // FK to regions
  continentId: integer('continent_id').notNull().references(() => continents.id), // FK to continents (denormalized for performance)
  flagEmoji: text('flag_emoji'), // e.g., '🇳🇬', '🇺🇸'
});

export const companyLocations = pgTable('company_locations', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id), // FK to companies
  countryId: integer('country_id').notNull().references(() => countries.id), // FK to countries
  city: text('city'), // Optional: e.g., 'Lagos', 'New York'
  state: text('state'), // Optional: e.g., 'Lagos State', 'NY'
  isPrimary: boolean('is_primary').default(true).notNull(), // Primary location for company
  confidence: text('confidence').default('low').notNull(), // 'high', 'medium', 'low', 'unassigned'
  source: text('source'), // 'tld', 'name_pattern', 'default_hub', 'manual', 'verified_csv'
  // Backup columns for old geocoding data (temporary during transition)
  oldCountryId: integer('old_country_id'), // Backup of original country assignment
  oldConfidence: text('old_confidence'), // Backup of original confidence level
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports
export type Sector = typeof sectors.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type CompanyListing = typeof companyListings.$inferSelect;
export type IndustryWaitlist = typeof industryWaitlist.$inferSelect;
export type CompanyClaim = typeof companyClaims.$inferSelect;
export type BannerAd = typeof bannerAds.$inferSelect;
export type AdAnalytics = typeof adAnalytics.$inferSelect;
export type AdPerformanceSummary = typeof adPerformanceSummary.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;
export type AppInitMeta = typeof appInitMeta.$inferSelect;
export type Continent = typeof continents.$inferSelect;
export type Region = typeof regions.$inferSelect;
export type Country = typeof countries.$inferSelect;
export type CompanyLocation = typeof companyLocations.$inferSelect;

export type InsertSector = typeof sectors.$inferInsert;
export type InsertIndustry = typeof industries.$inferInsert;
export type InsertCompany = typeof companies.$inferInsert;
export type InsertContactMessage = typeof contactMessages.$inferInsert;
export type InsertCompanyListing = typeof companyListings.$inferInsert;
export type InsertIndustryWaitlist = typeof industryWaitlist.$inferInsert;
export type InsertCompanyClaim = typeof companyClaims.$inferInsert;
export type InsertBannerAd = typeof bannerAds.$inferInsert;
export type InsertAdAnalytics = typeof adAnalytics.$inferInsert;
export type InsertAdPerformanceSummary = typeof adPerformanceSummary.$inferInsert;
export type InsertEmailLog = typeof emailLogs.$inferInsert;
export type InsertAppInitMeta = typeof appInitMeta.$inferInsert;
export type InsertContinent = typeof continents.$inferInsert;
export type InsertRegion = typeof regions.$inferInsert;
export type InsertCountry = typeof countries.$inferInsert;
export type InsertCompanyLocation = typeof companyLocations.$inferInsert;

// Zod schemas for validation
export const insertSectorSchema = createInsertSchema(sectors);
export const insertIndustrySchema = createInsertSchema(industries);
export const insertCompanySchema = createInsertSchema(companies);
export const insertContactMessageSchema = createInsertSchema(contactMessages).extend({
  contactType: z.enum(['General Inquiry', 'Company Listing', 'Technical Support', 'Partnership']),
});
export const insertCompanyListingSchema = createInsertSchema(companyListings);
export const insertIndustryWaitlistSchema = createInsertSchema(industryWaitlist);
export const insertCompanyClaimSchema = createInsertSchema(companyClaims);

export const selectSectorSchema = createSelectSchema(sectors);
export const selectIndustrySchema = createSelectSchema(industries);
export const selectCompanySchema = createSelectSchema(companies);
export const selectContactMessageSchema = createSelectSchema(contactMessages);
export const selectCompanyListingSchema = createSelectSchema(companyListings);
export const selectIndustryWaitlistSchema = createSelectSchema(industryWaitlist);
export const selectCompanyClaimSchema = createSelectSchema(companyClaims);
export const insertBannerAdSchema = createInsertSchema(bannerAds);
export const selectBannerAdSchema = createSelectSchema(bannerAds);
export const insertEmailLogSchema = createInsertSchema(emailLogs);
export const selectEmailLogSchema = createSelectSchema(emailLogs);
export const insertAppInitMetaSchema = createInsertSchema(appInitMeta);
export const selectAppInitMetaSchema = createSelectSchema(appInitMeta);
export const insertContinentSchema = createInsertSchema(continents);
export const selectContinentSchema = createSelectSchema(continents);
export const insertRegionSchema = createInsertSchema(regions);
export const selectRegionSchema = createSelectSchema(regions);
export const insertCountrySchema = createInsertSchema(countries);
export const selectCountrySchema = createSelectSchema(countries);
export const insertCompanyLocationSchema = createInsertSchema(companyLocations);
export const selectCompanyLocationSchema = createSelectSchema(companyLocations);